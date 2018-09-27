const StatusLine = ({money, jokerRounds}) => (
    <React.Fragment>
      <div className="money">{money.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      <div className="jokerRounds" data-label="🃏">{jokerRounds}</div>
    </React.Fragment>
  )

export default StatusLine