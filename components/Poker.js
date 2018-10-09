const shuffle = require('lodash/shuffle')
const map = require('lodash/map')

import {createDeck, Joker}    from '../lib/deck'
import {wins, nullWin}        from '../lib/quick_poker'
import {
  roundToPrecision,
  logDeck,
  createBet,
  getKeyboardHandler,
}                             from '../lib/helpers'
import classify               from '../lib/classify'
import WinTable               from './WinTable'
import Card                   from './Card'
import StatusLine             from './Statusline'
import ControlButton          from './ControlButton'

const PokerTitle = () => <div className="title">QuickPoker</div>
const PokerInfo  = ({instruction}) => (
  <div className="info">{instruction}</div>
)
/**
 * TODO: Move to a more sensible place.
 * Joker is never actually added to or removed from the deck.
 * If it is not in play, it will be kept as the last card in deck:
 * order === deck.length - 1 while it is not in play
 * When it is added, it will be displayed before being put into deck
 * When last joker round is finished, it will be shown to be removed
 * 
 * Phase transitions
 *  roundFinished     =>  prepareShuffling  (animate moving to deck)
 *  prepareShuffling  =>  shuffling (shuffle, set position to deck)
 *  shuffling         =>  dealing (animate dealing)
 *  dealing           =>  handDealt (when cards revealed)
 *  handDealt         =>  choiceMade (move discarded to deck and spread chosen)
 *  choiceMade        =>  roundFinished (show results)
 *  
 */

class Game extends React.Component {
  constructor(props) {
    super(props)
    const baseDeck = createDeck().map((card, index) => ({
      ...card,
      position: 'deck',
      order   : index,
    }))
    const deck = [
      ...baseDeck,
      {
        ...Joker,
        position: 'initiallyHidden',
        order   : baseDeck.length
      }
    ]
    const orderArray = Array.from(
      {length: deck.length},
      (_, index) => index
    )
    this.state = {
      debugMode         : false,
      deck              : deck,
      orderArray        : orderArray,
      money             : 20,
      bet               : createBet(),
      jokerRounds       : 0,
      jokerInDeck       : false,
      removeJoker       : false,
      round             : 0,
      gamePhase         : 'roundFinished',
      choice            : null,
      result            : 'none',
      lastBetIndex      : 0,
      /* avoid flash of semi-rendered cards */
      deckTop           : 200,
      deckLeft          : -1000,
      tableTop          : 0,
    }

    this.instructionMap = {
      'roundFinished' : 'Click deck to deal or increase bet.',
      'handDealt'     : 'Select left or right stack',
      'left'          : 'Analyzing hand results',
      'right'         : 'Analyzing hand results',
    }


    // to simplify handleKeyDown
    this.keyToActionMap = {
      ' '         : 'newGame',
      'ArrowDown' : 'newGame',
      'ArrowLeft' : 'left',
      'ArrowRight': 'right',
      'ArrowUp'   : 'bet',
      '+'         : 'addMoney',
      'Add'       : 'addMoney',
      '*'         : 'addJokerRounds',
      'Multiply'  : 'addJokerRounds',
      '/'         : 'toggleDebugMode',
      'Divide'    : 'toggleDebugMode',
    }
    this.keyboardHandlerId  = null
    // bind event handlers
    this.handleResize   = this.handleResize.bind(this)
    this.handleClick    = this.handleClick.bind(this)
    this.handleKeyDown  = this.handleKeyDown.bind(this)
    this.handleResult   = this.handleResult.bind(this)
    // onClick wrappers for controls
    this.handleLeft   = () => this.handleAction('left')
    this.handleRight  = () => this.handleAction('right')
    this.handleNewGame= () => this.handleAction('newGame')
    this.handleBet    = () => this.handleAction('bet')
    this.controlStateMap = {
      'newGame'  : {
        activePhase : 'roundFinished',
        name        : 'Deal',
        onClick     : this.handleNewGame,
      },
      'left'  : {
        activePhase : 'handDealt',
        name        : 'Left',
        onClick     : this.handleLeft,
      },
      'right' : {
        activePhase : 'handDealt',
        name        : 'Right',
        onClick     : this.handleRight,
      },
      'bet'   : {
        activePhase : 'roundFinished',
        name        : 'Bet',
        onClick     : this.handleBet,
      },
    }
    /*
      add a small delay between
        * resetting deck,
        * shuffling,
        * dealing,
        * enabling choice controls
    */
    const defaultDelay          = 1100
    this.prepareShuffling       = this.prepareShuffling.bind(this)
    this.shuffle                = this.shuffle.bind(this)
    this.shuffleAfterDelay      = (delay=defaultDelay) => setTimeout(this.shuffle, delay)
    this.deal                   = this.deal.bind(this)
    this.dealAfterDelay         = (delay=defaultDelay) => setTimeout(this.deal, delay)
    this.finishDealing          = this.finishDealing.bind(this)
    this.finishDealingAfterDelay= (delay=defaultDelay) => setTimeout(this.finishDealing, delay)
    this.handleResult           = this.handleResult.bind(this)
    this.handleResultAfterDelay = (delay=defaultDelay) => setTimeout(this.handleResult, delay)
    this.getTableAndDeckPositions = this.getTableAndDeckPositions.bind(this)

  }

  toggleDebugMode () {
    this.setState( ({debugMode}) => ({
      debugMode: !debugMode
    }))
  }

  increaseBet () {
    this.setState( ({bet, money}) => ({
      bet: bet.increment().limit(money)
    }))
  }

  addMoney (amount = 10) {
    this.setState( ({money}) => ({
      money: roundToPrecision(money + amount, 1)
    }))
  }

  addJokerRounds (count = 10) {
    this.setState( ({jokerRounds}) => ({
      jokerRounds: jokerRounds + count
    }))
    // Only add the joker if it was not already present
    if (!this.state.jokerInDeck) {
      this.addJokerToDeck()
    }
  }

  addJokerToDeck () {
    // only add Joker to deck if not already present
    if (!this.state.jokerInDeck) {
      this.setState( ({deck}) => ({
        jokerInDeck : true,
        deck        : [
          ...deck.slice(0,-1),
          {...Joker, position: 'jokerAdded', order: deck.length - 1, show: true}
        ]
      }))
    } else {
      throw Error('Deck already had a Joker')
    }
  }

  removeJokerFromDeck () {
    if (this.state.jokerInDeck) {
      // The deck itself will only be modified before next shuffle
      this.setState( {
        removeJoker: true,
        jokerInDeck: false,
      } )
    } else {
      throw Error('Deck does not have a Joker')
    }
  }
  
  newGame () {
    // first, return all cards to deck, subtract money etc, then shuffle
    this.setState ( ({money, round, bet, jokerRounds, gamePhase}) => {
      // guard against input events having fired twice before state transition. Is this necessary? TODO FIXME
      if (gamePhase !== 'roundFinished') return {}

      return {
        money       : roundToPrecision(money - bet.value,1),
        lastBetIndex: bet.index,
        gamePhase   : 'prepareShuffling',
        round       : round + 1,
        jokerRounds : jokerRounds >= 1 ? jokerRounds - 1 : 0,
        result      : 'none',
      }
    }, this.prepareShuffling)
  }

  prepareShuffling () {
    // no need to set card positions, they will be moved based on game phase, only remove Joker if necessary
    if (this.state.removeJoker) {
      this.setState( ({deck}) => {
        // If joker was in the deck, show it while removing, or if on the table, just hide it.
        const [joker] = deck.slice(-1)
        const jokerPosition = joker.order < 5
          ? 'jokerRemoved fromTable'
          : 'jokerRemoved fromDeck'
        const deckWithoutJoker = [
          ...deck.slice(0, -1),
          {...Joker, order: deck.length -1, position: jokerPosition}
        ]
        return {
          deck        : deckWithoutJoker,
          removeJoker : false,
        }
      })
    }
    // no delay on first round
    if (this.state.round === 1) return this.shuffle()

    this.shuffleAfterDelay()
  }

  shuffle () {
    this.setState( ({deck, jokerInDeck}) => {
      // get a random ordering
      const cardsInGame = jokerInDeck ? deck.length : deck.length - 1
      const orderArray = shuffle(Array.from(
        {length: cardsInGame},
        (_, index) => index
      ))

      // assign order to cards while resetting their position
      const shuffledDeck = deck.map((card, index) => {
        if (index < orderArray.length) {
          return {
            ...card,
            order         : orderArray[index],
            position      : 'deck',
            show          : false,
            hide          : false,
          }
        }

        // If joker is not included in the ordering, do not include it in the shuffling
        return card
      })
      return {
        deck          : shuffledDeck,
        gamePhase     : 'shuffling',
      }
    }, this.dealAfterDelay)
  }

  deal () {
    this.setState( ({deck}) => {
      const position  = 'table'
      const show      = true
      const deckAfterDealing = deck.map( card => {
        if (card.order >= 8) return card

        const {order} = card
        switch (order) {
          case 0:
          case 1:
            return {...card, position, show}
          case 2:
            // only reveal topmost of left
            return {...card, position, show, tablePosition: 'left'}
          case 3:
          case 4:
            return {...card, position,       tablePosition: 'left'}
          case 5:
            // only reveal topmost of right
            return {...card, position, show, tablePosition: 'right', order: order - 3}
          case 6:
          case 7:
            return {...card, position,       tablePosition: 'right', order: order - 3}
        }
      })
      return {
        deck      : deckAfterDealing,
        gamePhase : 'dealing',
      }
    }, this.finishDealingAfterDelay)
  }

  finishDealing () {
    this.setState( {gamePhase : 'handDealt'} )
  }
  
  choose (choice) {
    const toDeck            = (choice === 'left') ? 'right' : 'left'
    const toTable           = (choice === 'left') ? 'left'  : 'right'
    this.setState( ({gamePhase, deck}) => {
      // guard against input events having fired twice before state transition. Is this necessary? TODO FIXME
      if (gamePhase !== 'handDealt') return {}

      const deckAfterChoice = deck.map( card => {
        const {order, tablePosition, position, show=false} = card
        // deck or already in hand
        if (!tablePosition) return card

        switch (tablePosition) {
        case toDeck:
          // only apply hiding to topmost
          const hideProps = show ? {show: false, hide: true} : {}
          return {
            ...card,
            ...hideProps,
            position      : 'discarded',
            tablePosition : null,
          }
        case toTable:
          // topmost already revealed
          const showProps = show ? {} : {show: true}
          return {
            ...card,
            ...showProps,
            tablePosition : null,
          }
        }
      })
      return {
        choice,
        deck      : deckAfterChoice,
        gamePhase : 'choiceMade',
      }
    }, this.handleResultAfterDelay)
  }

  handleResult () {
    // final hand
    const hand          = this.state.deck.filter(card => card.position === 'table')
    const result        = classify(hand)

    // money handling
    const {money, bet}  = this.state
    const win           = result === 'none' ? nullWin : this.props.wins[result]
    const winAmount     = roundToPrecision(bet.value * win.multiplier, 1)
    if (winAmount > 0) {
      this.setState( ({money}) => ({
        money: roundToPrecision(money + winAmount, 1)
      }))
    } else if (money < bet.value) {
      // autolimit bet if low on money
      this.setState( ({bet}) => ({
        bet: bet.limit(money)
      }))
    }

    const {jokerInDeck, jokerRounds} = this.state
    // on straight or better, add Joker rounds unless Joker was in play
    if (win.multiplier >= 11 && !jokerInDeck) {
      this.addJokerRounds()
    }
    // Queue removing Joker from the deck if this was the last joker round
    if (jokerInDeck && jokerRounds === 0) {
      this.removeJokerFromDeck()
    }

    // show results and finish round
    this.setState({
      result,
      gamePhase : 'roundFinished'
    })
  }

  // returns true on if something is done, and false if not
  handleAction (action) {
    const {gamePhase, money, bet, jokerInDeck} = this.state
    // only hanlde queued actions on dealing for now
    switch (action) {
    case 'newGame':
      if (gamePhase === 'roundFinished' && money >= bet.value) {
        return this.newGame(), true
      }

      return false
    case 'bet':
      if (gamePhase === 'roundFinished' && !jokerInDeck) {
        return this.increaseBet(), true
      }
      
      return false
    case 'left':
    case 'right':
      if (gamePhase === 'handDealt') {
        return this.choose(action), true
      }
      
      return false
    case 'addJokerRounds'       : return this.addJokerRounds(),       true
    case 'addJokerToDeck'       : return this.addJokerToDeck(),       true
    case 'removeJokerFromDeck'  : return this.removeJokerFromDeck(),  true
    case 'addMoney'             : return this.addMoney(),             true
    case 'toggleDebugMode'      : return this.toggleDebugMode(),      true
    default:
      return false
    }
  }

  handleClick (action) {
    this.handleAction(action)
  }

  handleKeyDown (event) {
    const knownKey = this.keyToActionMap.hasOwnProperty(event.key)
    if (knownKey) {
      this.handleAction(this.keyToActionMap[event.key])
    }
  }

  getTableAndDeckPositions () {
    const deckPlaceholder             = document.querySelector('.placeHolder.deck')
    const {left:deckLeft, y: deckTop} = deckPlaceholder.getBoundingClientRect()
    const tablePlaceHolder            = document.querySelector('.placeHolder.table')
    const {top:tableTop}              = tablePlaceHolder.getBoundingClientRect()
    return {
      deckLeft  : roundToPrecision(deckLeft, 2),
      deckTop   : roundToPrecision(deckTop,  2),
      tableTop  : roundToPrecision(tableTop, 2),
    }
  }

  handleResize () {
    requestAnimationFrame(() => this.setState(this.getTableAndDeckPositions()))
  }

  componentDidMount () {
    this.keyboardHandlerId = this.props.keyboardHandler
      .registerHandler('keydown', this.handleKeyDown)
    window.addEventListener('resize', this.handleResize)
    this.setState(this.getTableAndDeckPositions)
  }

  componentWillUnmount () {
    if (this.keyboardHandlerId) {
      this.props.keyboardHandler.removeHandler(this.keyboardHandlerId)
    }
    window.removeEventListener('resize', this.handleResize)
  }
 
 /*
  UPDATE: To avoid shuffling DOM nodes around, decouple deck order and DOM order.
    * shuffle an array orderArray containing numbers from 0 to 51 inclusive (52 if Joker in deck)
    * Assign each card = deck[i] an order value of orderArray[i]
      * For order <= 7, set position and new order
        * (0,1)   : newOrder = (0,1)
        * (2,3,4) : newOrder = (2,3,4), tablePosition = left
        * (5,6,7) : newOrder = (2,3,4), tablePosition = right
 */
  renderCards () {
    return (
      <div className="cards">
        {this.state.deck.map( (card, index) => (
          <Card card={card} key={card.toString()} domOrder={index} />
        ))}
      </div>
    )
  }

  renderCardPlaceHolders () {
    return (
      <React.Fragment>
        <div className="placeHolder deck"  style={{ "--card-order": 0 }} />
        <div className="placeHolder table" style={{ "--card-order": 0 }} />
        <div className="placeHolder table" style={{ "--card-order": 1 }} />
        <div className="placeHolder table" style={{ "--card-order": 2 }} />
        <div className="placeHolder table" style={{ "--card-order": 3 }} />
        <div className="placeHolder table" style={{ "--card-order": 4 }} />
      </React.Fragment>
    )
  }

  renderAddingJoker () {
    return <Card card={{...Joker, order: 0, position:'joker'}} />
  }

  renderControls () {
    return (
      <React.Fragment>
        {map(this.controlStateMap, (actionConfig, actionKey) => (
          <ControlButton
            name={actionConfig.name}
            debug={this.state.debugMode}
            active={
              actionKey === 'bet' // disable bet also visually if joker in play
                ? this.state.gamePhase === actionConfig.activePhase && !this.state.jokerInDeck
                : this.state.gamePhase === actionConfig.activePhase
            }
            onClick={actionConfig.onClick}
            key={actionKey}
          />
        ))}
      </React.Fragment>
    )
  }

  render () {
    return (
      <div
        id="game"
        className={this.state.gamePhase}
        style={{
          "--deck-top"  : `${this.state.deckTop}px`,
          "--deck-left" : `${this.state.deckLeft}px`,
          "--table-top" : `${this.state.tableTop}px`,
        }}
        >
        <PokerTitle />
        {/* <PokerInfo instruction={this.instructionMap[this.state.gamePhase]} /> */}
        <StatusLine
          money={this.state.money}
          jokerRounds={this.state.jokerRounds}
        />
        <WinTable
          wins={this.props.wins}
          bet={this.state.bet}
          result={this.state.result}
          lastBetIndex={this.state.lastBetIndex}
        />
        {this.renderCards()}
        {this.renderCardPlaceHolders()}
        {this.state.jokerAdded && this.renderAddingJoker()}
        {this.renderControls()}
        {this.state.debugMode && <div id="test" style={{"--card-order":0}}>{this.state.gamePhase}</div> }
      </div>
    )
  }
}

export default () => <Game wins={wins} keyboardHandler={getKeyboardHandler()} />
