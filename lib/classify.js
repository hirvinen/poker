import {Joker} from './deck'
import {
  hasJoker,
  sameSuitCards,
  removeCard,
  sortHand,
  distinctValuesCount,
  countValues,
  productOfCardCounts,
  logDeck
} from './helpers'

const hasNOfAKind = (hand, n) => {
  if (n <= 1) {
    return true
  }
  if (hasJoker(hand)) {
    return hasNOfAKind(removeCard(hand, Joker), n-1)
  }
  const valueCounts = countValues(hand)
  return valueCounts.filter((count, value) => count >= n).length > 0
}

const hasRoyalFlush = (hand) => {
  if (!hasFlush(hand) || !hasStraight(hand)) {
    return false
  }
  const sortedHand = sortHand(hand)
  const [lowest, secondLowest] = sortedHand
  const [highest] = sortedHand.slice(-1)
  if (lowest.value === 0 && 
    (secondLowest.value === 10 ||                       // J, [10,11,12,13]
      (secondLowest.value === 1 && highest.value >= 12))  // J, A, pickCards([10, 11, 12, 13], 3)
    ) {
    return true
  }
  return lowest.value === 1 && highest.value === 13 // no joker
}

const hasStraightFlush = (hand) => (hasFlush(hand) && hasStraight(hand))

const hasFullHouse = (hand) => {
  if (hasJoker(hand)) {
    const handWithoutJoker = removeCard(hand, Joker)
    return hasNOfAKind(handWithoutJoker, 3) || hasTwoPairs(handWithoutJoker)
  }
  // only (three of a kind) * (two of a kind) produce 6
  return productOfCardCounts(hand) === 6
}

const hasFlush = (hand) => {
  if (hasJoker(hand)) {
    return hasFlush(removeCard(hand, Joker))
  }
  const firstCard = hand[0]
  return hand.length === sameSuitCards(hand, firstCard).length
}

const hasStraight = (hand) => {
  const sortedHand = sortHand(hand)
  if (hand.length > distinctValuesCount(hand)) {
    return false
  }
  // all values are unique
  if (!hasJoker(hand)) {
    const [lowest] = sortedHand
    if (hand.reduce( (sum, current) => sum + current.value, 0) - hand.length * lowest.value == 10) {
      return true
    }
    // No simple straight. If lowest is ace, try with setting that to 14
    if (lowest.value == 1) {
      const [ace, secondLowest, ...rest] = sortedHand
      const ace14 = {...ace, value: 14}
      const handWithAceAs14 = [secondLowest].concat(rest, ace14)
      if (handWithAceAs14.reduce( (sum, current) => sum + current.value, 0) - hand.length * secondLowest.value == 10) {
        return true
      }
    }
  } else { // we do have a joker
    const handWithoutJoker = removeCard(sortedHand,Joker)
    // it's a straight if highest value is smaller than or equal to lowest value + hand length -1
    // since we have established that they are unique
    const [lowest, secondLowest, secondHighest, highest] = handWithoutJoker
    if (highest.value <= lowest.value + hand.length - 1) {
      return true
    }
    // No simple straight. If lowest is ace, it is enough to test if second lowest is 10 or greater
    if (lowest.value == 1 && secondLowest.value >= 10) {
      return true
    }
  }
  return false
}

const hasTwoPairs = (hand) => {
  if (hasJoker(hand)) {
    return hasNOfAKind(removeCard(hand, Joker), 2)
  }
  return !hasNOfAKind(hand, 4) && productOfCardCounts(hand) == 4
}

const hasPair10ToAce = (hand) => {
  const sortedHand = sortHand(hand)
  if (hasJoker(hand)) {
    return hand.filter(card => card.value === 1 || card.value >= 10).length > 1
  }
  const cards10ToAce = hand.filter(card => card.value >= 10 || card.value === 1)
  return hasNOfAKind(cards10ToAce, 2)
}


const classify = (hand = []) => {
  if (!hand || hand.length < 5) {
    return 'none'
  }
  if (hasNOfAKind(hand, 5))   { return 'fiveOfAKind' }
  if (hasRoyalFlush(hand))    { return 'royalFlush' }
  if (hasStraightFlush(hand)) { return 'straightFlush' }
  if (hasNOfAKind(hand, 4))   { return 'fourOfAKind' }
  if (hasFullHouse(hand))     { return 'fullHouse' }
  if (hasFlush(hand))         { return 'flush' }
  if (hasStraight(hand))      { return 'straight' }
  if (hasNOfAKind(hand, 3))   { return 'threeOfAKind' }
  if (hasTwoPairs(hand))      { return 'twoPairs' }
  if (hasPair10ToAce(hand))   { return 'pair10ToAce' }
  return 'none'
}
export default classify