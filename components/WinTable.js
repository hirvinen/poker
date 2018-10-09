const map = require('lodash/map')
import {roundToPrecision} from '../lib/helpers'

const WinTableRow = ({winningRow, title, cells, currentBet, lastBet = 0}) => {
    const rowClass = winningRow ? "winTableRow lastWin" : "winTableRow"
    return (
      <div className={rowClass}>
        <WinTableCell classes={['winLabel']} content={title} />
        {cells.map((value, index) => (
          <WinTableCell
            classes={[
              ...(currentBet === index ? ['currentBet'] : []),
              ...(lastBet    === index ? ['lastBet']    : []),
            ]}
            content={Math.floor(value) < value ? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : value}
            key={title + value}
          />
        ))}
      </div>
    )
  }
  
  const WinTableCell = ({content, classes = []}) => (
    <div className={['winTableCell', ...classes].join(' ')}>
      <div>{content}</div>
    </div>
  )
  
  const WinTable = ({bet, wins, result, lastBetIndex = 0}) => (
    <div className="winTable">
      <WinTableRow
        title="Win / Bet"
        cells={bet.values()}
        currentBet={bet.index}
      />
      {map(wins, (win, winKey) => (
          <WinTableRow
            title={win.description}
            cells={bet.values().map(value => roundToPrecision(value*win.multiplier,1))}
            key={winKey}
            winningRow={winKey === result}
            currentBet={bet.index}
            lastBet={lastBetIndex}
          />
      ))}
    </div>
  )
  
  export default WinTable