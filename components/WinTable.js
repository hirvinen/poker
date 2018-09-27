const map = require('lodash/map')
import {roundToPrecision} from '../lib/helpers'

const WinTableRow = ({winningRow, title, cells, currentBet}) => {
    const rowClass = winningRow ? "winTableRow lastWin" : "winTableRow"
    return (
      <div className={rowClass}>
        <WinTableCell classes={['winLabel']} content={title} />
        {cells.map((value, index) => (
          <WinTableCell
            classes={currentBet === index ? ['currentBet'] : []}
            content={Math.floor(value) < value ? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : value}
            key={title + value}
          />
        ))}
      </div>
    )
  }
  
  const WinTableCell = ({content, classes = []}) => (
    <div className={['winTableCell', ...classes].join(' ')}>{content}</div>
  )
  
  const WinTable = ({betButton, bet, wins, result}) => (
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
          />
      ))}
    </div>
  )
  
  export default WinTable