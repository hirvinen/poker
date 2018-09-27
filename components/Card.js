const Card = ({card}) => {
    const {order, position, suit: {color}} = card
    const baseClasses = ['card', position, color]
    const hidden = position === 'deck' || (order > 0 && position != 'hand')
    const classes= hidden ? [...baseClasses, 'hidden'] : [...baseClasses, 'shown']
    return (
      <div
        style={{'--card-order': order}}
        data-order={order}
        className={classes.join(' ')}
      >
          {hidden || card.toString()}
      </div>
    )
  }

export default Card