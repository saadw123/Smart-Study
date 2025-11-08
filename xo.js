// xo.js - منطق لعبة XO (ضد الكمبيوتر)

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const statusMessage = document.getElementById('status-message');
    const restartBtn = document.getElementById('restart-btn');
    const cells = document.querySelectorAll('.cell');

    let gameBoard = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X"; // اللاعب يبدأ بـ X
    let gameActive = true;

    // --- أنماط الفوز الممكنة (Rows, Columns, Diagonals) ---
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // الصفوف
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // الأعمدة
        [0, 4, 8], [2, 4, 6]             // الأقطار
    ];

    // --- 1. تحديث الرسالة ---
    const updateStatus = (msg) => {
        statusMessage.textContent = msg;
    };

    // --- 2. التحقق من الفوز ---
    const checkWinner = () => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (
                gameBoard[a] &&
                gameBoard[a] === gameBoard[b] &&
                gameBoard[a] === gameBoard[c]
            ) {
                gameActive = false;
                // تمييز خلايا الفوز
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                updateStatus(`لقد فاز ${gameBoard[a]}!`);
                return true;
            }
        }

        // التحقق من التعادل
        if (!gameBoard.includes("") && gameActive) {
            gameActive = false;
            board.querySelectorAll('.cell').forEach(cell => cell.classList.add('draw'));
            updateStatus("تعادل!");
            return true;
        }

        return false;
    };

    // --- 3. حركة اللاعب ---
    const handlePlayerMove = (clickedCell, clickedCellIndex) => {
        if (gameBoard[clickedCellIndex] !== "" || !gameActive || currentPlayer !== "X") {
            return;
        }

        gameBoard[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = currentPlayer;

        if (checkWinner()) {
            return;
        }

        currentPlayer = "O";
        updateStatus("دور الحاسوب (O)...");

        // استدعاء حركة الحاسوب
        setTimeout(handleComputerMove, 500); // تأخير لجعل اللعب يبدو واقعيًا
    };

    // --- 4. حركة الحاسوب (المنطق الأساسي) ---
    const handleComputerMove = () => {
        if (!gameActive) return;

        // منطق بسيط: البحث عن الفوز أولاً، ثم البحث عن منع فوز اللاعب، ثم اللعب عشوائيًا
        let bestMove = getBestMove("O"); // محاولة الفوز
        if (bestMove === -1) {
            bestMove = getBestMove("X"); // محاولة منع اللاعب من الفوز
        }
        if (bestMove === -1) {
            bestMove = getRandomMove(); // حركة عشوائية
        }

        if (bestMove !== -1) {
            const cell = document.querySelector(`.cell[data-index="${bestMove}"]`);
            gameBoard[bestMove] = currentPlayer;
            cell.innerHTML = currentPlayer;

            if (checkWinner()) {
                return;
            }

            currentPlayer = "X";
            updateStatus("دورك (X)");
        }
    };

    // --- 5. منطق اختيار الحركة (Winning/Blocking Logic) ---
    const getBestMove = (player) => {
        for (const condition of winningConditions) {
            const [a, b, c] = condition;
            const cellsToCheck = [gameBoard[a], gameBoard[b], gameBoard[c]];

            // العد: كم خلية تخص اللاعب وكم خلية فارغة
            const playerCount = cellsToCheck.filter(c => c === player).length;
            const emptyCount = cellsToCheck.filter(c => c === "").length;

            if (playerCount === 2 && emptyCount === 1) {
                // وجدنا فرصة للفوز أو المنع!
                return condition.find(index => gameBoard[index] === "");
            }
        }
        return -1; // لا توجد فرصة واضحة
    };

    // --- 6. حركة عشوائية ---
    const getRandomMove = () => {
        const availableMoves = gameBoard
            .map((val, index) => (val === "" ? index : -1))
            .filter(index => index !== -1);

        // تفضيل الوسط إذا كان متاحًا
        if (availableMoves.includes(4)) return 4;
        
        if (availableMoves.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableMoves.length);
            return availableMoves[randomIndex];
        }
        return -1;
    };

    // --- 7. إعادة اللعب ---
    const restartGame = () => {
        gameBoard = ["", "", "", "", "", "", "", "", ""];
        gameActive = true;
        currentPlayer = "X";
        board.querySelectorAll('.cell').forEach(cell => {
            cell.innerHTML = "";
            cell.classList.remove('winner', 'draw');
        });
        updateStatus("ابدأ اللعب (أنت X)");
    };

    // --- 8. ربط الأحداث ---
    cells.forEach(cell => {
        cell.addEventListener('click', (e) => {
            const clickedCellIndex = parseInt(e.target.getAttribute('data-index'));
            handlePlayerMove(e.target, clickedCellIndex);
        });
    });

    restartBtn.addEventListener('click', restartGame);

    // بدء اللعبة عند التحميل
    updateStatus("ابدأ اللعب (أنت X)");
});