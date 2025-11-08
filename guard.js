// أضف هذا في بداية script.js أو في ملف منفصل
(function() {
    const SESSION_KEY = 'smart_study_session';
    const currentPage = window.location.pathname.split('/').pop();
    
    // الصفحات التي لا تتطلب تسجيل دخول
    const publicPages = ['login.html', 'register.html'];
    
    if (publicPages.includes(currentPage)) {
        // إذا كان المستخدم مسجلاً دخوله بالفعل، أعده للرئيسية
        if (localStorage.getItem(SESSION_KEY)) {
            window.location.href = 'index.html';
        }
        return;
    }
    
    // إذا كانت الصفحة تتطلب تسجيل دخول (ليست login/register)
    if (!localStorage.getItem(SESSION_KEY)) {
        // إذا لم يكن مسجلاً، أعده لصفحة الدخول
        window.location.href = 'login.html';
    }
})();

// ... (باقي كود script.js مثل الوضع الليلي والنصائح)