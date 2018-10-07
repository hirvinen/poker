const Card = ({card}) => {
    const {order, domOrder, position, suit: {color}} = card
    const hidden = position === 'deck' || (order > 0 && position != 'hand')
    const classes = [
      'card',
      position,
      color,
      ...(hidden ? ['hidden'] : ['shown']),
    ]
    return (
      <div
        style={{
          '--card-order': order,
          '--dom-order' : domOrder,
        }}
        className={classes.join(' ')}
      >
          {hidden || card.toString()}
      </div>
    )
  }

export default Card