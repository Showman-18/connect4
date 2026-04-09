# Connect 4 Explanation

## What this game does
This project is a simple Connect 4 game made with React. Two players take turns clicking a column, and the disc falls into the lowest empty spot in that column.
It also has a second mode where you can play against a computer opponent.

## State variables used with `useState`

### `grid`
`grid` stores the whole game board.
It is a 6 x 7 array, which means 6 rows and 7 columns.
Each cell can be:
- `null` if it is empty
- `Red` if the red player placed a disc there
- `Yellow` if the yellow player placed a disc there

This is the main state for the game because the screen is drawn from it.

### `currentPlayer`
`currentPlayer` stores whose turn it is.
It starts as `Red`.
After every valid move, it changes to the other player.

### `winner`
`winner` stores the name of the player who has won the game.
It starts as `null` because nobody has won at the beginning.
When 4 discs in a row are found, this state becomes `Red` or `Yellow`.

### `isDraw`
`isDraw` stores whether the game ended in a draw.
It starts as `false`.
It becomes `true` when the grid is full and no player has won.

### `gameMode`
`gameMode` stores which mode is active.
It can be:
- `human` for two human players
- `ai` for human vs computer

When the mode changes, the game resets so the grid starts fresh.

## `useEffect` used in the game

The first `useEffect` checks the grid every time the `grid` state changes.

### What it does
1. It calls `getWinner(grid)`.
2. If a winner is found, it updates `winner` and clears `isDraw`.
3. If there is no winner, it checks whether all spaces are filled.
4. If the grid is full, it sets `isDraw` to `true`.
5. If the game is still running, it keeps `winner` as `null` and `isDraw` as `false`.

### Why `useEffect` is used here
`useEffect` is used because the winner should be checked after the grid updates.
That keeps the game logic simple:
- click a column
- update the grid
- let `useEffect` check if someone won

There is a second `useEffect` for AI mode.
It runs when the game mode is `ai` and it is the AI player's turn.
That effect waits a short time, finds the best move with minimax, and then drops the AI disc.

## Functions used in the game

### `createEmptyGrid()`
This function creates a fresh 6 x 7 empty board.
It is used when the game first starts and when the reset button is clicked.

### `getWinner(grid)`
This function checks the grid for 4 matching discs in a row.
It looks in 4 directions:
- horizontal
- vertical
- diagonal down-right
- diagonal down-left

If it finds 4 in a row, it returns the winner name.
If not, it returns `null`.

### `dropPiece(column)`
This function runs when a player clicks a column.
It does these steps:
1. Stops if the game is already over.
2. Stops if it is AI mode and it is not the human player's turn.
3. Finds the lowest empty cell in the clicked column.
4. Places the current player's disc there.
5. Updates the grid.
6. Switches to the next player.

### `resetGame()`
This function starts a new game.
It clears the board, sets the current player back to Red, and removes the winner/draw status.

### `changeMode(nextMode)`
This function switches between two-player mode and AI mode.
It also resets the game so the new mode starts from an empty board.

### `getBestAIMove(grid)`
This function finds the best move for the AI.
It uses minimax with alpha-beta pruning to look ahead at possible moves and choose the strongest one.

### `minimax(grid, depth, alpha, beta, isMaximizing)`
This is the main AI function.
It tries future moves in two ways:
- maximizing when the AI is choosing
- minimizing when the human is choosing

The function uses:
- `depth` to limit how far it looks ahead
- `alpha` as the best score found so far for the maximizing side
- `beta` as the best score found so far for the minimizing side

When `alpha` becomes greater than or equal to `beta`, the search stops early.
That is called alpha-beta pruning.

### `scoreGrid(grid)`
This function gives the grid a score when the search reaches the depth limit.
It prefers:
- center columns
- 3 in a row with one open space
- 2 in a row with two open spaces

It also gives negative scores if the human is close to winning.

## Detailed explanation of Minimax + Alpha-Beta Pruning

This section is a deep explanation of how the AI thinks.

### 1. Why we need Minimax
In Connect 4, one move is not enough to decide if a move is good.
If AI drops a disc now, the human answers next.
Then AI answers again.
So every move starts a chain of future moves.

Minimax helps us answer this question:
"If both players play well from here, which move gives the AI the best final result?"

### 2. Game tree idea
Minimax imagines future boards as a tree:
- Root node: current board
- Child node: board after one possible move
- Next level: opponent responses
- Next level: AI responses again

Each level is one turn.
At the end of the search (or when game ends), each leaf grid gets a numeric score.

Then scores move upward:
- AI level chooses the maximum score (best for AI)
- Human level chooses the minimum score (worst for AI, best for human)

That is why it is called "minimax": minimize and maximize alternate by turn.

### 3. Meaning of maximizing and minimizing in this project
- AI player is Yellow, so Yellow is maximizing.
- Human player is Red, so Red is minimizing.

If it is AI turn, function tries to make score as large as possible.
If it is human turn, function assumes human will try to reduce AI score as much as possible.

### 4. Terminal conditions (base cases)
In the code, recursion stops when one of these happens:
1. AI already wins on this grid.
2. Human already wins on this grid.
3. Search depth reaches 0.
4. Grid is full (draw position).

Then function returns a score immediately.

This is important because without stop conditions recursion would continue forever.

### 5. Depth-limited search
Connect 4 has many possible states, so searching full game tree is expensive.
So AI only looks ahead up to fixed depth (`SEARCH_DEPTH = 4` in this project).

Depth-limited search means:
- Faster AI move
- Not perfect play
- Good enough for a classroom project and still intelligent

### 6. Evaluation function: how non-final boards get score
If the grid is not a final win/loss and depth limit is reached, AI uses `scoreGrid(grid)`.

The scoring logic uses short patterns of 4 cells (called "windows"):
- 4 AI discs: very high positive score
- 3 AI + 1 empty: positive score
- 2 AI + 2 empty: smaller positive score
- 3 Human + 1 empty: negative score (danger)
- 2 Human + 2 empty: small negative

Also center column is rewarded because center positions participate in more possible 4-in-a-row lines.

So the AI is not random. It is guided by grid pattern quality.

### 7. Alpha-beta pruning meaning
Alpha-beta pruning is an optimization over minimax.
It gives same best move, but checks fewer branches.

Definitions:
- `alpha`: best score that maximizing side (AI) can guarantee so far
- `beta`: best score that minimizing side (human) can guarantee so far

Rule:
- If at any point `alpha >= beta`, we can stop exploring the remaining siblings in that branch.

Reason:
The current branch cannot improve final decision for parent node.
So extra calculation is wasted.

### 8. Simple pruning example
Suppose AI is maximizing.
At a maximizing node, AI already found one move with score = 20.
So `alpha = 20`.

Now AI explores another move that leads to a minimizing node.
Inside that minimizing node, human quickly finds an option scoring 10 for AI.
So `beta = 10` there.

Now `alpha (20) >= beta (10)`.
This means this branch can never beat AI's already known option (20).
So remaining children in that minimizing node are pruned (skipped).

### 9. Recursive flow in this code (step-by-step)
1. `getBestAIMove(grid)` calls `minimax(grid, depth, -Infinity, Infinity, true)`.
2. `true` means current node is maximizing (AI turn).
3. `minimax` gets all valid columns.
4. For each valid column:
	- Simulate move with `applyMove`.
	- Call `minimax` recursively with smaller depth and opposite maximizing flag.
5. If maximizing node:
	- Keep the move with highest child score.
	- Update `alpha`.
6. If minimizing node:
	- Keep the move with lowest child score.
	- Update `beta`.
7. If `alpha >= beta`, break loop (pruning).
8. Return best column and score to caller.
9. Top-level call returns the AI's chosen column.

### 10. Why AI still feels natural
The AI can:
- Block immediate threats
- Build its own 3-in-a-row and 2-in-a-row setups
- Prefer strategic center play

But it is not impossible to beat because:
- Search depth is limited
- Evaluation is heuristic, not perfect full-game solving

This balance is usually good for demos and teaching.

### 11. Time complexity intuition
If branching factor is about 7 (columns), depth 4 gives about $7^4 = 2401$ leaf paths (rough intuition).
With alpha-beta pruning, many branches are cut early, so practical search is often much smaller than plain minimax.

### 12. One-line summary for viva/presentation
"Minimax makes the AI choose the move with best worst-case outcome, and alpha-beta pruning skips branches that cannot affect the decision, making the search much faster without changing the final best move."

## How the game works in simple words
The grid is stored in state.
The player clicks a column.
The disc goes to the bottom empty space in that column.
After the grid changes, `useEffect` checks if there is a winner or a draw.
If someone gets 4 in a row, the game shows that player as the winner.
In AI mode, the computer checks the grid and chooses a move using minimax and alpha-beta pruning.

## Things to say to your teacher
- React is used to show the board on the screen.
- `useState` stores the grid and game information.
- `useEffect` checks the grid after every move.
- The game is simple because the grid is just a 2D array.
- The winner check is done by scanning the grid in four directions.
- The AI uses minimax to search possible moves and alpha-beta pruning to skip unnecessary branches.

## Step-by-step guide to explain to teacher

Use this order while presenting. It is designed so each part naturally connects to the next.

### Step 1: Start with the goal
"I built a Connect 4 game in React with two modes: two-player mode and AI mode."

### Step 2: Explain the data structure first (most important)
"The core data structure is a 2D array called `grid` of size 6 x 7."
"Each position is `null`, `Red`, or `Yellow`."
"So every move is just updating `grid[r][c]`."

### Step 3: Explain state variables
1. `grid`: stores full board data.
2. `currentPlayer`: whose turn now.
3. `winner`: winner name if someone wins.
4. `isDraw`: true if board is full with no winner.
5. `gameMode`: `human` or `ai`.

### Step 4: Explain helper functions
1. `createEmptyGrid()` creates fresh 6 x 7 grid.
2. `getAvailableRow(grid, c)` finds lowest empty row in that column.
3. `applyMove(grid, c, player)` creates next grid with one move applied.
4. `getValidColumns(grid)` returns playable columns.

### Step 5: Explain winner checking
"`getWinner(grid)` checks from every cell in 4 directions: horizontal, vertical, diagonal right, diagonal left."
"If 4 same discs are connected, it returns that player."

### Step 6: Explain React flow (`useEffect`)
1. First effect runs whenever `grid` changes.
2. It checks winner and draw.
3. Second effect runs only in AI mode when it is AI turn.
4. It computes best move and updates grid after a short delay.

### Step 7: Explain user move flow
"When user clicks a column, `dropPiece(c)` runs."
"It rejects invalid situations (game over, AI turn, full column)."
"Then it applies move and switches player."

### Step 8: Explain AI idea in plain words
"AI uses minimax to look ahead multiple moves and choose the best worst-case move."
"AI is maximizing, human is minimizing."

### Step 9: Explain alpha-beta pruning simply
"Alpha-beta pruning skips branches that cannot improve the result."
"So AI thinks faster but returns the same best move as normal minimax."

### Step 10: Explain evaluation function
"When depth limit is reached, `scoreGrid(grid)` estimates board quality."
"It rewards AI patterns (2 or 3 in a row) and penalizes human threats."
"It also rewards center column control."

### Step 11: Explain complexity briefly
"Without pruning, search grows quickly."
"With depth 4 and alpha-beta pruning, it is fast enough for smooth gameplay."

### Step 12: End with architecture summary
"So architecture is: 2D array state + move helper functions + winner logic + minimax AI + React rendering."
"This keeps code simple and easy to explain while still giving smart AI behavior."

## 60-second script you can say directly
"This project is a Connect 4 game built with React. I store the board as a 6 by 7 two-dimensional array called grid, where each cell is null, Red, or Yellow. When a player clicks a column, I place the disc in the lowest empty row of that column using helper functions. After every move, a useEffect checks if someone has 4 in a row in horizontal, vertical, or diagonal directions, and also checks draw condition. I added two modes: two-player mode and AI mode. In AI mode, Yellow is controlled by minimax with alpha-beta pruning. Minimax looks ahead several moves, assumes AI tries to maximize score and human tries to minimize it, and chooses the best worst-case move. Alpha-beta pruning removes branches that cannot affect the final decision, so AI becomes faster without changing correctness. The result is a simple and explainable structure with intelligent gameplay."