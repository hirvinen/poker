import Card from "./Card"

/*
  UPDATE: To avoid shuffling DOM nodes around, decouple deck order and DOM order.
    * shuffle an array orderArray containing numbers from 0 to 51 inclusive (52 if Joker in deck)
    * Assign each card = deck[i] an order value of orderArray[i]
      * For order <= 7, set position and new order
        * (0,1)   : newOrder = (0,1)
        * (2,3,4) : newOrder = (2,3,4), tablePosition = left
        * (5,6,7) : newOrder = (2,3,4), tablePosition = right
 */
function Cards (props) {
  return (
    <div className="cards">
      {props.deck.map( (card, index) => (
        <Card card={card} key={card.toString()} domOrder={index} />
      ))}
    </div>
  )
}

export default Cards