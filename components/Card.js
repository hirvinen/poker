const Card = ({card}) => {
    const {
      order,
      domOrder,
      tablePosition,
      show  = false,
      hide  = false,
      position, suit: {color},
    } = card

    //const hidden = position === 'deck' || (order > 0 && position != 'hand')
    const classes = [
      'card',
      position,
      ...(show          ? ['show', color] : ['hidden']),
      ...(hide          ? ['hide', color] : []),
      ...(tablePosition ? [tablePosition] : [])
    ]
    // Face needs to be shown in the beginning of the hide animation
    const content = show || hide
      ? card.toString()
      : ''
    return (
      <div
        style={{
          '--card-order': order,
          '--dom-order' : domOrder,
        }}
        className={classes.join(' ')}
      >
          {content}
      </div>
    )
  }

export default Card