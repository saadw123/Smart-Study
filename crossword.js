// crossword.js - منطق لعبة الكلمات المتقاطعة (الإصدار التفاعلي)

document.addEventListener('DOMContentLoaded', () => {

    const boardElement = document.getElementById('crossword-board');
    const cluesAcrossElement = document.getElementById('clues-across');
    const cluesDownElement = document.getElementById('clues-down');
    const checkBtn = document.getElementById('check-btn');
    const revealBtn = document.getElementById('reveal-btn');
    const currentClueText = document.getElementById('current-clue-text'); // العنصر الجديد
    
    let grid = []; // المصفوفة التي ستحمل حالة اللعب
    let crosswordData = {}; // بيانات الألغاز والحلول
    let activeDirection = 'across'; // الاتجاه النشط حالياً (للانتقال التلقائي)

    // بيانات اللغز الثابتة (مثال: شبكة 10x10)
    const INITIAL_PUZZLE = {
        size: 10,
        words: [
            // [row, col, direction, word, clue]
            [1, 1, 'across', 'نيوتن', 'عالم اكتشف قانون الجاذبية.'],
            [1, 1, 'down', 'نجم', 'جسم سماوي مضيء.'],
            [3, 3, 'across', 'كيمياء', 'علم يهتم بدراسة المادة.'],
            [5, 4, 'down', 'زمن', 'المسافة بين الأحداث.'],
            [3, 8, 'down', 'لغة', 'أداة للتواصل الإنساني.'],
            [5, 0, 'across', 'جاذبية', 'قوة طبيعية تسحب الأجسام لبعضها.'],
            [7, 3, 'down', 'تاريخ', 'علم يهتم بدراسة الماضي.'],
            [5, 6, 'across', 'برمجة', 'كتابة التعليمات للحاسوب.'],
        ]
    };

    // --- 1. تهيئة الشبكة (Initialization) ---
    function initializeGrid() {
        crosswordData = INITIAL_PUZZLE;
        const size = crosswordData.size;
        
        // إنشاء شبكة فارغة مملوءة بـ 0
        grid = Array(size).fill(0).map(() => Array(size).fill({ char: '', type: 'empty', clueNum: null, wordKey: null }));
        
        // ملء الشبكة بالكلمات وتحديد أرقام الألغاز
        crosswordData.words.forEach((wordInfo, index) => {
            let [r, c, direction, word, clue] = wordInfo;
            const wordKey = `${index + 1}-${direction}`;
            
            for (let i = 0; i < word.length; i++) {
                const row = r + (direction === 'down' ? i : 0);
                const col = c + (direction === 'across' ? i : 0);
                
                if (row >= size || col >= size) continue;
                
                let type = 'letter';
                let clueNum = grid[row][col].clueNum;

                if (i === 0) {
                    type = 'clue-start';
                    clueNum = index + 1;
                }

                grid[row][col] = {
                    char: word[i],
                    type: type,
                    clueNum: clueNum,
                    wordKey: grid[row][col].wordKey ? `${grid[row][col].wordKey},${wordKey}` : wordKey
                };
            }
        });
    }

    // --- 2. بناء واجهة الشبكة (Rendering) ---
    function renderBoard() {
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${crosswordData.size}, 40px)`;
        
        for (let r = 0; r < crosswordData.size; r++) {
            for (let c = 0; c < crosswordData.size; c++) {
                const cellData = grid[r][c];
                const cell = document.createElement('input');
                cell.className = 'crossword-cell';
                cell.maxLength = 1;
                cell.readOnly = cellData.char === '';
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (cellData.char === '') {
                    cell.classList.add('empty');
                } else {
                    // إضافة رقم اللغز في الزاوية
                    if (cellData.clueNum) {
                        const clueNumSpan = document.createElement('span');
                        clueNumSpan.className = 'clue-number';
                        clueNumSpan.textContent = cellData.clueNum;
                        cell.appendChild(clueNumSpan);
                    }
                    
                    cell.dataset.solution = cellData.char;
                    cell.dataset.wordKeys = cellData.wordKey; // لربط الخلايا بالكلمات

                    cell.addEventListener('input', handleCellInput);
                    // === (جديد) إضافة مستمع حدث النقر ===
                    cell.addEventListener('click', handleCellClick);
                }
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    // --- 3. بناء قائمة الألغاز ---
    function renderClues() {
        cluesAcrossElement.innerHTML = '';
        cluesDownElement.innerHTML = '';
        
        crosswordData.words.forEach((wordInfo, index) => {
            const [r, c, direction, word, clue] = wordInfo;
            const clueNumber = index + 1;
            const listItem = document.createElement('li');
            listItem.className = 'clue-item';
            listItem.dataset.wordKey = `${clueNumber}-${direction}`;
            listItem.textContent = `${clueNumber}. ${clue}`;

            if (direction === 'across') {
                cluesAcrossElement.appendChild(listItem);
            } else {
                cluesDownElement.appendChild(listItem);
            }
        });
    }


    // ===============================================
    // منطق التفاعل (التظليل والتلميح)
    // ===============================================

    // --- 4. معالجة النقر على الخلية ---
    function handleCellClick(e) {
        const cell = e.target;
        const keys = cell.dataset.wordKeys.split(','); // كل الكلمات المرتبطة بهذه الخلية
        
        // (افتراضياً، نختار الاتجاه الأفقي أولاً إذا كان متاحاً)
        let primaryKey = keys.find(key => key.includes('across')) || keys[0];

        // === (جديد) تبديل الاتجاه ===
        // إذا كانت الخلية مظللة بالفعل بالاتجاه النشط، ننتقل للاتجاه الآخر (للتقاطعات)
        if (cell.classList.contains('highlighted') && keys.length > 1) {
            const currentDir = primaryKey.split('-')[1];
            const nextDir = currentDir === 'across' ? 'down' : 'across';
            primaryKey = keys.find(key => key.includes(nextDir)) || primaryKey;
        }

        highlightWord(primaryKey, cell);
    }
    
    // --- 5. دالة التظليل وعرض التلميح ---
    function highlightWord(wordKey, activeCell = null) {
        // 1. إزالة التظليل السابق
        boardElement.querySelectorAll('.crossword-cell').forEach(cell => {
            cell.classList.remove('highlighted', 'active');
        });
        document.querySelectorAll('.clue-item').forEach(clue => clue.classList.remove('active-clue'));

        // 2. تحديد الكلمة (WordInfo) والتلميح
        const clueIndex = parseInt(wordKey.split('-')[0]) - 1;
        const wordInfo = crosswordData.words[clueIndex];
        const direction = wordKey.split('-')[1];
        
        if (!wordInfo) return;

        // 3. عرض التلميح في الشريط العلوي
        currentClueText.textContent = `${wordInfo[0]}-${wordInfo[1]} (${direction === 'across' ? 'أفقي' : 'رأسي'}): ${wordInfo[4]}`;
        
        // 4. تظليل الكلمة في الشبكة
        for (let i = 0; i < wordInfo[3].length; i++) {
            const r = wordInfo[0] + (direction === 'down' ? i : 0);
            const c = wordInfo[1] + (direction === 'across' ? i : 0);
            
            const cell = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell && !cell.classList.contains('empty')) {
                cell.classList.add('highlighted');
            }
        }
        
        // 5. تظليل الخلية النشطة (للكتابة)
        if (activeCell) {
            activeCell.classList.add('active');
            activeCell.focus();
        }

        // 6. تظليل التلميح في القائمة الجانبية
        const clueEl = document.querySelector(`.clue-item[data-word-key="${wordKey}"]`);
        if (clueEl) {
            clueEl.classList.add('active-clue');
        }
        
        activeDirection = direction; // حفظ الاتجاه للانتقال التلقائي
    }

    // --- 6. معالجة إدخال الحروف (Cell Input) ---
    function handleCellInput(e) {
        const input = e.target;
        const char = input.value.toUpperCase().slice(0, 1);
        input.value = char;
        
        // إذا كان هناك حرف، انتقل للخلية التالية في الاتجاه النشط
        if (input.value.length === 1 && char) {
            const nextInput = getNextInput(input, activeDirection);
            if (nextInput) {
                nextInput.focus();
                // (نقوم بتظليل الكلمة الجديدة عند الانتقال)
                highlightWord(input.dataset.wordKeys.split(',').find(k => k.includes(activeDirection)), nextInput); 
            }
        }
    }

    // --- دالة مساعدة للانتقال التلقائي ---
    function getNextInput(currentInput, direction) {
        const r = parseInt(currentInput.dataset.row);
        const c = parseInt(currentInput.dataset.col);
        const size = crosswordData.size;

        let nextR = r;
        let nextC = c;

        if (direction === 'across') {
            nextC++;
        } else if (direction === 'down') {
            nextR++;
        }

        // البحث عن الخلية التالية القابلة للكتابة
        while (nextR < size && nextC < size) {
            const nextCell = boardElement.querySelector(`[data-row="${nextR}"][data-col="${nextC}"]`);
            if (nextCell && !nextCell.classList.contains('empty')) {
                return nextCell;
            }
            // إذا كانت الخلية فارغة أو غير موجودة، نوقف البحث في هذا الاتجاه
            return null; 
        }
        return null;
    }


    // --- ربط الأحداث ---
    checkBtn.addEventListener('click', checkAnswers);
    revealBtn.addEventListener('click', revealSolution);

    // --- دالة التحقق من الإجابات (كما هي) ---
    function checkAnswers() {
        let correctCount = 0;
        let totalCount = 0;
        let isSolved = true;
        
        // ... (الكود الكامل للتحقق من الإجابات) ...
        boardElement.querySelectorAll('.crossword-cell').forEach(cell => {
            cell.classList.remove('correct', 'incorrect');
        });

        boardElement.querySelectorAll('input:not(.empty)').forEach(input => {
            const userChar = input.value.toUpperCase();
            const solutionChar = input.dataset.solution.toUpperCase();
            totalCount++;

            if (userChar === solutionChar && userChar !== '') {
                correctCount++;
                input.classList.add('correct');
            } else if (userChar !== '') {
                input.classList.add('incorrect');
                isSolved = false;
            } else {
                isSolved = false;
            }
        });

        if (isSolved) {
            alert('تهانينا! لقد حللت اللغز بنجاح!');
            document.getElementById('status-message').textContent = '✅ اللغز محلول بالكامل!';
        } else {
            const percentage = ((correctCount / totalCount) * 100).toFixed(0);
            document.getElementById('status-message').textContent = `تم التحقق: ${percentage}% صحيح. حاول مجدداً!`;
        }
    }

    // --- دالة إظهار الحل (كما هي) ---
    function revealSolution() {
        boardElement.querySelectorAll('input:not(.empty)').forEach(input => {
            input.value = input.dataset.solution;
            input.classList.add('winner');
            input.readOnly = true;
        });
        document.getElementById('status-message').textContent = 'الحل تم إظهاره.';
        gameActive = false;
    }


    // --- بدء اللعبة ---
    initializeGrid();
    renderBoard();
    renderClues();
    // تظليل أول كلمة عند البدء
    highlightWord('1-across', boardElement.querySelector('[data-index="1"]')); 
});