let rows = 10;
let cols = 10;
let bombCount = 10;
let board = [];
let gameOver = false;

//  Timer kek stopwacth
let timerInterval;
let timeElapsed = 0;
let timerStarted = false;

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const timerElement = document.getElementById("timer");
const popup = document.getElementById("popup");
const popupMsg = document.getElementById("popup-message");

function createBoard() {
  boardElement.innerHTML = "";
  board = [];
  gameOver = false;
  statusElement.textContent = "";
  statusElement.className = "";
  popup.style.display = "none"; // hide popup on restart

  // Reset timer
  clearInterval(timerInterval);
  timeElapsed = 0;
  timerStarted = false;
  timerElement.textContent = "⏱ 0s";

  //  Cell sze dinamis
  let maxBoardWidth = window.innerWidth * 0.9;
  let cellSize = Math.floor(maxBoardWidth / cols);
  cellSize = Math.min(cellSize, 40);

  boardElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  boardElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < cols; c++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.style.width = cellSize + "px";
      cell.style.height = cellSize + "px";
      boardElement.appendChild(cell);
      row.push({ bomb: false, open: false, flagged: false, element: cell });
    }
    board.push(row);
  }

  // Tanam bom
  let bombsPlaced = 0;
  while (bombsPlaced < bombCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].bomb) {
      board[r][c].bomb = true;
      bombsPlaced++;
    }
  }

  // Listener
  boardElement.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("click", leftClick);
    cell.addEventListener("contextmenu", rightClick);
  });
}

// ngitung bom
function countBombs(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      let nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (board[nr][nc].bomb) count++;
      }
    }
  }
  return count;
}

// Klik kiri
function leftClick(e) {
  if (gameOver) return;

  // ngestart timer
  if (!timerStarted) {
    timerStarted = true;
    timerInterval = setInterval(() => {
      timeElapsed++;
      timerElement.textContent = `⏱ ${timeElapsed}s`;
    }, 1000);
  }

  let r = parseInt(e.target.dataset.row);
  let c = parseInt(e.target.dataset.col);
  openCell(r, c);
}

// Klik kanan
function rightClick(e) {
  e.preventDefault();
  if (gameOver) return;
  let r = parseInt(e.target.dataset.row);
  let c = parseInt(e.target.dataset.col);
  let current = board[r][c];

  if (!current.open) {
    current.flagged = !current.flagged;
    current.element.innerHTML = current.flagged ? `<img src="rialo.png" width="18">` : "";
    current.element.classList.toggle("flag");
  }
}

// Buka cell
function openCell(r, c) {
  let current = board[r][c];
  if (current.open || current.flagged) return;

  current.open = true;
  current.element.classList.add("open");

  if (current.bomb) {
    current.element.classList.add("bomb");
    current.element.innerHTML = "";
    gameOver = true;
    clearInterval(timerInterval);

    // ngeluarin popup lose
    popupMsg.innerHTML = `
      <div class="line1">💥 GAME OVER 💥</div>
      <div class="line2">☠️ RIALO EXPLODED ☠️</div>
    `;
    popupMsg.style.color = "red";
    popupMsg.style.border = "3px solid red";
    popupMsg.style.boxShadow = "0 0 15px rgba(255,0,0,0.8)";
    popup.style.display = "flex";

    revealAll();
    return;
  }

  let bombs = countBombs(r, c);
  if (bombs > 0) {
    current.element.textContent = bombs;
    current.element.style.color = getColor(bombs);
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          openCell(nr, nc);
        }
      }
    }
  }

  checkWin();
}

// Warna angka
function getColor(num) {
  const colors = ["blue", "green", "red", "purple", "maroon", "turquoise", "black", "gray"];
  return colors[num - 1] || "black";
}

// tampilan semua bom
function revealAll() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].bomb) {
        board[r][c].element.classList.add("bomb");
        board[r][c].element.innerHTML = "";
      }
    }
  }
}

// Cek menang
function checkWin() {
  let opened = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].open) opened++;
    }
  }
  if (opened === rows * cols - bombCount) {
    gameOver = true;
    clearInterval(timerInterval);

    // popup win
    popupMsg.innerHTML = `
      <div class="line1">🎉 YOU WIN 🎉</div>
      <div class="line2">🏆 MINESWEEPERIALO MASTER 🏆</div>
    `;
    popupMsg.style.color = "lime";
    popupMsg.style.border = "3px solid lime";
    popupMsg.style.boxShadow = "0 0 15px rgba(0,255,0,0.8)";
    popup.style.display = "flex";

    revealAll();
  }
}

// pilih Mode
function setMode(c, bombs) {
  rows = 10;
  cols = Math.min(c, 30);
  bombCount = bombs;
  createBoard();
}

createBoard();
