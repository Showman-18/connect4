import { useEffect, useState } from 'react'
import './App.css'

const ROWS = 6
const COLUMNS = 7
const HUMAN_PLAYER = 'Red'
const AI_PLAYER = 'Yellow'
const HUMAN_MODE = 'human'
const AI_MODE = 'ai'
const SEARCH_DEPTH = 4

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null))
}

function cloneGrid(grid) {
  return grid.map((row) => [...row])
}

function getAvailableRow(grid, column) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (grid[row][column] === null) {
      return row
    }
  }

  return -1
}

function getValidColumns(grid) {
  const validColumns = []

  for (let column = 0; column < COLUMNS; column += 1) {
    if (grid[0][column] === null) {
      validColumns.push(column)
    }
  }

  return validColumns
}

function applyMove(grid, column, player) {
  const row = getAvailableRow(grid, column)

  if (row === -1) {
    return null
  }

  const nextGrid = cloneGrid(grid)
  nextGrid[row][column] = player
  return nextGrid
}

function getWinner(grid) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ]

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const player = grid[row][column]

      if (!player) {
        continue
      }

      for (const [rowStep, columnStep] of directions) {
        let matchCount = 1

        for (let step = 1; step < 4; step += 1) {
          const nextRow = row + rowStep * step
          const nextColumn = column + columnStep * step

          if (
            nextRow < 0 ||
            nextRow >= ROWS ||
            nextColumn < 0 ||
            nextColumn >= COLUMNS ||
            grid[nextRow][nextColumn] !== player
          ) {
            break
          }

          matchCount += 1
        }

        if (matchCount === 4) {
          return player
        }
      }
    }
  }

  return null
}

function evaluateWindow(window) {
  const aiCount = window.filter((cell) => cell === AI_PLAYER).length
  const humanCount = window.filter((cell) => cell === HUMAN_PLAYER).length
  const emptyCount = window.filter((cell) => cell === null).length

  if (aiCount === 4) {
    return 1000
  }

  if (humanCount === 4) {
    return -1000
  }

  if (aiCount === 3 && emptyCount === 1) {
    return 50
  }

  if (aiCount === 2 && emptyCount === 2) {
    return 10
  }

  if (humanCount === 3 && emptyCount === 1) {
    return -80
  }

  if (humanCount === 2 && emptyCount === 2) {
    return -10
  }

  return 0
}

function scoreGrid(grid) {
  let score = 0

  const centerColumn = Math.floor(COLUMNS / 2)
  const centerColumnValues = grid.map((row) => row[centerColumn])
  score +=
    centerColumnValues.filter((cell) => cell === AI_PLAYER).length * 3

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS - 3; column += 1) {
      score += evaluateWindow(grid[row].slice(column, column + 4))
    }
  }

  for (let column = 0; column < COLUMNS; column += 1) {
    for (let row = 0; row < ROWS - 3; row += 1) {
      score += evaluateWindow([
        grid[row][column],
        grid[row + 1][column],
        grid[row + 2][column],
        grid[row + 3][column],
      ])
    }
  }

  for (let row = 0; row < ROWS - 3; row += 1) {
    for (let column = 0; column < COLUMNS - 3; column += 1) {
      score += evaluateWindow([
        grid[row][column],
        grid[row + 1][column + 1],
        grid[row + 2][column + 2],
        grid[row + 3][column + 3],
      ])
    }
  }

  for (let row = 3; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS - 3; column += 1) {
      score += evaluateWindow([
        grid[row][column],
        grid[row - 1][column + 1],
        grid[row - 2][column + 2],
        grid[row - 3][column + 3],
      ])
    }
  }

  return score
}

function minimax(grid, depth, alpha, beta, isMaximizing) {
  const winner = getWinner(grid)
  const validColumns = getValidColumns(grid)
  const gridIsFull = validColumns.length === 0

  if (winner === AI_PLAYER) {
    return { column: null, score: 100000 + depth }
  }

  if (winner === HUMAN_PLAYER) {
    return { column: null, score: -100000 - depth }
  }

  if (depth === 0 || gridIsFull) {
    return { column: null, score: scoreGrid(grid) }
  }

  if (isMaximizing) {
    let bestScore = -Infinity
    let bestColumn = validColumns[0]

    for (const column of validColumns) {
      const nextGrid = applyMove(grid, column, AI_PLAYER)

      if (!nextGrid) {
        continue
      }

      const result = minimax(nextGrid, depth - 1, alpha, beta, false)

      if (result.score > bestScore) {
        bestScore = result.score
        bestColumn = column
      }

      alpha = Math.max(alpha, bestScore)

      if (alpha >= beta) {
        break
      }
    }

    return { column: bestColumn, score: bestScore }
  }

  let bestScore = Infinity
  let bestColumn = validColumns[0]

  for (const column of validColumns) {
    const nextGrid = applyMove(grid, column, HUMAN_PLAYER)

    if (!nextGrid) {
      continue
    }

    const result = minimax(nextGrid, depth - 1, alpha, beta, true)

    if (result.score < bestScore) {
      bestScore = result.score
      bestColumn = column
    }

    beta = Math.min(beta, bestScore)

    if (alpha >= beta) {
      break
    }
  }

  return { column: bestColumn, score: bestScore }
}

function getBestAIMove(grid) {
  return minimax(grid, SEARCH_DEPTH, -Infinity, Infinity, true).column
}

function App() {
  const [grid, setGrid] = useState(createEmptyGrid)
  const [currentPlayer, setCurrentPlayer] = useState(HUMAN_PLAYER)
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)
  const [gameMode, setGameMode] = useState(HUMAN_MODE)

  useEffect(() => {
    const gameWinner = getWinner(grid)

    if (gameWinner) {
      setWinner(gameWinner)
      setIsDraw(false)
      return
    }

    const gridIsFull = grid.every((row) => row.every((cell) => cell !== null))

    setWinner(null)
    setIsDraw(gridIsFull)
  }, [grid])

  useEffect(() => {
    if (gameMode !== AI_MODE || currentPlayer !== AI_PLAYER || winner || isDraw) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      const aiMove = getBestAIMove(grid)

      if (aiMove === null || aiMove === undefined) {
        return
      }

      const nextGrid = applyMove(grid, aiMove, AI_PLAYER)

      if (!nextGrid) {
        return
      }

      setGrid(nextGrid)
      setCurrentPlayer(HUMAN_PLAYER)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [grid, currentPlayer, gameMode, isDraw, winner])

  function dropPiece(column) {
    if (winner || isDraw) {
      return
    }

    if (gameMode === AI_MODE && currentPlayer !== HUMAN_PLAYER) {
      return
    }

    const nextGrid = applyMove(grid, column, currentPlayer)

    if (!nextGrid) {
      return
    }

    setGrid(nextGrid)
    setCurrentPlayer((previousPlayer) =>
      previousPlayer === HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER,
    )
  }

  function resetGame() {
    setGrid(createEmptyGrid())
    setCurrentPlayer(HUMAN_PLAYER)
    setWinner(null)
    setIsDraw(false)
  }

  function changeMode(nextMode) {
    setGameMode(nextMode)
    setGrid(createEmptyGrid())
    setCurrentPlayer(HUMAN_PLAYER)
    setWinner(null)
    setIsDraw(false)
  }

  const statusMessage = winner
    ? `${winner} wins the game!`
    : isDraw
      ? 'The game is a draw.'
      : gameMode === AI_MODE && currentPlayer === AI_PLAYER
        ? 'AI is thinking...'
        : gameMode === AI_MODE
          ? 'You are Red. Yellow is the AI.'
          : `${currentPlayer}'s turn`

  return (
    <main className="game-shell">
      <section className="game-panel">
        <p className="eyebrow">Simple React Connect 4</p>
        <h1>Drop discs into a column</h1>
        <div className="mode-row" role="group" aria-label="Game mode">
          <button
            type="button"
            className={`mode-button ${gameMode === HUMAN_MODE ? 'active' : ''}`}
            onClick={() => changeMode(HUMAN_MODE)}
          >
            Two Players
          </button>
          <button
            type="button"
            className={`mode-button ${gameMode === AI_MODE ? 'active' : ''}`}
            onClick={() => changeMode(AI_MODE)}
          >
            Play vs AI
          </button>
        </div>
        <p className="status">{statusMessage}</p>

        <div className="board" role="grid" aria-label="Connect 4 board">
          {grid.map((row, rowIndex) =>
            row.map((cell, columnIndex) => (
              <button
                key={`${rowIndex}-${columnIndex}`}
                type="button"
                className="cell"
                onClick={() => dropPiece(columnIndex)}
                aria-label={`Column ${columnIndex + 1}`}
              >
                <span className={`disc ${cell ? cell.toLowerCase() : ''}`} />
              </button>
            )),
          )}
        </div>

        <button type="button" className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
      </section>
    </main>
  )
}

export default App
