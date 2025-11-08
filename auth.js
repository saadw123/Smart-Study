// auth.js
// إدارة جلسات المستخدمين والتسجيل (النسخة النهائية لتحديد الدور)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- قاعدة بيانات وهمية في LocalStorage ---
    const USERS_DB = 'smart_study_users_db';
    const SESSION_KEY = 'smart_study_session';
    
    const SIMULATED_ADMIN_KEY = "12345"; 

    // --- جلب عناصر النماذج ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    // ===============================================
    // 1. منطق صفحة التسجيل
    // ===============================================
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;

            const db = JSON.parse(localStorage.getItem(USERS_DB)) || {};

            if (db[email]) {
                showError("هذا البريد الإلكتروني مسجل بالفعل.");
                return;
            }

            // (تخزين الحساب كـ 'user' افتراضياً)
            db[email] = { name, email, password, role: 'user' };
            localStorage.setItem(USERS_DB, JSON.stringify(db));

            localStorage.setItem('registration_success', 'true');
            window.location.href = 'login.html';
        });
    }

    // ===============================================
    // 2. منطق صفحة تسجيل الدخول (المُصحح)
    // ===============================================
    if (loginForm) {

        const successMessage = document.getElementById('success-message');
        if (localStorage.getItem('registration_success') === 'true' && successMessage) {
            successMessage.textContent = "تم إنشاء حسابك بنجاح! يمكنك تسجيل الدخول الآن.";
            successMessage.style.display = 'block';
            localStorage.removeItem('registration_success');
        }

        const adminToggle = document.getElementById('admin-toggle');
        const adminKeyGroup = document.getElementById('admin-key-group');

        adminToggle.addEventListener('change', () => {
            adminKeyGroup.style.display = adminToggle.checked ? 'block' : 'none';
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;
            const isAdminLogin = adminToggle.checked; 
            const adminKey = document.getElementById('admin-key').value;

            const db = JSON.parse(localStorage.getItem(USERS_DB)) || {};
            const user = db[email];

            if (!user || user.password !== password) {
                showError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
                return;
            }

            // --- المنطق الجديد: تحديد الدور للجلسة ---
            let sessionRole = 'user'; 

            if (isAdminLogin) {
                // شرطان للدخول كمشرف:
                // 1. أن يكون مسجلاً كـ 'admin' في DB (تمت ترقيته سابقاً) OR
                // 2. أن يُدخل المفتاح السري الصحيح
                
                if (user.role === 'admin' || adminKey === SIMULATED_ADMIN_KEY) {
                    sessionRole = 'admin';
                    
                    // إذا كان المفتاح صحيحاً وهو ليس مشرفاً بعد، نقوم بترقيته للمرات القادمة
                    if (user.role !== 'admin') {
                         user.role = 'admin';
                         db[email] = user;
                         localStorage.setItem(USERS_DB, JSON.stringify(db));
                    }
                } else {
                    showError("مفتاح المشرف (Admin Key) غير صحيح.");
                    return;
                }
            }
            
            // تسجيل الجلسة بالصلاحية التي تم اختيارها
            const session = { name: user.name, email: user.email, role: sessionRole };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));

            // التوجيه (يعتمد على ما تم تسجيله في الجلسة)
            if (session.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // --- دالة إظهار الخطأ ---
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
});