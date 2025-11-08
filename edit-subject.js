// edit-subject.js
// العقل المدبر لصفحة "محرر المادة" (تم حذف كود الوضع الليلي المكرر)

document.addEventListener('DOMContentLoaded', async () => {

    // --- 1. تحديد العناصر الأساسية ---
    const titleEl = document.getElementById('subject-editor-title');
    const lessonsContainer = document.getElementById('lessons-editor-container');
    const quizContainer = document.getElementById('quiz-editor-container');
    const addLessonBtn = document.getElementById('add-lesson-btn');
    const addQuestionBtn = document.getElementById('add-question-btn');

    // (ملاحظة: تم حذف كود الوضع الليلي المكرر من هنا لأنه موجود في script.js)

    let currentData = {}; // (لتخزين بيانات المادة الحالية)
    let quizId = null; // (لتخزين معرف الاختبار)

    // --- 2. قراءة ID المادة من الرابط ---
    const params = new URLSearchParams(window.location.search);
    const subjectId = params.get('id');
    if (!subjectId) {
        titleEl.textContent = "خطأ: لم يتم تحديد المادة";
        return;
    }

    // --- 3. جلب البيانات من الخادم ---
    async function loadSubjectData() {
        try {
            const response = await fetch(`/api/subjects/${subjectId}`);
            if (!response.ok) throw new Error('فشل جلب بيانات المادة');
            currentData = await response.json();
            
            quizId = currentData.subject.quizId; // حفظ معرف الاختبار
            
            titleEl.innerHTML = `<i class="${currentData.subject.icon}"></i> تحرير: ${currentData.subject.name}`;
            
            buildLessonsEditor(currentData.lessons);
            buildQuizEditor(currentData.quiz);

        } catch (err) {
            titleEl.textContent = err.message;
        }
    }

    // (في ملف edit-subject.js)

    // --- 4. دالة بناء محرر الدروس (تمت إضافة الحماية) ---
    function buildLessonsEditor(lessons) {
        lessonsContainer.innerHTML = '';
        const validLessons = lessons.filter(lesson => lesson && lesson.id && lesson.title);

        if (validLessons.length === 0) {
            lessonsContainer.innerHTML = '<p>لا توجد دروس بعد في هذه المادة. اضغط "إضافة وحفظ الدرس" للبدء.</p>';
        }
        
        validLessons.forEach(lesson => {
            appendLessonCard(lesson);
        });
    }

    // --- دالة توليد كارت الدرس ---
    function appendLessonCard(lesson = null) {
        const isNew = !lesson;
        const lessonId = lesson ? lesson.id : `new-${Date.now()}`;

        const lessonEl = document.createElement('div');
        lessonEl.className = 'admin-card lesson-card';
        lessonEl.style.marginBottom = '15px';
        lessonEl.dataset.lessonId = lessonId;

        lessonEl.innerHTML = `
            <h4>${isNew ? 'درس جديد' : lesson.title}</h4>
            <div class="form-group">
                <label>عنوان الدرس</label>
                <input type="text" class="lesson-title-input" value="${lesson ? lesson.title : ''}" required>
            </div>
            <div class="form-group">
                <label>محتوى الدرس (HTML أو Markdown)</label>
                <textarea class="lesson-content-input" rows="6" required>${lesson ? lesson.content : ''}</textarea>
            </div>
            <div class="action-buttons" style="justify-content: flex-end;">
                <button class="action-btn delete delete-lesson-btn" ${isNew ? '' : 'style="display:none;"'}><i class="fas fa-trash"></i> حذف</button>
                <button class="cta-button save-lesson-btn">
                    <i class="fas fa-save"></i> ${isNew ? 'إضافة وحفظ الدرس' : 'حفظ التعديلات'}
                </button>
            </div>
        `;
        lessonsContainer.appendChild(lessonEl);
        lessonsContainer.querySelector('p')?.remove();
    }
    
    // --- ربط زر "إضافة درس جديد" ---
    if (addLessonBtn) {
        addLessonBtn.addEventListener('click', () => {
            appendLessonCard();
        });
    }

    // --- 5. دالة بناء محرر الاختبار ---
    function buildQuizEditor(quiz) {
        quizContainer.innerHTML = '';
        if (!quiz || quiz.questions.length === 0) {
            quizContainer.innerHTML = '<p>لا توجد أسئلة اختبار بعد. اضغط على زر "إضافة سؤال جديد" للبدء.</p>';
            return;
        }

        quiz.questions.forEach((q, qIndex) => {
            appendQuestionCard(q, qIndex);
        });
        
        // (إضافة زر حفظ عام للاختبار)
        const saveQuizBtn = document.createElement('button');
        saveQuizBtn.className = 'cta-button';
        saveQuizBtn.innerHTML = '<i class="fas fa-save"></i> حفظ تعديلات الاختبار';
        saveQuizBtn.id = 'save-quiz-btn';
        quizContainer.appendChild(saveQuizBtn);
    }

    // --- دالة توليد كارت السؤال ---
    function appendQuestionCard(question = null, qIndex) {
        const isNew = !question;
        // نستخدم الرقم المسلسل الذي أتى من الدالة أو الرقم التالي في القائمة
        const currentQIndex = qIndex !== undefined ? qIndex : quizContainer.querySelectorAll('.question-card').length;
        
        const qData = question || { q: '', options: ['', '', '', ''], answer: 0 };
        
        const questionEl = document.createElement('div');
        questionEl.className = 'admin-card question-card';
        questionEl.style.marginBottom = '15px';
        questionEl.dataset.qIndex = currentQIndex;

        // (بناء الاختيارات الأربعة)
        let optionsHtml = '';
        qData.options.forEach((opt, oIndex) => {
            const isCorrect = (qData.answer === oIndex);
            optionsHtml += `
                <div class="quiz-option-editor">
                    <input type="radio" name="correct-answer-${currentQIndex}" ${isCorrect ? 'checked' : ''} data-o-index="${oIndex}">
                    <input type="text" value="${opt}" data-o-index="${oIndex}" placeholder="الاختيار ${oIndex + 1}" required>
                </div>
            `;
        });

        questionEl.innerHTML = `
            <h4>${isNew ? 'سؤال جديد' : `السؤال ${currentQIndex + 1}`}</h4>
            <div class="form-group">
                <label>نص السؤال</label>
                <input type="text" class="quiz-q-input" value="${qData.q}" required>
            </div>
            <div class="form-group">
                <label>الاختيارات (حدد الإجابة الصحيحة)</label>
                ${optionsHtml}
            </div>
            <div class="action-buttons" style="justify-content: flex-end;">
                <button class="action-btn delete delete-question-btn"><i class="fas fa-trash"></i> حذف السؤال</button>
            </div>
        `;
        quizContainer.appendChild(questionEl);
        quizContainer.querySelector('p')?.remove();
    }

    // --- ربط زر "إضافة سؤال جديد" ---
// (في ملف edit-subject.js)

    // --- (جديد) ربط زر "إضافة سؤال جديد" ---
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', () => {
            // 1. توليد كارت سؤال جديد
            const newIndex = quizContainer.querySelectorAll('.question-card').length;
            appendQuestionCard(null, newIndex); 
            
            // 2. إزالة رسالة "لا توجد أسئلة" (إذا كانت موجودة)
            quizContainer.querySelector('p')?.remove(); 
            
            // 3. (الإصلاح) إعادة تموضع زر الحفظ كآخر عنصر
            
            // أ. نحذف الزر القديم من مكانه الحالي (إذا كان موجوداً)
            document.getElementById('save-quiz-btn')?.remove(); 
            
            // ب. ننشئ الزر الجديد (أو القديم)
            const saveQuizBtn = document.createElement('button');
            saveQuizBtn.className = 'cta-button';
            saveQuizBtn.innerHTML = '<i class="fas fa-save"></i> حفظ تعديلات الاختبار';
            saveQuizBtn.id = 'save-quiz-btn';
            
            // ج. نضيف الزر الجديد كآخر عنصر في الحاوية
            quizContainer.appendChild(saveQuizBtn);
        });
    }

// ... (باقي الكود كما هو) ...

    // --- 6. تفعيل حفظ الدروس (PUT Request + إضافة درس جديد) ---
// --- 6. تفعيل حفظ الدروس (PUT Request + إضافة درس جديد) ---
    lessonsContainer.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('.delete-lesson-btn');
        const saveButton = e.target.closest('.save-lesson-btn');
        
        if (!saveButton && !deleteButton) return;

        const card = e.target.closest('.lesson-card');
        const lessonId = card.dataset.lessonId;
        const newTitle = card.querySelector('.lesson-title-input').value;
        const newContent = card.querySelector('.lesson-content-input').value;
        
        // --- (منطق الحذف - لا تغيير) ---
        if (deleteButton) {
            if (confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
                // (حذف من الواجهة)
                card.remove(); 
                alert('تم حذف الدرس من الواجهة. (للتطبيق الحقيقي يجب تحديث مصفوفة الدروس في الخادم)');
            }
            return;
        }

        // --- (منطق الحفظ/الإضافة) ---
        if (newTitle === '') {
             alert("يرجى ملء عنوان الدرس.");
             return;
        }

        // 1. تحديد ما إذا كان الدرس جديدًا (معرف يبدأ بـ 'new-')
        const isNewLesson = lessonId.startsWith('new-');

        if (isNewLesson) {
            // منطق الإضافة (POST)
            try {
                const response = await fetch('/api/lessons', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subjectId, title: newTitle, content: newContent })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'فشل إضافة الدرس');
                }
                const result = await response.json();
                
                // تحديث الكارت الجديد ليصبح كارت محفوظ (نغير ID وزر الحفظ)
                card.dataset.lessonId = result.lessonId;
                card.querySelector('h4').textContent = newTitle;
                card.querySelector('.save-lesson-btn').innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
                card.querySelector('.delete-lesson-btn')?.style.removeProperty('display'); // إظهار زر الحذف
                alert('تم إضافة وحفظ الدرس بنجاح!');

            } catch (err) {
                alert(`خطأ: ${err.message}. فشل الإضافة.`);
            }
            
        } else {
            // منطق التعديل (PUT) - إذا لم يكن جديدًا
            try {
                const response = await fetch(`/api/lessons/${lessonId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: newTitle, content: newContent })
                });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'فشل حفظ الدرس');
                }
                card.querySelector('h4').textContent = newTitle; // تحديث العنوان في الكارت
                alert('تم حفظ الدرس بنجاح!');
            } catch (err) {
                alert(`خطأ: ${err.message}. فشل التعديل.`);
            }
        }
    });
    // ... (باقي الكود كما هو) ...

    // --- 7. تفعيل حفظ الاختبار (PUT Request + حذف السؤال) ---
    

    // (في ملف edit-subject.js)

    // --- 7. تفعيل حفظ الاختبار (PUT Request + حذف السؤال) ---
    quizContainer.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('.delete-question-btn');
        const saveButton = e.target.id === 'save-quiz-btn';

        if (deleteButton) {
            if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
                deleteButton.closest('.question-card').remove();
                alert('تم حذف السؤال من الواجهة. اضغط "حفظ تعديلات الاختبار" لتأكيد الحذف.');
            }
            return;
        }
        
        if (saveButton) {
            // (تجميع البيانات الجديدة من كل الحقول)
            const newQuestions = [];
            let isValid = true;
            
            quizContainer.querySelectorAll('.question-card').forEach((qCard, qIndex) => {
                const qText = qCard.querySelector('.quiz-q-input').value;
                const options = [];
                let newAnswer = -1;
                
                qCard.querySelectorAll('.quiz-option-editor').forEach(optEd => {
                    const optText = optEd.querySelector('input[type="text"]').value;
                    options.push(optText);
                    if (optEd.querySelector('input[type="radio"]').checked) {
                        newAnswer = parseInt(optEd.querySelector('input[type="radio"]').dataset.oIndex);
                    }
                });
                
                // (التحقق من صحة الإدخال)
                if (qText === '' || options.some(opt => opt === '')) {
                    isValid = false;
                }
                if (newAnswer === -1) {
                    isValid = false;
                }

                newQuestions.push({ q: qText, options: options, answer: newAnswer });
            });
            
            if (!isValid) {
                alert("يرجى التأكد من ملء نص جميع الأسئلة والاختيارات، وتحديد إجابة صحيحة واحدة لكل سؤال.");
                return;
            }
            
            if (!quizId) {
                alert("خطأ: لا يوجد معرف اختبار مرتبط بهذه المادة. يرجى العودة للوحة التحكم.");
                return;
            }

            // 1. محاولة التعديل (PUT) أولاً (لأنه السيناريو الأكثر شيوعًا)
            try {
                let response = await fetch(`/api/quizzes/${quizId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questions: newQuestions })
                });

                // (هنا المشكلة: الكود يتوقع JSON حتى لو كان الخطأ هو 404 أو 500)
                if (!response.ok) {
                    // محاولة قراءة النص كـ JSON، وفي حالة فشل القراءة، نستخدم نص الخطأ العادي
                    const responseText = await response.text();
                    let errorMessage = 'فشل حفظ الاختبار';
                    try {
                        const errorBody = JSON.parse(responseText);
                        errorMessage = errorBody.error || errorMessage;
                    } catch (e) {
                        // إذا فشل قراءة JSON (لأن الخادم أرسل HTML أو نص عادي)، نستخدم خطأ الخادم.
                        errorMessage = `خطأ من الخادم: ${response.status} (${responseText.substring(0, 50)}...)`;
                    }
                    
                    // 2. إذا كان الخطأ "الاختبار غير موجود"، نحاول إنشاء الاختبار (POST)
                    if (errorMessage.includes('الاختبار غير موجود') || response.status === 404) {
                        
                        // نحتاج لـ POST API لإنشاء الاختبار (إذا لم يكن موجودًا)
                        // ملاحظة: الخادم الحالي لا يدعم POST /api/quizzes/quizId مباشرةً
                        // الخادم ينشئ الاختبار عند إنشاء المادة. إذا وصل هذا الخطأ، فالمادة نفسها حُذفت أو لم تُنشأ بشكل صحيح.
                        
                        alert("خطأ حاسم: المادة موجودة، ولكن الاختبار الخاص بها (Quiz ID) غير موجود في قاعدة البيانات.");
                        return;
                    }
                    
                    throw new Error(errorMessage); 
                }
                
                alert('تم حفظ الاختبار بنجاح!');
                return;

            } catch (err) {
                alert(`خطأ: ${err.message}. فشل الحفظ.`);
            }
        }
    });

    // --- 8. البدء ---
    loadSubjectData();
});