// admin.js (الإصدار الاحترافي المطور + معاينة + 30 أيقونة مصنفة)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. التعريفات والحماية ---
    const SESSION_KEY = 'smart_study_session';
    const USERS_DB = 'smart_study_users_db';
    let siteData = {}; 
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || session.role !== 'admin') {
        window.location.href = 'login.html';
        return; 
    }

    // --- (هذا هو التعديل: 30 أيقونة مصنفة) ---
    const suggestedIcons = [
        // --- علوم أكاديمية ---
        "fas fa-calculator",    // (رياضيات)
        "fas fa-flask",         // (كيمياء)
        "fas fa-atom",          // (فيزياء)
        "fas fa-dna",           // (أحياء)
        "fas fa-microscope",    // (علوم/أحياء)
        "fas fa-book-open",     // (أدب/قراءة)
        "fas fa-language",      // (لغات)
        "fas fa-divide",        // (جبر/حساب)
        "fas fa-square-root-alt", // (رياضيات متقدمة)

        // --- فنون وإنسانيات ---
        "fas fa-history",       // (تاريخ)
        "fas fa-globe-asia",    // (جغرافيا)
        "fas fa-palette",       // (فنون)
        "fas fa-music",         // (موسيقى)
        "fas fa-landmark",      // (حضارة/تاريخ)
        "fas fa-gavel",         // (قانون)
        "fas fa-balance-scale", // (قانون/عدالة)

        // --- تكنولوجيا ومهارات ---
        "fas fa-laptop-code",   // (برمجة)
        "fas fa-brain",         // (ذكاء اصطناعي/منطق)
        "fas fa-chart-line",    // (اقتصاد/إحصاء)
        "fas fa-pencil-ruler",  // (هندسة/تصميم)
        "fas fa-camera",        // (تصوير)
        "fas fa-code",          // (برمجة)
        "fas fa-database",      // (قواعد بيانات)
        "fas fa-cogs",          // (هندسة/ميكانيكا)
        "fas fa-network-wired", // (شبكات)

        // --- أيقونات عامة ---
        "fas fa-book",          // (عام)
        "fas fa-question-circle", // (عام)
        "fas fa-star",          // (مميز)
        "fas fa-lightbulb",     // (أفكار)
        "fas fa-award"          // (شهادة/جائزة)
    ];
    // --- (انتهى التعديل) ---


    // --- 2. تخصيص وتسجيل الخروج ---
    document.getElementById('welcome-admin').textContent = `مرحبًا ${session.name}! (مشرف)`;
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
    });

    // --- 3. تحميل الإحصائيات ---
    function loadStats() {
        const db = JSON.parse(localStorage.getItem(USERS_DB)) || {};
        const userCount = Object.keys(db).length;
        document.getElementById('users-count').textContent = userCount;
        const subjectCount = Object.keys(siteData.subjects || {}).length;
        const lessonCount = Object.keys(siteData.lessons || {}).length;
        document.getElementById('subjects-count').textContent = subjectCount;
        document.getElementById('lessons-count').textContent = lessonCount;
    }

    // --- 4. تحميل جدول المحتوى ---
    function loadContentTable() {
        const tableBody = document.getElementById('content-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = ''; 
        for (const subjectId in siteData.subjects) {
            const subject = siteData.subjects[subjectId];
            const row = document.createElement('tr');
            row.dataset.subjectId = subjectId;
            row.innerHTML = `
                <td><i class="${subject.icon}"></i> <strong>${subject.name}</strong></td>
                <td>${subject.lessons.length}</td>
                <td>${subject.quizId || 'لا يوجد'}</td>
                <td class="action-buttons">
                    <button class="action-btn edit"><i class="fas fa-pencil-alt"></i> تحرير المحتوى</button>
                    <button class="action-btn delete"><i class="fas fa-trash"></i> حذف المادة</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    }
    
    // --- 5. تحميل جدول المستخدمين ---
    function loadUserTable() {
        const userTableBody = document.getElementById('user-table-body');
        const db = JSON.parse(localStorage.getItem(USERS_DB)) || {};
        if (!userTableBody) return;
        userTableBody.innerHTML = ''; 
        for (const email in db) {
            const user = db[email];
            if (user.email === session.email) continue; 
            const row = document.createElement('tr');
            row.dataset.email = email;
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="role-${user.role || 'user'}">${(user.role === 'admin') ? 'مشرف' : 'مستخدم'}</span></td>
                <td class="action-buttons">
                    ${(user.role !== 'admin') ? '<button class="action-btn promote"><i class="fas fa-user-shield"></i> ترقية</button>' : ''}
                    <button class="action-btn delete"><i class="fas fa-user-minus"></i> حذف</button>
                </td>
            `;
            userTableBody.appendChild(row);
        }
    }

    // --- 6. تفعيل أزرار جدول المستخدمين ---
    document.getElementById('user-table-body').addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const row = button.closest('tr');
        const email = row.dataset.email;
        let db = JSON.parse(localStorage.getItem(USERS_DB)) || {};
        if (button.classList.contains('delete')) {
            if (confirm(`هل أنت متأكد أنك تريد حذف المستخدم ${email}؟`)) {
                delete db[email];
                localStorage.setItem(USERS_DB, JSON.stringify(db));
                loadStats();
                loadUserTable();
            }
        }
        if (button.classList.contains('promote')) {
            if (confirm(`هل أنت متأكد أنك تريد ترقية المستخدم ${email} إلى مشرف؟`)) {
                db[email].role = 'admin';
                localStorage.setItem(USERS_DB, JSON.stringify(db));
                loadUserTable();
            }
        }
    });

    // --- 7. تفعيل أزرار جدول المحتوى ---
    document.getElementById('content-table-body').addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const row = button.closest('tr');
        const subjectId = row.dataset.subjectId;
        if (button.classList.contains('edit')) {
            window.location.href = `edit-subject.html?id=${subjectId}`;
        }
        if (button.classList.contains('delete')) {
            const subjectName = row.querySelector('strong').textContent;
            if (confirm(`(حقيقي) هل أنت متأكد أنك تريد حذف مادة "${subjectName}"؟ سيتم حذفها نهائيًا.`)) {
                try {
                    const response = await fetch(`/api/subjects/${subjectId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('فشل الحذف من الخادم');
                    await refreshAllData();
                } catch (err) { alert(`خطأ: ${err.message}`); }
            }
        }
    });

    // --- 8. التحكم في النافذة المنبثقة (Modal) (مع المعاينة المباشرة) ---
    const modal = document.getElementById('add-subject-modal');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const addSubjectForm = document.getElementById('add-subject-form');
    
    // ( عناصر المعاينة)
    const previewIcon = document.getElementById('preview-icon');
    const previewName = document.getElementById('preview-name');
    const previewDescription = document.getElementById('preview-description');
    const subjectNameInput = document.getElementById('subject-name');
    const subjectDescriptionInput = document.getElementById('subject-description');

    const iconPickerGrid = document.getElementById('icon-picker-grid');
    const hiddenIconInput = document.getElementById('subject-icon');

    // ( ملء محرر الأيقونات وتفعيل المعاينة)
    if (iconPickerGrid) {
        suggestedIcons.forEach((iconClass, index) => {
            const iconEl = document.createElement('div');
            iconEl.className = 'icon-option';
            iconEl.dataset.icon = iconClass;
            iconEl.innerHTML = `<i class="${iconClass}"></i>`;
            if (index === 0) iconEl.classList.add('selected'); // (الافتراضي)
            
            iconEl.addEventListener('click', () => {
                iconPickerGrid.querySelectorAll('.icon-option').forEach(el => el.classList.remove('selected'));
                iconEl.classList.add('selected');
                hiddenIconInput.value = iconClass;
                // (تحديث المعاينة)
                previewIcon.className = iconClass; 
            });
            iconPickerGrid.appendChild(iconEl);
        });
    }

    // ( ربط حقول الإدخال بالمعاينة المباشرة)
    if (subjectNameInput) {
        subjectNameInput.addEventListener('keyup', () => {
            previewName.textContent = subjectNameInput.value || "اسم المادة";
        });
    }
    if (subjectDescriptionInput) {
        subjectDescriptionInput.addEventListener('keyup', () => {
            previewDescription.textContent = subjectDescriptionInput.value || "الوصف سيظهر هنا...";
        });
    }

    // (فتح النافذة وتصفير المعاينة)
    if (addSubjectBtn) addSubjectBtn.addEventListener('click', () => {
        addSubjectForm.reset();
        // (تصفير المعاينة)
        previewName.textContent = "اسم المادة";
        previewDescription.textContent = "الوصف سيظهر هنا...";
        previewIcon.className = suggestedIcons[0];
        // (تصفير محرر الأيقونات)
        iconPickerGrid.querySelectorAll('.icon-option').forEach((el, i) => {
            el.classList.toggle('selected', i === 0);
        });
        hiddenIconInput.value = suggestedIcons[0];
        
        modal.style.display = 'flex';
    });
    
    // (إغلاق النافذة)
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    if (modal) modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    // (إرسال النموذج المطور)
    if (addSubjectForm) {
        addSubjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subjectName = subjectNameInput.value;
            const subjectId = subjectName.toLowerCase().replace(/[\s_]+/g, '-');
            const newSubject = {
                id: subjectId,
                name: subjectName,
                icon: hiddenIconInput.value,
                description: subjectDescriptionInput.value
            };
            try {
                const response = await fetch('/api/subjects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newSubject)
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || 'فشل إنشاء المادة');
                alert('تمت إضافة المادة بنجاح! سيتم الآن نقلك لصفحة التحرير لإضافة الدروس.');
                modal.style.display = 'none';
                window.location.href = `edit-subject.html?id=${subjectId}`;
            } catch (err) {
                alert(`خطأ: ${err.message}`);
            }
        });
    }

    // --- 9. منطق مفاتيح API (كما هو) ---
    const apiKeysForm = document.getElementById('api-keys-form');
    if (apiKeysForm) apiKeysForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("تم إرسال الإعدادات إلى الخادم بنجاح! (محاكاة)");
    });
    
    // --- 10. دالة رئيسية لجلب البيانات ---
    async function refreshAllData() {
        try {
            const response = await fetch('/api/content');
            siteData = await response.json();
            loadStats();
            loadContentTable();
            loadUserTable();
        } catch (err) {
            console.error("فشل جلب البيانات:", err);
            alert("فشل تحميل بيانات الموقع من الخادم.");
        }
    }
    
    // --- 11. البدء ---
    refreshAllData();
});