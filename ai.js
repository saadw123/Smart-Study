// ai.js (الإصدار النهائي - مع تنظيف مخرجات AI)

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    chatForm.addEventListener('submit', handleFormSubmit);

    // ===============================================
    // (جديد) دالة تنظيف النص من مخرجات النموذج
    // ===============================================
    function cleanAIText(text) {
        // 1. إزالة أي وسوم بدء أو نهاية غير مرغوب فيها (مثل [OUT], [/INST], إلخ)
        let cleanedText = text.replace(/\[\/?(OUT|INST|SYSTEM|AI|BOT).*?\]/gi, '');
        
        // 2. إزالة علامات الاقتباس غير الضرورية التي تضيفها بعض النماذج
        cleanedText = cleanedText.replace(/^["']|["']$/g, '');
        
        // 3. إزالة أي مسافات زائدة في البداية والنهاية
        return cleanedText.trim();
    }
    // ===============================================

    async function handleFormSubmit(e) {
        e.preventDefault();
        const userInput = chatInput.value.trim();
        if (!userInput) return;

        // 1. عرض رسالة المستخدم فورًا
        addMessage(userInput, 'user');
        chatInput.value = ''; // إفراغ الحقل

        // 2. إظهار مؤشر "جارٍ الكتابة..."
        const typingIndicator = addMessage("...", 'bot', true);

        try {
            // 3. إرسال الرسالة إلى الخادم المحلي الآمن (Proxy)
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userInput })
            });

            // 4. إزالة مؤشر الكتابة
            removeMessage(typingIndicator);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "خطأ في الاتصال بالخادم");
            }

            const data = await response.json();
            
            // 5. تنظيف وعرض رد الذكاء الاصطناعي
            const finalReply = cleanAIText(data.reply);
            addMessage(finalReply, 'bot');

        } catch (error) {
            // 6. التعامل مع الأخطاء
            console.error("Fetch Error:", error);
            removeMessage(typingIndicator); // إزالة "..."
            addMessage(`حدث خطأ: ${error.message}`, 'bot', false, true);
        }
    }

    /**
     * @param {string} text نص الرسالة
     * @param {'user' | 'bot'} sender المرسل
     * @param {boolean} isTyping هل هو مؤشر كتابة؟
     * @param {boolean} isError هل هي رسالة خطأ؟
     * @returns {HTMLElement} عنصر الرسالة الذي تم إنشاؤه
     */
    function addMessage(text, sender, isTyping = false, isError = false) {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${sender}-bubble`;
        
        if (isTyping) bubble.classList.add('typing-indicator');
        if (isError) bubble.classList.add('error-bubble');
        
        bubble.innerHTML = `<p>${text}</p>`; // استخدام innerHTML للسماح بالـ formatting مستقبلاً
        chatMessages.appendChild(bubble);

        // التمرير لأسفل
        scrollToBottom();
        return bubble;
    }

    /**
     * @param {HTMLElement} messageElement العنصر المراد إزالته
     */
    function removeMessage(messageElement) {
        if (messageElement && messageElement.parentNode === chatMessages) {
            chatMessages.removeChild(messageElement);
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});