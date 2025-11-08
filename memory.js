// memory.js - منطق لعبة تحدي الذاكرة (إصدار محسّن للرموز)

document.addEventListener('DOMContentLoaded', () => {

    const memoryBoard = document.getElementById('memory-board');
    const timerDisplay = document.getElementById('timer');
    const movesDisplay = document.getElementById('moves');
    const remainingPairsDisplay = document.getElementById('remaining-pairs');
    const restartButton = document.getElementById('restart-button');
    const hintButton = document.getElementById('hint-button');

    // === (تعديل: استخدام رموز إيموجي حديثة وواضحة) ===
    const cardSymbols = ['🧠', '🚀', '🧪', '🕰️', '🗺️', '📏', '📚', '🏆']; // 8 أزواج واضحة
    // ===============================================
    
    let cards = [];
    let flippedCards = []; 
    let matchedPairs = 0;
    let moves = 0;
    let timer = 0;
    let timerInterval;
    let isGameActive = false;
    let hintCount = 3; 

    // --- وظائف مساعدة ---

    // 1. خلط المصفوفة (Fisher-Yates Shuffle)
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // 2. تحديث عرض العدادات
    function updateDisplay() {
        movesDisplay.textContent = moves;
        remainingPairsDisplay.textContent = cardSymbols.length - matchedPairs;
        hintButton.textContent = `تلميح (${hintCount})`;
        hintButton.disabled = hintCount <= 0 || !isGameActive;
    }

    // 3. بدء المؤقت
    function startTimer() {
        timer = 0;
        timerDisplay.textContent = '00:00';
        timerInterval = setInterval(() => {
            timer++;
            const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
            const seconds = (timer % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    // 4. إيقاف المؤقت
    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- منطق اللعبة ---

    // 1. تهيئة اللعبة وبناء الشبكة
    function initializeGame() {
        stopTimer();
        isGameActive = false;
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        hintCount = 3;
        updateDisplay();
        memoryBoard.innerHTML = '';
        memoryBoard.style.pointerEvents = 'auto'; // تفعيل النقر

        // إنشاء أزواج البطاقات
        cards = [...cardSymbols, ...cardSymbols];
        cards = shuffle(cards); // خلط البطاقات

        // تحديد حجم الشبكة (4x4 لـ 8 أزواج)
        const gridSize = 4; // 8 أزواج = 16 بطاقة (4x4)
        memoryBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        cards.forEach((symbol, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.symbol = symbol;
            cardElement.dataset.index = index;

            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-back"></div>
                    <div class="card-front">${symbol}</div>
                </div>
            `;
            cardElement.addEventListener('click', () => flipCard(cardElement));
            memoryBoard.appendChild(cardElement);
        });

        // إظهار البطاقات للحظات في البداية
        showAllCardsBriefly();
    }
    
    // إظهار جميع البطاقات للحظة في بداية اللعبة
    function showAllCardsBriefly() {
        memoryBoard.querySelectorAll('.memory-card').forEach(card => card.classList.add('flipped'));
        setTimeout(() => {
            memoryBoard.querySelectorAll('.memory-card').forEach(card => card.classList.remove('flipped'));
            startTimer(); // بدء المؤقت بعد قلب البطاقات
            isGameActive = true;
        }, 2000); // 2 ثانية إظهار
    }

    // 2. قلب البطاقة
    function flipCard(card) {
        if (!isGameActive || card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length === 2) {
            return;
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            updateDisplay();
            memoryBoard.style.pointerEvents = 'none'; // تعطيل النقر مؤقتاً
            setTimeout(checkForMatch, 1000); // التحقق بعد ثانية
        }
    }

    // 3. التحقق من التطابق
    function checkForMatch() {
        const [card1, card2] = flippedCards;

        if (card1.dataset.symbol === card2.dataset.symbol) {
            // تطابق! (تشغيل الاحتفال هنا لاحقًا)
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            updateDisplay();

            if (matchedPairs === cardSymbols.length) {
                // اللعبة انتهت
                stopTimer();
                isGameActive = false;
                setTimeout(() => {
                    alert(`تهانينا! أكملت اللعبة في ${moves} حركة و ${timer} ثانية!`);
                }, 500);
                // يمكنك تشغيل شريط ملون هنا إذا أردت
            }
        } else {
            // لا يوجد تطابق، اقلب البطاقات مرة أخرى
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }

        flippedCards = []; // إعادة تعيين البطاقات المفتوحة
        memoryBoard.style.pointerEvents = 'auto'; // إعادة تفعيل النقر
    }

    // 4. استخدام التلميح
    function useHint() {
        if (!isGameActive || hintCount <= 0 || flippedCards.length === 2 || matchedPairs === cardSymbols.length) {
            return;
        }

        hintCount--;
        updateDisplay();

        // (منطق البحث عن زوج متطابق وغير مكشوف)
        const unmatchedCards = Array.from(memoryBoard.querySelectorAll('.memory-card:not(.flipped):not(.matched)'));
        if (unmatchedCards.length < 2) return;

        let hintCard1 = null;
        let hintCard2 = null;

        const allSymbols = {};
        unmatchedCards.forEach(card => {
            const symbol = card.dataset.symbol;
            if (allSymbols[symbol]) {
                hintCard1 = allSymbols[symbol];
                hintCard2 = card;
            } else {
                allSymbols[symbol] = card;
            }
        });

        if (hintCard1 && hintCard2) {
            hintCard1.classList.add('flipped');
            hintCard2.classList.add('flipped');

            // إخفاء البطاقات بعد فترة
            setTimeout(() => {
                hintCard1.classList.remove('flipped');
                hintCard2.classList.remove('flipped');
            }, 1500); // تلميح لمدة 1.5 ثانية
        }
    }


    // --- ربط الأزرار ---
    restartButton.addEventListener('click', initializeGame);
    hintButton.addEventListener('click', useHint);

    // --- بدء اللعبة عند التحميل ---
    initializeGame();
});