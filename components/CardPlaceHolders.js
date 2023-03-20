import React from 'react'
function CardPlaceHolders () {
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
export default CardPlaceHolders
