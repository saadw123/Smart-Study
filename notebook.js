// js/notebook.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. تحديد العناصر الرئيسية ---
    const titleInput = document.getElementById('note-title-input');
    const textInput = document.getElementById('note-text-input');
    const saveButton = document.getElementById('save-note-btn');
    const notesList = document.getElementById('notes-list');
    const noNotesMessage = document.getElementById('no-notes-message');

    // --- 2. جلب وحفظ الملاحظات ---

    // جلب الملاحظات من التخزين المحلي (Local Storage)
    function getNotes() {
        const notes = localStorage.getItem('study_notebook_notes');
        return notes ? JSON.parse(notes) : [];
    }

    // حفظ الملاحظات في التخزين المحلي
    function saveNotes(notes) {
        localStorage.setItem('study_notebook_notes', JSON.stringify(notes));
    }

    // --- 3. دالة عرض الملاحظات ---
    function renderNotes() {
        const notes = getNotes();
        notesList.innerHTML = ''; 

        if (notes.length === 0) {
            noNotesMessage.style.display = 'block';
            notesList.appendChild(noNotesMessage);
            return;
        }

        noNotesMessage.style.display = 'none';

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            
            // إضافة العنوان إذا كان موجودًا
            const titleHtml = note.title 
                ? `<h3>${note.title}</h3>` 
                : '';
            
            noteCard.innerHTML = `
                ${titleHtml}
                <p>${note.text}</p>
                <button class="delete-note-btn" data-id="${note.id}" title="حذف الملاحظة">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;
            
            notesList.appendChild(noteCard);
        });

        // إضافة مستمعي الأحداث لأزرار الحذف الجديدة
        document.querySelectorAll('.delete-note-btn').forEach(button => {
            button.addEventListener('click', deleteNote);
        });
    }

    // --- 4. دالة إضافة ملاحظة جديدة ---
    saveButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const text = textInput.value.trim();

        if (text === '') {
            alert('يجب كتابة محتوى للملاحظة أولاً!');
            return;
        }

        const notes = getNotes();
        const newNote = {
            id: Date.now(), // استخدام ختم الوقت كمعرف فريد
            title: title,
            text: text,
            date: new Date().toLocaleString()
        };

        notes.unshift(newNote); // إضافة الملاحظة الجديدة في البداية
        saveNotes(notes);
        
        // مسح الحقول وإعادة عرض القائمة
        titleInput.value = '';
        textInput.value = '';
        renderNotes();
    });

    // --- 5. دالة حذف ملاحظة ---
    function deleteNote(event) {
        const noteId = parseInt(event.currentTarget.dataset.id);
        
        let notes = getNotes();
        // تصفية الملاحظات لحذف الملاحظة التي تطابق المعرف
        notes = notes.filter(note => note.id !== noteId); 
        
        saveNotes(notes);
        renderNotes();
    }

    // --- 6. عند تحميل الصفحة، اعرض الملاحظات الموجودة ---
    renderNotes();
});