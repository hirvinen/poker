import Layout from '../components/Layout'

export default () => (
  <div>
    <Layout title="About Quick Poker">
      <h1>About Quick Poker</h1>
      <p>This game is modelled after Pikapokeri by Veikkaus.</p>
      <p>This is very much a work in progress and may be broken from time to time for now. See <a href="https://github.com/hirvinen/poker">source on github</a></p>
      <h2>How to play</h2>
      <ul>
        <li>To increase the bet, click the bet button.</li>
        <li>To deal a hand, click the deck.</li>
        <li>You get two cards, and two stacks of three cards to choose from.</li>
        <li>Only one card is shown from the two stacks.</li>
        <li>Your hand is formed from the two cards on the left and the stack you chose.</li>
        <li>A joker is added to the deck for the next ten rounds if you get a straight or better.</li>
        <li>On a computer, arrow keys may be used to choose a stack, deal(down) or increase the bet(up).</li>
        <li>To cheat, press * or + on the numpad.</li>
        <li>If you run out of money, reload the page or cheat.</li>
      </ul>
    </Layout>
  </div>
)
