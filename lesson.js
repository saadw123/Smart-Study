// lesson.js (الإصدار النهائي - يجلب المحتوى من API)

document.addEventListener('DOMContentLoaded', async () => {
    
    let siteData = {}; // (لتخزين البيانات المجلوبة)
    let currentQuizId = null;

    // --- 1. تحديد العناصر ---
    const subjectTitleEl = document.getElementById('subject-title-display');
    const subjectIconEl = document.getElementById('subject-icon-display');
    const lessonsListEl = document.getElementById('lessons-list-container');
    const lessonTitleEl = document.getElementById('lesson-title-display');
    const lessonBodyEl = document.getElementById('lesson-body-display');
    const quizButton = document.getElementById('start-quiz-button');

    // --- 2. جلب البيانات من الخادم ---
    try {
        const response = await fetch('/api/content');
        siteData = await response.json();
    } catch (err) {
        subjectTitleEl.textContent = "خطأ في الاتصال";
        lessonBodyEl.innerHTML = '<p>فشل تحميل بيانات الدرس. يرجى التحقق من اتصالك بالخادم.</p>';
        return;
    }
    
    // --- 3. قراءة المادة من الرابط (URL) ---
    const params = new URLSearchParams(window.location.search);
    const subjectId = params.get('subject');
    const currentSubject = siteData.subjects[subjectId];

    if (currentSubject) {
        currentQuizId = currentSubject.quizId;
        
        // --- 4. تحديث عناوين الصفحة ---
        subjectTitleEl.textContent = currentSubject.name;
        subjectIconEl.className = currentSubject.icon;
        
        // --- 5. ملء قائمة الدروس ---
        lessonsListEl.innerHTML = '';
        currentSubject.lessons.forEach(lessonId => {
            const lesson = siteData.lessons[lessonId];
            if (lesson) {
                const lessonItem = document.createElement('div');
                lessonItem.className = 'lesson-list-item';
                lessonItem.textContent = lesson.title;
                lessonItem.dataset.lessonId = lessonId;
                lessonItem.addEventListener('click', () => loadLesson(lessonId));
                lessonsListEl.appendChild(lessonItem);
            }
        });
        
        // تحميل الدرس الأول افتراضيًا
        if (currentSubject.lessons.length > 0) {
            loadLesson(currentSubject.lessons[0]);
        } else {
            lessonTitleEl.textContent = "لا توجد دروس";
            lessonBodyEl.innerHTML = '<p>لم يتم إضافة دروس لهذه المادة بعد.</p>';
        }

    } else {
        subjectTitleEl.textContent = "المادة غير موجودة";
        subjectIconEl.className = "fas fa-exclamation-triangle";
    }

    // --- 6. دالة تحميل محتوى الدرس ---
    function loadLesson(lessonId) {
        const lesson = siteData.lessons[lessonId];
        if (!lesson) return;
        lessonTitleEl.textContent = lesson.title;
        lessonBodyEl.innerHTML = lesson.content;
        if (currentQuizId) quizButton.style.display = 'block';

        document.querySelectorAll('.lesson-list-item').forEach(item => {
            item.classList.toggle('active', item.dataset.lessonId === lessonId);
        });
    }
    
    // --- 7. ربط زر الاختبار ---
    quizButton.addEventListener('click', () => {
        if(currentQuizId) window.location.href = `quiz.html?quiz=${currentQuizId}`;
    });
});