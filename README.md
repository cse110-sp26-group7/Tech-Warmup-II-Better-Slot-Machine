# Data Heist - Slot Machine Game

A web-based slot machine game built as part of CSE110 Tech Warmup II.

## Project Structure

```
/src
  index.html          - Main HTML entry point
  /css
    styles.css        - Game styles
  /js
    main.js           - Main game logic and initialization
    rng.js            - Random number generator
    reels.js          - Reel mechanics
    paylines.js       - Payline configuration and checking
    payout.js         - Payout calculation
    ui.js             - UI rendering and updates
    audio.js          - Audio management
    state.js          - Game state management
/tests
  rng.test.js         - RNG module tests
  payout.test.js      - Payout module tests
  paylines.test.js    - Paylines module tests
/assets
  /symbols            - Symbol images
  /audio              - Sound effects and music
  /fonts              - Custom fonts
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm start
```

## Scripts

- `npm start` - Start development server on http://localhost:8080
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Development Guidelines

- Use single quotes for strings
- Semicolons are required
- No unused variables allowed
- Avoid console.log in production code
- Write unit tests for core logic modules
