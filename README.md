# poker

A simple poker game, that should at some point be an offline-first PWA using React Native Web and Next.js
A relatively current, possibly broken demo should be available at [https://poker.hirvinen.fi/](https://poker.hirvinen.fi/)

## ToDo

* Separate game logic and presentation
  * Reducers currently only handle game state, with the exception of cards reducer keeping track of whether the joker is entering or leaving play, instead of just whether it is in play or not.
  * Also, gamePhase currently contains phases that only reflect UI state.
    * Probably create UI state slice that contains those intermediate phases and which controls should be active
    * Expose to React either an "animation complete" action creator, or phase specific action creators?
  * Currently there are no safeguards against actions not appropriate to the game phase.
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
* Probabilities
  * Probabilities other than for pair 10-A should be working, but a simple test for that is difficult.
  * Especially if unnecessarily sorting hands for every test in classify is removed, it may well be faster to just brute force the possible combinations than to run currently existing individual tests.
* Testing