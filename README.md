# Connect 4 – React + AI

A simple Connect 4 game built with React. Play against a friend or challenge the computer AI.

## Features

- **Two-player mode** – take turns dropping discs into a column.
- **AI mode** – play against a computer opponent powered by the Minimax algorithm with alpha-beta pruning.
- **Light-mode design** – clean white background with solid red and yellow discs.
- **Draw detection** – the game correctly detects a full board with no winner.

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 19 | UI rendering and state management |
| Vite | Development server and bundler |
| useState | Stores the board, current player, winner, draw flag, and game mode |
| useEffect | Checks win/draw after every move; triggers AI move in AI mode |

## How to Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Game Logic

The game board is a 6 × 7 two-dimensional array. Each cell holds `null`, `"Red"`, or `"Yellow"`.

When a player clicks a column the disc falls to the lowest empty row in that column. After the grid updates, a `useEffect` checks all four directions (horizontal, vertical, and both diagonals) for four matching discs in a row.

## AI Logic

The AI uses **Minimax with alpha-beta pruning** at a search depth of 4.

- The AI (Yellow) tries to **maximise** its score.
- The human (Red) is assumed to **minimise** the AI score.
- Alpha-beta pruning cuts branches that cannot change the final decision, making the search faster.

A heuristic evaluation function (`scoreGrid`) is used when the depth limit is reached. It scores the board by counting how many AI or human discs appear in every window of four consecutive cells.

For a detailed explanation of every function, algorithm step, and game tree example see **[explaination.md](./explaination.md)**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
