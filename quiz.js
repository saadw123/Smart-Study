// quiz.js (الإصدار النهائي والمُحسن)

document.addEventListener('DOMContentLoaded', async () => {
    
    let siteData = {}; 
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // --- 1. جلب البيانات من الخادم ---
    try {
        const response = await fetch('/api/content');
        siteData = await response.json();
    } catch (err) {
        document.getElementById('quiz-title').textContent = "خطأ في الاتصال بالخادم";
        return;
    }

    // --- 2. قراءة الاختبار من الرابط (URL) ---
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('quiz');
    const subjectId = quizId ? quizId.replace('-quiz', '') : null;

    // --- 3. تحديد عناصر الصفحة ---
    const quizIntro = document.getElementById('quiz-intro');
    const quizMain = document.getElementById('quiz-main');
    const quizResults = document.getElementById('quiz-results');
    const quizTitleEl = document.getElementById('quiz-title');
    const questionCounterEl = document.getElementById('question-counter');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainerEl = document.getElementById('options-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const resultContentEl = document.getElementById('result-card-content');
    const resultIconEl = document.getElementById('result-icon');
    const resultTitleEl = document.getElementById('result-title');
    const resultScoreEl = document.getElementById('result-score');
    const retryQuizBtn = document.getElementById('retry-quiz-btn');
    const backToLessonBtn = document.getElementById('back-to-lesson-btn');

    // تحديد عنصر الصوت
    const winSound = document.getElementById('win-sound');

    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let score = 0;

    // --- 4. تحميل بيانات الاختبار ---
    if (quizId && siteData.quizzes && siteData.quizzes[quizId]) {
        currentQuiz = siteData.quizzes[quizId];
        quizTitleEl.textContent = currentQuiz.title;
        
        // (إخفاء زر الرجوع إذا لم يكن هناك ID للمادة)
        if (!subjectId) {
            backToLessonBtn.style.display = 'none';
        }
        
        startQuizAutomatically(); 
        
    } else {
        quizTitleEl.textContent = "الاختبار غير موجود أو غير صالح";
        // (إخفاء الشاشة الرئيسية وعدم البدء)
        quizMain.style.display = 'none';
    }
    
    // 5. دالة بدء الاختبار التلقائي
    function startQuizAutomatically() {
        quizIntro.style.display = 'none';
        quizMain.style.display = 'block';
        quizResults.style.display = 'none';
        currentQuestionIndex = 0;
        score = 0;
        
        if (currentQuiz && currentQuiz.questions.length > 0) {
            loadQuestion(currentQuestionIndex);
        } else {
            quizMain.innerHTML = '<p style="text-align: center;">لا توجد أسئلة في هذا الاختبار بعد. (يمكن للمشرف إضافتها).</p>';
        }
    }

    // --- 6. تحميل السؤال ---
    function loadQuestion(index) {
        if (!currentQuiz || !currentQuiz.questions[index]) return;
        
        const question = currentQuiz.questions[index];
        questionCounterEl.textContent = `السؤال ${index + 1} من ${currentQuiz.questions.length}`;
        questionTextEl.innerHTML = question.q; 
        
        optionsContainerEl.innerHTML = '';
        nextQuestionBtn.disabled = true;
        
        question.options.forEach((option, i) => {
            const optionElement = document.createElement('label');
            optionElement.className = 'quiz-option';
            optionElement.innerHTML = `
                <input type="radio" name="option" value="${i}">
                <span>${option}</span>
            `;
            
            optionElement.querySelector('input').addEventListener('change', () => {
                nextQuestionBtn.disabled = false;
                document.querySelectorAll('.quiz-option').forEach(l => l.classList.remove('selected'));
                optionElement.classList.add('selected');
            });
            optionsContainerEl.appendChild(optionElement);
        });
    }

    // --- 7. الانتقال للسؤال التالي ---
    nextQuestionBtn.addEventListener('click', () => {
        const selectedOption = optionsContainerEl.querySelector('input[name="option"]:checked');
        if (!selectedOption) return;

        const answerIndex = parseInt(selectedOption.value);
        if (answerIndex === currentQuiz.questions[currentQuestionIndex].answer) {
            score++;
        }
        
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.questions.length) {
            loadQuestion(currentQuestionIndex);
        } else {
            showResults();
        }
    });

    // --- 8. عرض النتائج (تم إصلاح منطق الاحتفال) ---
    function showResults() {
        quizMain.style.display = 'none';
        quizResults.style.display = 'block';
        
        const total = currentQuiz.questions.length;
        const percentage = total > 0 ? (score / total) : 0;
        
        resultScoreEl.textContent = `لقد أجبت بشكل صحيح على ${score} من ${total}.`;

        // 1. منطق النجاح (رسالة عادية لـ 60% فأكثر)
        if (percentage >= 0.6) {
            resultTitleEl.textContent = "تهانينا! لقد نجحت.";
            resultIconEl.innerHTML = '✅';
            resultContentEl.className = 'result-card success';
        } else {
            resultTitleEl.textContent = "حظ أوفر في المرة القادمة.";
            resultIconEl.innerHTML = '❌';
            resultContentEl.className = 'result-card fail';
        }

        // 2. منطق الاحتفال (100% فقط)
        if (percentage === 1) { 
            resultTitleEl.textContent = "🥳 نجاح باهر! درجة كاملة!"; 
            
            // تشغيل صوت المكسب
            if (winSound) {
                winSound.currentTime = 0;
                winSound.play();
            }
            
            // تشغيل الشرايط الملونة
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 250, 
                    spread: 90,
                    origin: { y: 0.6 }
                });
            }
        }
    }

    // --- 9. أزرار النتائج ---
    retryQuizBtn.addEventListener('click', () => {
        startQuizAutomatically();
    });
    
    backToLessonBtn.addEventListener('click', () => {
        if(subjectId) {
            window.location.href = `lesson.html?subject=${subjectId}`;
        } else {
            // (الرجوع للصفحة الرئيسية إذا لم يكن هناك مرجع للدرس)
            window.location.href = 'index.html'; 
        }
    });
});