const isValueSetStraight = (values) => {
  const sortedValues = values.sort( (a, b) => a - b)
  const withoutZero = values.filter( v => v > 0)
  const [lowest, secondLowest] = withoutZero
  const [highest]= withoutZero.slice(-1)
}



const createDeck = () => (
  suits().map( (suit) => (
    Array.from({length: 13}, (value, i) => i+1).map( value => 
      createCard(suit,value)
    )
  )).reduce( (a, b) => a.concat(b), [])
)

const Joker = {
  suit : {
    name : 'Joker',
    short: 'J'
  },
  value : 0,
  toString : () => ('🃏')
}

const deckWithJoker = () => (createDeck().push(Joker))

const pickCards = (deck, count) => ({
  picked: deck.slice( 0, count),
  rest: deck.slice(count, deck.length)
})

const newGame = (jokerRounds = 0) => {
  const initialDeck = createDeck()
  if (jokerRounds > 0) {
    initialDeck.push(Joker)
    jokerRounds--
  } else {
    jokerRounds = 0
  }
  const deck = shuffle(initialDeck)
  const {picked:hand, rest:deckAfterDealing} = pickCards(deck, 2)
  const {picked:left, rest:deckAfterLeft} = pickCards(deckAfterDealing, 1)
  const {picked:right, rest:remainingDeck} = pickCards(deckAfterLeft, 1)
  return {hand, left, right, remainingDeck, jokerRounds}
}

const winMultipliers = {
	fiveOfAKind		: 100,
	royalFlush		: 100,
	straightFlush	: 75,
	fourOfAKind 	: 50,
	fullHouse		  : 20,
	flush			    : 15,
	straight		  : 11,
	threeOfAKind	: 5,
	twoPairs		  : 3,
  pair10ToAce		: 2,
  none          : 0
}



const sameValueCards = (deck, card) =>
  deck.filter( c => sameValue(c, card)) // UNUSED

const countCardsWithValue = (deck, value) => 
  deck.filter( c => c.value === value || c.value === 0)

const organizeByValues = (hand) => {
  const handByValues = []
  hand.forEach(card => {
      if (!handByValues.hasOwnProperty(card.value)) {
        handByValues[card.value] = []
      }
      handByValues[card.value].push(card)
    })
    return handByValues
}



const organizeBySuits = (hand) => {
  const handBySuits = {}
  hand.forEach(card => {
    if (!handBySuits.hasOwnProperty(card.suit)) {
      handBySuits[card.suit] = []
    }
    handBySuits[card.suit].push(card)
  })
}
const countSuits = (hand) => {
  const suitCounts = {}
  hand.forEach(card => {
      if (!suitCounts.hasOwnProperty(card.value)) {
        suitCounts[card.value] = 0
      }
      suitCounts[card.value]++
    })
    return suitCounts
}





// array[<value of first new card>] : array of possible second values that would make a straight
const possibleStraightCompletions = (hand) => {
  const values = Array.from({length: 14},() => [])
  const valueCounts = countValues(hand)
  if (valueCounts.filter(count => count > 1).length > 0) { // at least a pair
    return values
  }
  const valuesWithoutJoker  = hand.map(card => card.value).filter( v => v > 0)
  const valueSets = [valuesWithoutJoker]
  if (valueCounts[1] > 0) {
    valueSets.push(valuesWithoutJoker.map(v => v === 1 ? 14: v))
  }
  valueSets.forEach( valueSet => {
    const lowest  = Math.min(...valueSet)
    const highest = Math.max(...valueSet)
    const floor   = Math.max(1, highest - 4)
    const ceiling = Math.min(14, lowest + 4)
    if (floor > lowest || ceiling < highest) {
      return // Straight not possible for this value set
    }
    for (let firstValue = floor; firstValue <= ceiling; firstValue++) {
      if (valueCounts[firstValue] === 0) {
        for (let secondValue = firstValue + 1; secondValue <= firstValue + 4; secondValue++) {
          if (valueCounts[secondValue] === 0) {
            
          }
        }
      }
    }
    if (lowest < highest - 4) {
      return
    }
  })
  

  const lowestValue = Math.min(...valuesWithoutJoker)
  const highestValue= Math.max(...valuesWithoutJoker)
  
}
const isStraightPossible = (hand) => {
  if (hand.length > distinctValuesCount(hand)) {
    return false
  }

}

const getStraightLimits = (hand) => {
  const valuesWithoutJoker = hand.map(card => card.value).filter( v => v > 0)
  const valuesWithoutAce   = valuesWithoutJoker.filter( v => v > 1)

  const smallestValue = Math.min(...valuesWithoutJoker)
  const highestValue  = Math.max(...valuesWithoutJoker)
}














const bestHand = (startingHand, choice) => {
  const hand = startingHand.concat(choice)
  if (hasNOfAKind(hand, 5)) { return 'fiveOfAKind' }
  if (hasRoyalFlush(hand)) { return 'royalFlush' }
  if (hasStraightFlush(hand)) { return 'straightFlush' }
  if (hasNOfAKind(hand, 4)) { return 'fourOfAKind' }
  if (hasFullHouse(hand)) { return 'fullHouse' }
  if (hasFlush(hand)) { return 'flush' }
  if (hasStraight(hand)) { return 'straight' }
  if (hasNOfAKind(hand, 3)) { return 'threeOfAKind' }
  if (hasTwoPairs(hand)) { return 'twoPairs' }
  if (hasPair10ToAce(hand)) { return 'pair10ToAce' }
  return 'none'
}

// probability of picking exactly one x : P(x,!x) + P(!x,x)
// Given k matching cards in deck:
// P(x,!x) == k/n*( (n - k) / (n - 1) ) == (n - k) / (n*n - n)
// P(!x,x) == ( (n - k) / n ) * ( k / (n - 1) ) == (n - k) / (n*n - n)
// => P(x,!x) XOR P(!x,x) == P(x,!x) + P(!x,x)
// == (2n -2k) / (n*n - n)
const probabilityOfPickingOneMatchingCard = (n, k) => {
  return (2 * n - 2 * k) / (n * n - n)
}
// P(x,x) with deck of n and k matching cards:
// ( k / n ) * ( (k -1) / (n -1)) == ( k * k - k ) / ( n * n - n )
const probabilityOfPickingTwoMatchingCards = (n, k) => {
  return (k * k - k) / (n * n - n )
}

// P(x && !( y || x)) == P(x,(!x && !y)) + P((!x && !y), x)
// with deck of n, k of x and m of y:
// P(x, (!x && !y)) == ( k / n ) * ((n - (k - 1) - m) / (n - 1))
// P((!x && !y), x) == ( (n - k - m) / n ) * ( k / (n - 1))
const probabilityOfPickingOneXButNoY = (deckLength, toPickCount, toAvoidCount) => (
  ( toPickCount / deckLength ) * 
  ((deckLength - (toPickCount - 1) - toAvoidCount) / (deckLength - 1)) +
  ( (deckLength - toPickCount - toAvoidCount) / deckLength ) * ( toPickCount / (deckLength - 1))
)

// P(a && b) == P(a,b) + P(b,a) + P(j,a) + P(j,b) + P(a,j) + P(b,j) + P(j,j)
// P(x,y) with deck size n: xCount / n * yCount / (n-1)
// Without Joker: P(a && b) ==
// P(a,b) + P(b,a)
// With allowing only first one to be replaced by a Joker: P(a && b) ==
// P(a,b) + P(b,a) + P(j,b) + P(b,j)
// if defined, joker should be one of 'any'(default), 'none', 'first'
const probabilityOfGettingValues = (a, b, deck, withJoker) => {
  let jokerOption = withJoker || 'any'
  const counts = {
    joker: 0,
    a: 0,
    b: 0
  }
  for (let card in deck) {
    switch(card.value) {
    case 0: counts.joker++; break
    case a: counts.a++; break
    case b: counts.b++; break
    }
  }
  const n = deck.length
  const probabilityExcludingJoker = (counts.a / n) * (counts.b / (n-1)) +
                                    (counts.b / n) * (counts.a / (n-1))
  const probabilityFromJokerAsA   = (counts.joker / n) * (counts.b / (n-1)) +
                                    (counts.b / n) * (counts.joker / (n-1))
  const probabilityFromJokerAsB   = (counts.joker / n) * (counts.a / (n-1)) +
                                    (counts.a / n) * (counts.joker / (n-1))
  const probabilityFromJokerAsAny = (counts.joker / n) * ((counts.joker-1) / (n-1))
  if (jokerOption === 'any') {
    return probabilityExcludingJoker + probabilityFromJokerAsA + probabilityFromJokerAsB + probabilityFromJokerAsAny
  } else if (jokerOption == 'none') {
    return probabilityExcludingJoker
  } else if (jokerOption == 'first') {
    return probabilityExcludingJoker + probabilityFromJokerAsA
  }
}

// Like probabilityOfGettingValues with joker = 'none', but with counts instead of values and deck
const probabilityOfValuePairWithoutJoker = (deckLength, firstValueCount, secondValueCount) => (
  (firstValueCount / deckLength) * ( secondValueCount / deckLength)
)

const probabilityOfGettingAPairOfCardsNotInHand = (hand, deck) => {
  const valuesInHand = hand.map(c => c.value)
  const valueCountsInDeck = countValues(deck)
  const n = deck.length
  const probabilitiesForCardValues = valueCountsInDeck.map( (count, value) => {
    if (value === 0 || valuesInHand.includes(value)) {
      return 0
    }
    return (count / n) * ((count - 1) / (n - 1))
  })
  return sum(probabilitiesForCardValues)
}

const probabilityOfNOfAKind = (hand, deck, n = 0) => {
  const valueCounts = countValues(hand)
  if (hasNOfAKind(hand, n+1)) { // not possible to get exactly n cards
    return 0
  }
  if (hasJoker(hand)) {
    return probabilityOfNOfAKind(removeCard(hand, Joker), deck, n-1)
  }
  const probabilitiesForCardValues = valueCounts.map( (count, value) => {
    const missing = n - count
    const matchingCardsInDeck = deck.filter( c => c.value == 0 || c.value === value).length
    switch(missing){
    case 0:
      // P(!value, !value)
      const nonMatchingCount = deck.length - matchingCardsInDeck
      return ((nonMatchingCount) / (deck.length)) * ((nonMatchingCount -1) / (deck.length - 1))
      break
    case 1:
      return probabilityOfPickingOneMatchingCard(
        deck.length,
        matchingCardsInDeck
      )
      break
    case 2:
      return probabilityOfPickingTwoMatchingCards(
        deck.length,
        matchingCardsInDeck
      )
      break
    default:
      return 0
      break
    }
  })
  return sum(probabilitiesForCardValues)
}

const probabilityOfFlush = (hand, deck) => {
  if (hasJoker(hand)) {
    return probabilityOfFlush(removeCard(hand, Joker), deck)
  }
  const firstCard = hand[0] // No joker in this hand
  if (sameSuitCards(hand, firstCard).length < hand.length) {
    return 0
  }
  return probabilityOfPickingTwoMatchingCards(
    deck.length,
    sameSuitCards(deck, firstCard).length
  )
}

const possibleStraightValueRanges = (hand) => {
  const sortedHand = sortHand(hand)
  const maxDiff = hand.length + 2 - 1 // assuming we will pick two more cards
  const valueRange = {
    lowest      : (hasJoker(hand)) ? sortedHand[1].value : sortedHand[0].value,
    secondLowest: (hasJoker(hand)) ? sortedHand[2].value : sortedHand[1].value,
    highest     : sortedHand.slice(-1)[0].value
  }
  if (valueRange.lowest === 1 && valueRange.secondLowest >= 10) {
    valueRange.lowest = valueRange.secondLowest
    valueRange.highest= 14
  }
  if (valueRange.highest - maxDiff > valueRange.lowest) {
    return 0
  }
  valueRange.highestPossibleMatch = Math.max(14, valueRange.lowest + maxDiff)
  valueRange.lowestPossibleMatch  = Math.max( 1, valueRange.highest - maxDiff)
  
  const possibleHandRanges = []
  for (let i = valueRange.lowestPossibleMatch; i <= valueRange.highestPossibleMatch - maxDiff; i++) {
    possibleHandRanges.push([
      i,
      i+1,
      i+2,
      i+3,
      (i+4 - 1) % 13 + 1 // 14 -> 1
    ])
  }
  return possibleHandRanges
}

const valueSetsToUniquePairs = (valueSets) => {
  const valuePairings = []
  for (let index in valueSets) {
    const valueSet = valueSets[index]
    for (let i = 0; i < valueSet.length - 1; i++) {
      for (let j = i; j < valueSet.length; j++) {
        const lower = valueSet[i]
        const higher= valueSet[j]
        if (!valuePairings.hasOwnProperty(lower)) {
          valuePairings[lower] = []
        }
        if (!valuePairings[lower].includes(higher)) {
          valuePairings[lower].push(higher)
        }
      }
    }
  }
  // now we have lists of value pairings indexed by their lower value
  const valuePairs = []
  for (let lower in valuePairings) {
    const highers = valuePairings[lower]
    for (let index in highers) {
      const higher = highers[index]
      valuePairs.push([lower, higher])
    }
  }
  return valuePairs
}

const probabilityOfStraight = (hand, deck) => {
  if (distinctValuesCount(hand) < hand.length) {
    return 0
  }

  const possibleHandRanges = possibleStraightValueRanges(hand)

  const valuesInHand = hand.map(c => c.value).filter(value => value !== 0)

  const possibleMissingSets = possibleHandRanges.map(
    handRange => handRange.filter(value => !valuesInHand.includes(value))
  )

  const possibleMissingPairs = valueSetsToUniquePairs(possibleMissingSets)
  const probabilitiesPerPossiblePair = possibleMissingPairs.map(
    pair => probabilityOfGettingValues(pair[0], pair[1], deck)
  )
  
  return sum(probabilitiesPerPossiblePair)
}

const probabilityOfRoyalFlush = (hand, deck) => {
  if (!hasFlush(hand) || distinctValuesCount(hand) < hand.length ) {
    return 0
  }

  const sortedHand = sortHand(hand)
  if (sortedHand[0].value === 0) { // joker
    if ((sortedHand[1].value > 1 && sortedHand[1].value < 10) || sortedHand[2].value < 10) {
      return 0
    }
  } else {
    if ((sortedHand[0].value > 1 && sortedHand[0].value < 10) || sortedHand[1].value < 10) {
      return 0
    }
  }
  const possibleHandRange = [10,11,12,13,1]
  const valuesInHand = hand.map(c => c.value).filter(value => value !== 0)
  const possibleMissingSet = possibleHandRange.filter(
    value => !valuesInHand.includes(value)
  )
  const targetSuitShort = sortedHand.slice(-1)[0].suit.short
  const matchingCardsInDeck = deck.filter(
    card => card.value === 0 || (card.suit.short === targetSuitShort && possibleMissingSet.includes(card.value))
  )
  const k = matchingCardsInDeck.length
  const n = deck.length
  return (k / n) * ((k-1) / (n-1))
}

const probabilityOfStraightFlush = (hand, deck) => {
  if (!hasFlush(hand) || distinctValuesCount(hand) < hand.length ) {
    return 0
  }

  const possibleHandRanges = possibleStraightValueRanges(hand)
  const valuesInHand = hand.map(c => c.value).filter(value => value !== 0)
  const possibleMissingSets = possibleHandRanges.filter( handRange => (
    // Remove ranges that would also count as royal flush to avoid double counting
    !(handRange.includes(1) && handRange.includes(10))
  )).map(
    handRange => handRange.filter(value => !valuesInHand.includes(value))
  )
  const possibleMissingPairs = valueSetsToUniquePairs(possibleMissingSets)

  const highest = sortedHand.slice(-1)[0]
  const matchingCardsInDeck = sameSuitCards(highest)
  const n = deck.length

  const probabilitiesPerPossiblePair = possibleMissingPairs.map(
    pair => {
      const matchingCardsInDeckForPair = matchingCardsInDeck.filter( card => pair.includes(card.value) || card.value === 0)
      const k = matchingCardsInDeckForPair.length
      return (k / n) * ((k-1) / (n-1))
    }
  )
  return sum(probabilitiesPerPossiblePair)
}

const probabilityOfFullHouse = (hand, deck) => {
  const sortedHand = sortHand(hand)
  if (!hasNOfAKind(sortedHand, 2)) {
    return 0
  }
  const [lowest, secondLowest, highest] = sortedHand
  if (hasNOfAKind(sortedHand, 3)) {
    //any pair that is not the same value as these (highest.value)
    return probabilityOfGettingAPairOfCardsNotInHand(hand, deck)
  }
  if (lowest.value === 0) { // joker (without three of a kind)
    // P(fullHouse) == P(secondLowest, highest) + P(highest, secondLowest)
    return probabilityOfGettingValues(secondLowest.value, highest.value, deck, 'none')
  }
  // It's ok to get a card we have only one of + joker and still have only full house
  if (lowest.value === secondLowest.value) {
    return probabilityOfGettingValues(highest.value, lowest.value, deck, 'first')
  } else {
    return probabilityOfGettingValues(lowest.value, highest.value, deck, 'first')
  }
}

const probabilityOfTwoPairs = (hand, deck) => {
  if (hasNOfAKind(hand, 3) || hasJoker(hand)) {
    return 0
  }
  const sortedHand = sortHand(hand)
  const [lowest, secondLowest, highest] = sortedHand
  const n = deck.length
  const valueCountsInDeck = countValues(deck)
  const probabilityOfNewPair = probabilityOfGettingAPairOfCardsNotInHand(hand, deck)
  
  const lowestCountInDeck       = valueCountsInDeck[lowest.value]
  const secondLowestCountInDeck = valueCountsInDeck[secondLowest.value]
  const highestCountInDeck      = valueCountsInDeck[highest.value]

  if (lowest.value === secondLowest.value) { // must get (h && !(h || l)) or a pair of neither
    return probabilityOfPickingOneXButNoY(n, highestCountInDeck, lowestCountInDeck) +
           probabilityOfNewPair
  } else if (secondLowest.value === highest.value) { // (l && !(h ||l)) or a pair of neither
    return probabilityOfPickingOneXButNoY(n, lowestCountInDeck, highestCountInDeck) +
           probabilityOfNewPair
  }
  // We have distinct l, s, h => we must get either (l,s), (l,h) or (s,h)
  return probabilityOfGettingValues(lowest.value,       secondLowest.value, deck, 'none') +
         probabilityOfGettingValues(lowest.value,       highest.value,      deck, 'none') + 
         probabilityOfGettingValues(secondLowest.value, highest.value,      deck, 'none')
}

const probabilityOfPair10ToAce = (hand, deck, straightProbability = null) => {
  pOfStraight = straightProbability || probabilityOfStraight(hand, deck)
  if (hasNOfAKind(hand, 3)) {
    return 0
  }
  const valueCounts = countValues(hand)
  if (valueCounts.filter( (count, value) => (value > 1 && value < 10) && count > 1).length > 0) {
    return 0 // we have a pair 2..9
  }
  const sortedHand = sortHand(hand)
  const [lowest, secondLowest, highest] = sortedHand
  const joker = (lowest.value === 0)
  const valuesInHand = sortedHand.map( c => c.value).filter(value => value !== 0)
  const lowValuesInHand = valuesInHand.filter( value => value > 1 && value < 10)
  const highValuesInHand= valuesInHand.filter( value => value === 1 || value >= 10)
  const valueCountsInDeck = countValues(deck)
  const allValues = Array.from({length: 14}, (v, i) => i)
  const highValuesNotInHand = allValues.filter( value =>
    (value === 1 || value >= 10) && valueCounts[value] == 0
  )
  
  // H in comments. H' when values in hand are removed. h,hi,hj,hk \in H
  const highValues = [1,10,11,12,13]
  const n = deck.length

  const probabilitiesOfPairsByValue = valueCountsInDeck.map( (count, value) => (
    probabilityOfPickingTwoMatchingCards(n, count)
  ))
  const probabilitiesPerHighValue = highValues.map( high => {
    if (valueCounts[high] === 2 || (valueCounts[h] == 1 && joker)) {
      // P(pair of h | (h,h,x)), with Y = {y : y \notin [h,j, x]} ==
      // P(2 of Y) - P(pair of Y)
      // == P(pair of h | (j,h,x))
      const excludedValues = [0].concat(valuesInHand)
      const otherValuesCount = sum(valueCounts.filter( (count, value) =>
        !excludedValues.includes(value)
      ))
      const probabilityOfUnwantedPairs = sum(probabilitiesOfPairsByValue.filter( (count, value) =>
        !excludedValues.includes(value)
      ))
      return probabilityOfPickingTwoMatchingCards(n, otherValuesCount) -
             probabilityOfUnwantedPairs
    }
  })
  if (joker) {
    const acceptableValues = allValues.filter( value => 
      value !== 0 && valueCounts[value] === 0 // no second joker, no cards we already have a pair of
    )
    if (highValuesInHand.length === 0) {
      // We must pick exactly one of any high value combined with any other acceptable value
      // as long as it does not make a straight => sum over high values h by acceptable values a
      // P(h,a) : !hasStraight(hand, h, a)
      const probabilitiesPerHighValueNotInHand = highValuesNotInHand.map( value => {
          const acceptableSecondValues = acceptableValues.map( secondValue => {
            if (value === secondValue) { // we don't want a pair
              return 0
            }
            // to avoid a straight, if complete hand has an ace, it also must have one of 2..9
            // and if not, it must have one of 2..8
            if ((value === 1 || secondValue === 1) && (lowValuesInHand.length === 0)) {
                return 0
            } else if ((value > 1 && secondValue > 1) &&                       // no ace in hand
                       (lowValuesInHand.length === 0 || valueCounts[9] > 0) && // no 2..8 in hand already
                       secondValue > 8) {                                      // and not here
              return 0
            }
            return probabilityOfValuePairWithoutJoker(
              n,
              valueCountsInDeck[value],
              valueCountsInDeck[secondValue]
            )
          })
      })
      return sum(probabilitiesPerHighValueNotInHand)
    } else {
      // We must pick any (x,!x) from acceptable values
      const probabilitiesForCardValues = acceptableValues.map( value => 0 ) // TODO FIXME
    }
  } else {
    // non-10-A pair in hand
    if ((lowest.value > 1 && lowest.value < 10 && lowest.value === secondLowest.value) ||
        (highest.value < 10 && secondLowest.value == highest.value)) {
        return 0
    }
  }

  const lowValuesInHand = valuesInHand

  if (joker) {

  }

  const pairsResultingInAStraight = valueSetsToUniquePairs(
    possibleStraightValueRanges(hand).map(
      handRange => handRange.filter( value => !valuesInHand.includes(value))
  ))

  const makesAStraight = (lower, higher) => (
    -1 == pairsResultingInAStraight.findIndex( pair => (
      (lower === 0 && ( higher === pair[0] || higher === pair[1])) ||
       lower === pair[0] && higher === pair[1]
    ))
  )

  const possiblePairs = Array.from({length: 14}, (v, i) => i).map( value => (
    Array.from({length: 14 - value - 1}, (v, i) => [value, i + value + 1])
  )).reduce( (a,b) => a.concat(b), [])
  const acceptablePairs = possiblePairs.filter( pair => {
    const [lower, higher] = pair
    if (makesAStraight(lower, higher)) {
      return false
    }
    if (joker) {
      if (valueCounts[lower] > 0 || valueCounts[higher] > 0) { // would mean three of a kind
        return false
      }
    } else {
      if (valueCounts[lower]) return // TODO FIXME
    }
  })

  // Any of these is acceptable as "filler", since it doesn't pair with the hand
  const middleValues = [2,3,4,5,6,7,8,9]
  const unAcceptableOtherValues = middleValues.filter(
    v => valueCounts[v] > 0
  )
  const highValues = [1,10,11,12,13]
  // none of these is ok
  const valuesWithAPair      = highValues.filter(
    v => (joker && valueCounts[v] === 1) || valueCounts[v] === 2
  )
  // if there are no pairs, exactly one of any of these is ok
  const valuesWithOneMissing = highValues.filter(
    v => (joker && valueCounts[v] === 0) || valueCounts[v] === 1
  )
  // if there are no pairs, exactly two of these is ok
  const valuesWithTwoMissing = highValues.filter(
    v => !joker && valueCounts[v] === 0
  )
  if (valuesWithAPair.length > 0) { // (x,y): x != y && x, y not in hand
    const excludedValues = [].concat(valuesWithAPair, valuesWithOneMissing, unAcceptableOtherValues)
    const excludedCardsCount = sum(valueCountsInDeck.filter( (count, value) => (
      excludedValues.includes(value)
    )))
    const probabilitiesForCardValues = valueCountsInDeck.map( (count, value) => {
      if (excludedValues.includes(value)) {
        return 0
      }
      return probabilityOfPickingOneXButNoY(n, count, excludedCardsCount)
    })
    return sum(probabilitiesForCardValues)
  }
  // no existing pairs
  if (joker) { // joker without three of a kind
  }
  // TODO
}

const probabilitiesOfWins = (startingHand, choice, other, deck) => {
  const hand = sortHand(startingHand.concat(choice))
  const straightProbability = probabilityOfStraight(hand, deck)
  /*
  const probabilities = {
    fiveOfAKind   : probabilityOfNOfAKind(hand, deck, 5),
    royalFlush		: probabilityOfRoyalFlush(hand, deck),
    straightFlush	: probabilityOfStraightFlush(hand, deck),
    fourOfAKind 	: probabilityOfNOfAKind(hand, deck, 4),
    fullHouse		  : probabilityOfFullHouse(hand, deck),
    flush			    : probabilityOfFlush(hand, deck),
    straight		  : straightProbability,
    threeOfAKind	: probabilityOfNOfAKind(hand, deck, 3),
    twoPairs		  : probabilityOfTwoPairs(hand, deck),
    pair10ToAce		: probabilityOfPair10ToAce(hand, deck),
    none          : 0
  }
  probabilities.none = 1 - sum(probabilities)
  */
  // Alternative approach. Just count all the possibilities
  const probabilities = {
    fiveOfAKind   : 0,
    royalFlush		: 0,
    straightFlush	: 0,
    fourOfAKind 	: 0,
    fullHouse		  : 0,
    flush			    : 0,
    straight		  : 0,
    threeOfAKind	: 0,
    twoPairs		  : 0,
    pair10ToAce		: 0,
    none          : 0
  }
  const valueCounts = countValues(hand)
  const joker = valueCounts[0] > 0
  const flushSuit = hasFlush(hand) ? hand.slice(-1).suit.short : ''
  const [first, second, third] = hand
  const straightLimits = getStraightLimits(hand)
  const straightPossible = straightLimits.isPossible

  deck.forEach( firstPick => {
    deck.forEach( secondPick => {
      if (firstPick === secondPick) { return } // can't pick card twice
      
    })
  })
  return probabilities
}