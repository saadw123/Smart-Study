// script.js (الإصدار النظيف - تم حذف كود Dark Mode الداخلي)

// ===============================================
// 1. الحارس الأمني (Auth Guard) - التوجيه الدقيق والاستمرارية
// ===============================================
(function() {
    const SESSION_KEY = 'smart_study_session';
    const sessionJSON = localStorage.getItem(SESSION_KEY);
    const currentPage = window.location.pathname.split('/').pop();
    
    const publicPages = ['login.html', 'register.html'];
    
    if (publicPages.includes(currentPage)) {
        if (sessionJSON) {
            const session = JSON.parse(sessionJSON);
            if (session.role === 'admin') {
                 window.location.href = 'admin-dashboard.html';
            } else {
                 window.location.href = 'index.html';
            }
        }
        return; 
    }

    if (!sessionJSON) {
        window.location.href = 'login.html'; 
        return;
    }

    const session = JSON.parse(sessionJSON);
    
    // الصفحات المسموح بها للمشرف
    const adminPages = ['admin-dashboard.html', 'edit-subject.html'];

    if (session.role === 'admin' && !adminPages.includes(currentPage)) {
        window.location.href = 'admin-dashboard.html';
    }
})(); 
// (انتهى كود الحارس الأمني)

// ===============================================
// 2. باقي أكواد الموقع (الوضع الليلي والنصائح)
// (سنعيد كتابة كود الوضع الليلي ليكون وظيفته فقط تبديل الإعداد)
// ===============================================
document.addEventListener('DOMContentLoaded', () => {

// (في ملف script.js - حول السطر 45)

// ==== 1. Dark Mode Toggle (الآن وظيفته فقط التبديل والحفظ) ====
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    
    if (darkModeToggle) {
        const moonIcon = 'fa-moon';
        const sunIcon = 'fa-sun';
        
        // **(مُعدل) التحقق من الثيمة المحفوظة وتغيير أيقونة الزر في البداية**
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            body.classList.add('dark-mode'); // للتأكيد فقط، رغم أن كود الـ Head قام بذلك
            if (darkModeToggle.querySelector('i')) darkModeToggle.querySelector('i').classList.replace(moonIcon, sunIcon);
        } else {
            body.classList.remove('dark-mode');
            if (darkModeToggle.querySelector('i')) darkModeToggle.querySelector('i').classList.replace(sunIcon, moonIcon);
        }

        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            
            // **(الأهم) حفظ الحالة الجديدة**
            localStorage.setItem('theme', theme); 
            
            if (darkModeToggle.querySelector('i')) {
                // تبديل الأيقونات بعد الضغط
                darkModeToggle.querySelector('i').classList.replace(theme === 'dark' ? moonIcon : sunIcon, theme === 'dark' ? sunIcon : moonIcon);
            }
        });
    }

// ... (باقي script.js)

    // ==== 2. Study Tips Rotator ====
    // ... (الكود كما هو) ...
    const tips = [
        "💡 خصص وقتًا ثابتًا للدراسة كل يوم.",
        "💡 استخدم تقنية البومودورو (25 دقيقة دراسة، 5 دقائق راحة).",
        "💡 اشرح ما تعلمته لشخص آخر لتثبيت المعلومة."
    ];
    const tipElement = document.getElementById('study-tip');
    if (tipElement) {
        let currentTipIndex = 0;
        setInterval(() => {
            tipElement.classList.add('fade-out');
            setTimeout(() => {
                currentTipIndex = (currentTipIndex + 1) % tips.length;
                tipElement.textContent = tips[currentTipIndex];
                tipElement.classList.remove('fade-out');
            }, 500);
        }, 5000);
    }
    
    // ==== 3. AI Buttons & Logout Logic ====
    const aiFab = document.getElementById('ai-fab');
    const aiHeaderButton = document.getElementById('ai-toggle-header');
    const openAIPage = () => window.location.href = 'ai.html';
    if (aiFab) aiFab.addEventListener('click', openAIPage);
    if (aiHeaderButton) aiHeaderButton.addEventListener('click', openAIPage);

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('smart_study_session');
            // (جديد) إزالة الثيمة عند تسجيل الخروج
            localStorage.removeItem('theme'); 
            window.location.href = 'login.html';
        });
    }
    
    // ==== 4. تحميل شبكة المواد ديناميكيًا (لصفحة index.html) ====
    const subjectsGrid = document.querySelector('.subjects-grid');
    if (subjectsGrid) {
        async function loadSubjects() {
            try {
                const response = await fetch('/api/content');
                const siteData = await response.json();
                const subjects = siteData.subjects;

                subjectsGrid.innerHTML = '';
                
                for (const subjectId in subjects) {
                    const subject = subjects[subjectId];
                    const card = document.createElement('div');
                    card.className = 'subject-card';
                    card.onclick = () => location.href = `lesson.html?subject=${subjectId}`;
                    
                    card.innerHTML = `
                        <div class="card-icon"><i class="${subject.icon}"></i></div>
                        <h3>${subject.name}</h3>
                        <p>${subject.description}</p>
                    `;
                    subjectsGrid.appendChild(card);
                }
            } catch (err) {
                console.error("فشل تحميل المواد:", err);
                subjectsGrid.innerHTML = '<p>خطأ في تحميل المواد الدراسية. يرجى المحاولة لاحقًا.</p>';
            }
        }
        loadSubjects();
    }
});