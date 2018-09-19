const wins = {
  fiveOfAKind		: {
    description: "Five of a kind",
    multiplier: 100
  },
	royalFlush		: {
    description: "Royal Flush",
    multiplier: 100
  },
	straightFlush	: {
    description: "Straight Flush",
    multiplier: 75
  },
	fourOfAKind 	: {
    description: "Four of a kind",
    multiplier: 50
  },
	fullHouse		  : {
    description: "Full House",
    multiplier: 20
  },
	flush			    : {
    description: "Flush",
    multiplier: 15
  },
	straight		  : {
    description: "Straight",
    multiplier: 11
  },
	threeOfAKind	: {
    description: "Three of a kind",
    multiplier: 5
  },
	twoPairs		  : {
    description: "Two pairs",
    multiplier: 3
  },
  pair10ToAce		: {
    description: "Pair 10-A",
    multiplier: 2
  },
}

const nullWin = {
  description: 'Nothing',
  multiplier : 0
}

export {
  wins,
  nullWin
}