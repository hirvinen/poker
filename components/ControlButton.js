const ControlButton = ({name, classes = [], debug, active, onClick}) => {
  let finalClasses = [
    'control',
    name.toLowerCase(),
    ...(debug  ? ['debug']  : []),
    ...(active ? ['active'] : []),
    ...classes
  ]
  return (
      <div className={finalClasses.join(" ")} onClick={onClick}>{name}</div>
  )
}

export default ControlButton