const StatusLine = ({money, jokerRounds}) => (
    <React.Fragment>
      <div className="money">€&nbsp;{money}</div>
      <div className="jokerRounds">🃏&nbsp;{jokerRounds}</div>
    </React.Fragment>
  )

export default StatusLine