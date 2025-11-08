// server.js (النسخة النهائية - الانتقال إلى Gemma 3 27B)

import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs'; 

// --- الإعداد الأولي ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// ===============================================
// 1. واجهة برمجة الذكاء الاصطناعي (OpenRouter) - التعديل هنا
// ===============================================
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'; // عنوان OpenRouter

async function callAI(message) {
    if (!OPENROUTER_KEY) throw new Error("مفتاح OpenRouter غير معرف.");

    // --- التعليمات النظامية ---
    const systemInstruction = `
        أنت مساعد تعليمي ذكي وشريك دراسي مخصص لمنصة "Smart Study".
        مهمتك هي دعم الطلاب العرب في المراحل المتوسطة والثانوية.
        
        القواعد التي يجب أن تلتزم بها حرفياً:
        1. **الأسلوب:** الإجابة بلغة عربية فصحى بسيطة ومباشرة.
        2. **التنسيق:** يجب أن ترد بنص عادي فقط (Plain Text). لا تستخدم علامات Markdown مثل # أو ** أو *.
        3. **الدقة (الأهم):** يجب أن تكون جميع المعلومات المقدمة دقيقة وصحيحة ومثبتة علمياً أو تاريخياً.
        4. **تجنب الهلوسة:** إذا لم تكن متأكداً بنسبة 100% من معلومة، يجب أن ترد بـ: "هذا سؤال مثير للاهتمام، لكن لا تتوفر لدي بيانات دقيقة وموثوقة حول هذا المفهوم حالياً. هل يمكنني مساعدتك في سؤال آخر؟".
        5. **الإيجاز:** الإجابة يجب أن تكون قصيرة ومباشرة (لا تزيد عن 3-4 فقرات قصيرة).
    `;
    // ----------------------------------------------------

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://smart-study-platform.com', 
            'X-Title': 'Smart Study Platform'
        },
        body: JSON.stringify({
            // --- استخدام نموذج Gemma 3 27B الأحدث ---
            model: "google/gemma-2-27b-it", 
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: message }
            ],
            temperature: 0.1 // للحفاظ على الدقة
        })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenRouter Error (${response.status}): ${err.error.message || response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "الرسالة مطلوبة." });
    try {
        const reply = await callAI(message);
        res.json({ reply: reply, provider: "OpenRouter" });
    } catch (err) {
        console.error(`Provider callAI failed:`, err.message);
        res.status(502).json({ error: `فشل الاتصال بـ OpenRouter: ${err.message}` });
    }
});

// ===============================================
// 2. واجهة برمجة إدارة المحتوى (CMS API) - لا تغيير هنا
// ===============================================

const readDB = () => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) { return { subjects: {}, lessons: {}, quizzes: {} }; }
};
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) { console.error("خطأ في كتابة data.json:", error); }
};

// --- API للمواد (Subjects) ---
app.get('/api/content', (req, res) => res.json(readDB()));

// (Endpoint: إضافة مادة جديدة)
app.post('/api/subjects', (req, res) => {
    const { id, name, icon, description } = req.body;
    if (!id || !name) {
        return res.status(400).json({ error: 'المعرف (ID) والاسم مطلوبان' });
    }
    const db = readDB();
    if (db.subjects[id]) {
        return res.status(400).json({ error: 'هذا المعرف (ID) مستخدم بالفعل' });
    }
    const newQuizId = `${id}-quiz`;
    db.subjects[id] = {
        name: name,
        icon: icon || "fas fa-question-circle",
        description: description || "مادة جديدة.", 
        lessons: [],
        quizId: newQuizId
    };
    db.quizzes[newQuizId] = {
        title: `اختبار ${name}`,
        questions: []
    };
    writeDB(db);
    res.status(201).json(db.subjects[id]); 
});

// (Endpoint: حذف مادة)
app.delete('/api/subjects/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    if (!db.subjects[id]) {
        return res.status(404).json({ error: 'المادة غير موجودة' });
    }
    delete db.subjects[id];
    writeDB(db);
    res.status(200).json({ message: 'تم حذف المادة بنجاح' });
});

// --- API لجلب مادة واحدة بدروسها واختبارها ---
app.get('/api/subjects/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const subject = db.subjects[id];
    if (!subject) return res.status(404).json({ error: 'المادة غير موجودة' });
    const subjectLessons = subject.lessons.map(lessonId => ({
        id: lessonId,
        ...db.lessons[lessonId]
    }));
    const subjectQuiz = db.quizzes[subject.quizId] ? {
        id: subject.quizId,
        ...db.quizzes[subject.quizId]
    } : null;
    res.json({ subject, lessons: subjectLessons, quiz: subjectQuiz });
});

// --- API لإضافة درس جديد ---
app.post('/api/lessons', (req, res) => {
    const { subjectId, title, content } = req.body;
    if (!subjectId || !title) {
        return res.status(400).json({ error: 'معرف المادة والعنوان مطلوبان.' });
    }

    const db = readDB();
    const newLessonId = `${subjectId}-lesson-${Date.now()}`;

    // 1. إضافة الدرس إلى قائمة الدروس
    db.lessons[newLessonId] = {
        title: title,
        content: content || "",
        relatedLessons: []
    };

    // 2. ربط الدرس بالمادة (Subject)
    if (db.subjects[subjectId]) {
        db.subjects[subjectId].lessons.push(newLessonId);
    } else {
        return res.status(404).json({ error: 'المادة غير موجودة لربط الدرس بها.' });
    }

    writeDB(db);
    res.status(201).json({ message: 'تم إضافة الدرس بنجاح.', lessonId: newLessonId });
});

// --- API لتعديل الدروس ---
app.put('/api/lessons/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const db = readDB();
    if (!db.lessons[id]) return res.status(404).json({ error: 'الدرس غير موجود' });

    db.lessons[id].title = title || db.lessons[id].title;
    db.lessons[id].content = content || db.lessons[id].content;
    
    writeDB(db);
    res.json(db.lessons[id]);
});

// --- API لتعديل الاختبارات ---
// --- API لتعديل الاختبارات ---
// --- API لتعديل الاختبارات (تحسين: إنشاء الاختبار تلقائياً إذا كان مفقوداً) ---
app.put('/api/quizzes/:id', (req, res) => {
    const { id } = req.params;
    const { questions } = req.body;
    
    const db = readDB();

    // إذا الاختبار غير موجود، ننشئ واحداً افتراضياً (نحاول ربطه بالمادة إذا أمكن)
    if (!db.quizzes[id]) {
        // نحاول استخراج subjectId من quizId بصيغة "<subjectId>-quiz"
        const maybeSubjectId = id.endsWith('-quiz') ? id.slice(0, -5) : null;
        db.quizzes[id] = {
            title: maybeSubjectId && db.subjects[maybeSubjectId] ? `اختبار ${db.subjects[maybeSubjectId].name}` : `اختبار مؤقت (${id})`,
            questions: []
        };
        // إذا كانت المادة موجودة وربط الـ quizId مفقود، نربطها (سلامة البيانات)
        if (maybeSubjectId && db.subjects[maybeSubjectId] && db.subjects[maybeSubjectId].quizId !== id) {
            db.subjects[maybeSubjectId].quizId = id;
        }
    }

    // التحقق من صحة البيانات
    if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'مصفوفة الأسئلة غير صالحة.' });
    }

    db.quizzes[id].questions = questions; // تحديث الأسئلة
    writeDB(db);
    res.json(db.quizzes[id]);
});


// --- تشغيل الخادم ---
app.listen(PORT, () => {
    console.log(`🚀 Smart Study Server (Full CMS) running on http://localhost:${PORT}`);
});