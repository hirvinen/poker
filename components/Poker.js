const shuffle = require('lodash/shuffle')
const map     = require('lodash/map')
import {createDeck, Joker}    from '../lib/deck'
import {wins, nullWin}        from '../lib/quick_poker'
import {
  roundToPrecision,
  logDeck,
  createBet,
  getKeyboardHandler,
}                             from '../lib/helpers'
import classify               from './classify'

const Card = (props) => {
  const card = props.card
  const {order, position, suit: {color}} = card
  const baseClasses = ['card', position, color]
  const hidden = position === 'deck' || (order > 0 && position != 'hand')
  const classes= hidden ? [...baseClasses, 'hidden'] : [...baseClasses, 'shown']
  return (
    <div
      style={{'--card-order': order}}
      data-order={order}
      className={classes.join(' ')}
      onClick={props.onClick}
    >
        {hidden || card.toString()}
    </div>
  )
}

const WinTableRow = (props) => {
  const rowClass = props.winningRow ? "winTableRow lastWin" : "winTableRow"
  return (
    <div className={rowClass}>
      <div className="winTableCell winLabel">{props.title}</div>
      {props.cells.map((value, index) => {
        const className = index === props.currentBet ? "winTableCell currentBet" : "winTableCell otherBet"
        return <div className={className} key={props.title + value}>{value}</div>
      })}
    </div>
  )
}

const WinTable = (props) => (
  <div className="winTable">
    <WinTableRow
      title={props.betButton}
      cells={props.bet.values()}
      currentBet={props.bet.index}
      winningRow={false}
    />
    {map(props.wins, (win, winKey) => {
      const winningRow = winKey === props.result
      return (
        <WinTableRow
          title={win.description}
          cells={props.bet.values().map(value => roundToPrecision(value*win.multiplier,1))}
          key={winKey}
          currentBet={props.bet.index}
          winningRow={winningRow}
        />
      )}
    )}
  </div>
)

const PokerTitle = (props) => <div className="title"><h1>QuickPoker</h1></div>
const PokerInfo  = (props) => {
  const infoText = <p>Click the deck to deal two cards, then choose left or right stack to complete your hand</p>
  return <div className="info">{infoText}</div>
}

const StatusLine = (props) => (
  <React.Fragment>
    <div className="money">{props.money}</div>
    {/*<div className="result">{`Result: ${props.result}`}</div>*/}
    <div className="jokerRounds" data-label="🃏">{props.jokerRounds}</div>
  </React.Fragment>
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
      gamePhase         : 'start',
      result            : 'none',
      actionQueue       : [],
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
  }

  toggleDebugMode () {
    this.setState({debugMode: !this.state.debugMode})
  }

  increaseBet () {
    const bet = this.state.bet.increment().limit(this.state.money)
    this.setState({bet})
  }
  
  deal () {
    const {money, bet, round, jokerRounds} = this.state
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
    this.setState({
      deck,
      money       : roundToPrecision(money - bet.value,1),
      gamePhase   : 'handDealt',
      round       : round + 1
    })

    if (jokerRounds >= 1) {
      this.setState({
        jokerRounds: jokerRounds -1
      })
    }
  }
  
  addMoney (amount = 10) {
    const money = roundToPrecision(this.state.money + amount, 1)
    this.setState({money})
  }

  addJokerRounds (count = 10) {
    const {jokerInDeck, jokerRounds, actionQueue, jokerAdded} = this.state
    // If joker was not in the deck, show it but do not add it to the deck yet
    if (!jokerInDeck) {
      this.setState({
        jokerAdded  : !jokerAdded,
        actionQueue : [...actionQueue, 'addJokerToDeck']
      })
    }

    // Joker already in deck, so just add joker rounds
    this.setState({
      jokerRounds: jokerRounds + count
    })
  }

  addJokerToDeck () {
    const {jokerInDeck, deck} = this.state
    
    // only add Joker to deck if not already present
    if (!jokerInDeck) {
      this.setState({
        jokerInDeck : true,
        jokerAdded  : false,
        deck        : [...deck, {...Joker, position: 'deck', order: 52}]
      })
    } else {
      throw Error('Deck already had a Joker')
    }
  }

  removeJokerFromDeck () {
    const {jokerInDeck, deck} = this.state
    if (jokerInDeck) {
      this.setState({
        jokerInDeck : false,
        deck        : deck.filter(card => card.value !== 0)
      })
    } else {
      throw Error('Deck does not have a Joker')
    }
  }
  
  choose (choice) {
    const gamePhase       = choice
    const toDeck          = (choice === 'left') ? 'right' : 'left'
    const orderIncrement  = this.state.deck.length - 8
    const deck            = this.state.deck.map(card => {
      const {position, order} = card
      if (position === toDeck) {
        return {...card, order: order + orderIncrement, position: 'deck'}
      } else if (position === choice) {
        return {...card, order: order + 2,              position: 'hand'}
      }

      // already in deck
      return card
    })

    this.setState({
      deck,
      gamePhase
    })
    this.handleResult()
  }
  
  handleResult () {
    // final hand
    const hand = this.state.deck.filter(card => card.position === 'hand')
    const result = classify(hand)

    // money handling
    const {money, bet}  = this.state
    const win           = result === 'none' ? nullWin : this.props.wins[result]
    const winAmount     = roundToPrecision(bet.value * win.multiplier, 1)
    if (winAmount > 0) {
      this.setState({
        money: roundToPrecision(money + winAmount, 1)
      })
    } else if (money < bet.value) {
      // autolimit bet if low on money
      this.setState({bet: bet.limit(money)})
    }

    const {jokerInDeck, jokerRounds, actionQueue} = this.state
    // on straight or better, add Joker rounds unless Joker was in play
    if (win.multiplier >= 11 && !jokerInDeck) {
      this.addJokerRounds()
    }
    // Queue removing Joker from the deck if this was the last joker round
    if (jokerInDeck && jokerRounds === 0) {
      this.setState({
        actionQueue: [...actionQueue, 'removeJokerFromDeck']
      })
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
      if ((gamePhase === 'start' || gamePhase === 'roundFinished') &&
          money >= bet.value) {
        this.handleActionQueue()
        return this.deal(), true
      }

      return false
    case 'bet':
      if ((gamePhase === 'start' || gamePhase === 'roundFinished') &&
          !jokerInDeck) {
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
    const actionQueue = this.state.actionQueue.filter(action => !this.handleAction(action))
    this.setState({actionQueue})
    // Throw if something was left
    if (actionQueue.length > 0) {
      console.log('Unknown actions in queue', actionQueue)
      throw Error('Unknown actions in queue')
    }
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

  renderAddingJoker () {
    return <Card card={{...Joker, order: 0, position:'joker'}} />
  }

  renderControls () {
    const classes = this.state.debugMode ? "control debug" : "control"
    return (
      <React.Fragment>
        <div className={classes + " deck" } onClick={ () => this.handleClick('deal')  } />
        <div className={classes + " left" } onClick={ () => this.handleClick('left')  } />
        <div className={classes + " right"} onClick={ () => this.handleClick('right') } />
        <div className={classes + " bet"  } onClick={ () => this.handleClick('bet')   } />
      </React.Fragment>
    )
  }

  render () {
    const betButton  = <button onClick={() => this.handleClick('bet')}>BET</button>
    return (
      <div
        className="game">
        <PokerTitle />
        <PokerInfo />
        <StatusLine
          money={this.state.money}
          jokerRounds={this.state.jokerRounds}
        />
        <WinTable
          wins={this.props.wins}
          bet={this.state.bet}
          betButton={betButton}
          result={this.state.result}
        />
        {this.renderCards()}
        {this.state.jokerAdded && this.renderAddingJoker()}
        {this.renderControls()}
        {this.state.debugMode && <div id="test" style={{"--card-order":0}} /> }
      </div>
    )
  }
}

export default () => <Game wins={wins} keyboardHandler={getKeyboardHandler()} />