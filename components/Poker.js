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
import classify               from './classify'
import WinTable               from './WinTable'
import Card                   from './Card'
import StatusLine             from './Statusline'
import ControlButton          from './ControlButton'

const PokerTitle = () => <div className="title"><h1>QuickPoker</h1></div>
const PokerInfo  = ({instruction}) => (
  <div className="info">{instruction}</div>
)

class Game extends React.Component {
  constructor(props) {
    super(props)
    const deck = createDeck().map((card, index) => ({
      ...card,
      position: 'deck',
      order   : index,
    }))
    this.state = {
      debugMode         : false,
      deck              : deck,
      joker             : Joker,
      money             : 20,
      bet               : createBet(),
      jokerRounds       : 0,
      jokerInDeck       : false,
      round             : 0,
      gamePhase         : 'roundFinished',
      result            : 'none',
      actionQueue       : [],
    }

    this.instructionMap = {
      'roundFinished' : 'Click deck to deal or increase bet.',
      'handDealt'     : 'Select left or right stack',
      'left'          : 'Analyzing hand results',
      'right'         : 'Analyzing hand results',
    }


    // to simplify handleKeyDown
    this.keyToActionMap = {
      ' '         : 'deal',
      'ArrowDown' : 'deal',
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
    this.handleClick    = this.handleClick.bind(this)
    this.handleKeyDown  = this.handleKeyDown.bind(this)
    this.handleResult   = this.handleResult.bind(this)
    // onClick wrappers for controls
    this.handleLeft   = () => this.handleAction('left')
    this.handleDeal   = () => this.handleAction('deal')
    this.handleRight  = () => this.handleAction('right')
    this.handleBet    = () => this.handleAction('bet')
    this.controlStateMap = {
      'deal'  : {
        activePhase : 'roundFinished',
        name        : 'Deal',
        onClick     : this.handleDeal,
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
  
  deal () {
    // get a random ordering
    const orderArray = shuffle(Array.from(
      {length: this.state.deck.length},
      (_, index) => index
    ))
    // assign order to cards
    const deck = this.state.deck.map((card, index) => {
      const order = orderArray[index]
      switch (order) {
      case 0:
      case 1:
        return {...card, order,            position: 'hand'}
      case 2:
      case 3:
      case 4:
        return {...card, order: order - 2, position: 'left'}
      case 5:
      case 6:
      case 7:
        return {...card, order: order - 5, position: 'right'}
      default:
        return {...card, order: order - 8, position: 'deck'}
      }
    })
    
    this.setState( ({money, round, bet, jokerRounds}) => ({
      deck,
      money       : roundToPrecision(money - bet.value,1),
      gamePhase   : 'handDealt',
      round       : round + 1,
      jokerRounds : jokerRounds >= 1 ? jokerRounds - 1 : 0,
    }))
  }
  
  addMoney (amount = 10) {
    this.setState( ({money}) => ({
      money: roundToPrecision(money + amount, 1)
    }))
  }

  addJokerRounds (count = 10) {
    // If joker was not in the deck, show it but do not add it to the deck yet
    if (!this.state.jokerInDeck) {
      this.setState( ({actionQueue}) => ({
        jokerAdded  : false,
        actionQueue : [...actionQueue, 'addJokerToDeck']
      }))
    }

    // Joker already in deck, so just add joker rounds
    this.setState( ({jokerRounds}) => ({
      jokerRounds: jokerRounds + count
    }))
  }

  addJokerToDeck () {
    // only add Joker to deck if not already present
    if (!this.state.jokerInDeck) {
      this.setState( ({deck}) => ({
        jokerInDeck : true,
        jokerAdded  : false,
        deck        : [...deck, {...Joker, position: 'deck', order: 52}]
      }))
    } else {
      throw Error('Deck already had a Joker')
    }
  }

  removeJokerFromDeck () {
    if (this.state.jokerInDeck) {
      this.setState( ({deck}) => ({
        jokerInDeck : false,
        deck        : deck.filter(card => card.value !== 0)
      }))
    } else {
      throw Error('Deck does not have a Joker')
    }
  }
  
  choose (choice) {
    this.setState( ({deck, gamePhase}) => {
      if (gamePhase !== 'handDealt') {
        return {}
      }
      const toDeck          = (choice === 'left') ? 'right' : 'left'
      const orderIncrement  = deck.length - 8
      const deckAfterChoice = deck.map(card => {
        const {position, order} = card
        if (position === toDeck) {
          return {...card, order: order + orderIncrement, position: 'deck'}
        } else if (position === choice) {
          return {...card, order: order + 2,              position: 'hand'}
        }

        // already in deck
        return card
      })
      
      return {
        deck      : deckAfterChoice,
        gamePhase : choice,
      }
    }, this.handleResult)
  }
  
  handleResult () {
    // final hand
    const hand          = this.state.deck.filter(card => card.position === 'hand')
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
      this.setState( ({actionQueue}) => ({
        actionQueue: [...actionQueue, 'removeJokerFromDeck']
      }))
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
    case 'deal':
      if (gamePhase === 'roundFinished' && money >= bet.value) {
        this.handleActionQueue()
        return this.deal(), true
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

  handleActionQueue () {
    // remove actions that get handled
    this.setState( ({actionQueue}) => ({
      actionQueue: actionQueue.filter(action => !this.handleAction(action))
    }))
  }

  handleKeyDown (event) {
    const knownKey = this.keyToActionMap.hasOwnProperty(event.key)
    if (knownKey) {
      this.handleAction(this.keyToActionMap[event.key])
    }
  }

  componentDidMount () {    
    this.keyboardHandlerId = this.props.keyboardHandler
      .registerHandler('keydown', this.handleKeyDown)
  }

  componentWillUnmount () {
    if (this.keyboardHandlerId) {
      this.props.keyboardHandler.removeHandler(this.keyboardHandlerId)
    }
  }
 
 /*
  UPDATE: To avoid shuffling DOM nodes around, decouple deck order and DOM order.
    * shuffle an array cardOrder containing numbers from 0 to 51 inclusive (52 if Joker in deck)
    * Assign each card = deck[i] an order value of cardOrder[i]
      * For order <= 7, set position and new order
        * (0,1)   : newOrder = (0,1),   position = hand
        * (2,3,4) : newOrder = (0,1,2), position = left
        * (5,6,7) : newOrder = (0,1,2), position = right
      * For order > 7, subtract 7 from order (1-44(45)) and position to deck
    * When cards are discarded, set position to deck and add 44(45) to order
    * When cards are chosen, set position = hand and add 2 two order => (2,3,4)
  TODO: Fix description below
  Each card in the deck will be assigned an index equal to index in the deck.
  That index will be used as their negative z-index when they are in a hidden state.
  Position on the grid will be determined by the state of the game with this mapping:
    1. When a hand has not been dealt, all cards will be in the deck.
    2. When dealing, do a shuffle animation in the deck position (TODO)
    3. When a hand is dealt:
      * (0,1)       will be on the table 1-5 and 5-9 (hand)
      * (2,3,4)     will be on the table 11-15 (left)
      * (5,6,7)     will be on the table 16-20 (right)
    4. When left or right is chosen
      * (0,1)       will be on the table 1-5 and 5-9 (hand)
      * <chosen>    will be on the table: 9-13, 13-17, 17-21
      * <discarded> will be in the deck
    5. When a joker is added to the deck, put it on the middle of the screen and then move to deck (TODO)
    6. When a joker is removed from the deck, move it to the middle of the screen and vanish it. (TODO)
 */
  renderCards () {
    return (
      <React.Fragment>
        {this.state.deck.map(card => (
          <Card card={card} key={card.toString()} />
        ))}
      </React.Fragment>
    )
  }

  renderCardPlaceHolders () {
    return (
      <React.Fragment>
        <div className="card hand placeHolder" style={{ "--card-order": 0 }} />
        <div className="card hand placeHolder" style={{ "--card-order": 1 }} />
        <div className="card hand placeHolder" style={{ "--card-order": 2 }} />
        <div className="card hand placeHolder" style={{ "--card-order": 3 }} />
        <div className="card hand placeHolder" style={{ "--card-order": 4 }} />
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
            active={this.state.gamePhase === actionConfig.activePhase}
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
        className="game">
        <PokerTitle />
        {false && <PokerInfo instruction={this.instructionMap[this.state.gamePhase]} />}
        <StatusLine
          money={this.state.money}
          jokerRounds={this.state.jokerRounds}
        />
        <WinTable
          wins={this.props.wins}
          bet={this.state.bet}
          result={this.state.result}
        />
        {this.renderCards()}
        {this.renderCardPlaceHolders()}
        {this.state.jokerAdded && this.renderAddingJoker()}
        {this.renderControls()}
        {this.state.debugMode && <div id="test" style={{"--card-order":0}} /> }
      </div>
    )
  }
}

export default () => <Game wins={wins} keyboardHandler={getKeyboardHandler()} />
