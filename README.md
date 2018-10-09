# poker

A simple poker game, that should at some point be an offline-first PWA using React Native Web and Next.js
A relatively current, possibly broken demo should be available at [https://poker.hirvinen.fi/](https://poker.hirvinen.fi/)

## ToDo

* Separate game logic and presentation
  * To facilitate time travel etc, use redux in game module
    * The game module itself would have little reason not to shuffle the actual deck instead of a separate order array
    * Maybe render dummy cards for those that are not part of the deal, and only render the top 8 cards with real card values...
* Performance
  * Use end of animation and transition events with requestAnimationFrame to trigger phase changes, and only use time as a fallback
    * Singleton handler that keeps track of all started transitions and animations
      * This should avoid the possibility of interrupted transitions
* PWA
  * With current functionality, a service worker is only needed to cache the game itself and its assets
  * manifest
* Store game state
  * Probably just localstorage
* Other visuals
  * Jokers
    * Use an image for consistency
  * Use images instead of unicode for suits?
  * Fancier card faces
* Stylesheets as components?
* Restructure to use a preprocessor or style components directly?
* Add some kinf of info modal
* Classify
  * Maybe refactor individual tests to assume the hand is sorted and only sort once in classify?
* Probabilities
  * Probabilities other than for pair 10-A should be working, but a simple test for that is difficult.
  * Especially if unnecessarily sorting hands for every test in classify is removed, it may well be faster to just brute force the possible combinations than to run currently existing individual tests.
* Testing