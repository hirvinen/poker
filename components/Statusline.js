const StatusLine = ({money, jokerRounds}) => (
    <React.Fragment>
      <div className="money">€&nbsp;{money.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      <div className="jokerRounds">🃏&nbsp;{jokerRounds}</div>
    </React.Fragment>
  )

export default StatusLine