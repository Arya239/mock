// --- ANTI-CHEAT & SECURITY ---
// Disable Right Click
document.addEventListener('contextmenu', event => event.preventDefault());
// Disable F12 and DevTools Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});

const categoryGrid = document.getElementById('category-grid');
const addCardBtn = document.getElementById('add-card-btn');
const logoBtn = document.getElementById('logo-btn');
const sectionTitle = document.getElementById('section-title');
const backBtn = document.getElementById('back-btn');

let currentCategoryIndex = null; // null means main menu par hain

// Default Categories jo pehli baar load hongi
const defaultCategories = [
    { 
        title: "🏛️ SSC Exams", desc: "CGL, GD, CHSL, MTS, CPO", 
        subcategories: [{ title: "SSC MTS" }, { title: "SSC CHSL" }] 
    },
    { 
        title: "🚆 Railway Exams", desc: "NTPC, Group D, ALP", 
        subcategories: [{ title: "RRB NTPC" }, { title: "RRB Group D" }] 
    },
    { 
        title: "🕵️ Intelligence Bureau", desc: "ACIO, SA/EXE, MTS", 
        subcategories: [{ title: "IB ACIO" }, { title: "IB SA/EXE" }] 
    },
    { 
        title: "🎓 Other Exams", desc: "Banking, State Police, Defence", 
        subcategories: [{ title: "Banking PO" }, { title: "State Police" }] 
    }
];

// Local Storage se check karein agar pehle se data hai ya nahi
let categories = JSON.parse(localStorage.getItem('examCategories'));
// Agar purana data hai jisme subcategories nahi hain, toh use naye data se update karein
if (!categories || !categories[0].subcategories) {
    categories = defaultCategories;
    localStorage.setItem('examCategories', JSON.stringify(categories));
}

// Check Admin Status jab page load ho
if (sessionStorage.getItem('_md_admin_token') === 'secure_auth_v1') {
    addCardBtn.style.display = 'inline-block';
}

// Screen par cards render karne ka function
function renderCards() {
    categoryGrid.innerHTML = '';
    const isAdmin = sessionStorage.getItem('_md_admin_token') === 'secure_auth_v1';

    if (currentCategoryIndex === null) {
        // MAIN CATEGORIES SHOW KAREIN
        sectionTitle.innerText = "🎯 Select Your Exam Category";
        backBtn.style.display = 'none';
        addCardBtn.innerText = "➕ Add New Category (Admin)";

        categories.forEach((cat, index) => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.onclick = () => {
                currentCategoryIndex = index;
                renderCards(); // Click par sub-categories dikhayein
            };
            card.style.animationDelay = `${index * 0.1}s`;
            
            let deleteBtnHTML = isAdmin ? `<span class="delete-card-btn" title="Delete Card" onclick="deleteCard(${index}, event)">❌</span>` : '';

            card.innerHTML = `
                ${deleteBtnHTML}
                <h3>${cat.title}</h3>
                <p>${cat.desc}</p>
                <button class="start-btn">View Exams</button>
            `;
            categoryGrid.appendChild(card);
        });
    } else {
        // SUB-CATEGORIES SHOW KAREIN
        const currentCat = categories[currentCategoryIndex];
        sectionTitle.innerText = `📂 ${currentCat.title} - Select Exam`;
        backBtn.style.display = 'inline-block';
        addCardBtn.innerText = "➕ Add New Test (Admin)";

        const subs = currentCat.subcategories || [];
        if (subs.length === 0) {
            categoryGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No exams found in this category.</p>';
        } else {
            const listContainer = document.createElement('div');
            listContainer.className = 'subcategory-list-container';
            listContainer.style.gridColumn = '1 / -1'; // Grid ko poora cover karne ke liye

            subs.forEach((sub, subIndex) => {
                const listItem = document.createElement('div');
                listItem.className = 'subcategory-item';

                let addSubjBtnHTML = isAdmin ? `<button class="add-subject-btn" title="Add Subject" onclick="addSubject(${subIndex}, event)">➕ Subject</button>` : '';
                let deleteBtnHTML = isAdmin ? `<span class="delete-list-btn" title="Delete Exam" onclick="deleteSubCategory(${subIndex}, event)">❌</span>` : '';

                // Default subjects agar pehle se save nahi hain toh
                const subjects = sub.subjects || ['Math', 'Reasoning', 'English', 'Hindi', 'GK/GS'];
                let subjectButtonsHTML = subjects.map((subj, subjIndex) => {
                    let delSubjBtn = isAdmin ? `<span class="delete-subj-btn" title="Delete Subject" onclick="deleteSubject(${subIndex}, ${subjIndex}, event)">❌</span>` : '';
                    let addQsBtn = isAdmin ? `<span class="add-qs-btn" title="Add/Edit Questions" onclick="openQuestionEditor(${subIndex}, ${subjIndex}, '${subj}', event)">📝</span>` : '';
                    return `<div class="subject-wrapper">
                                <button class="start-text-btn subject-btn" onclick="window.location.href='mocktest.html?cat=${currentCategoryIndex}&sub=${subIndex}&subj=${subjIndex}'">${subj}</button>
                                ${delSubjBtn}
                                ${addQsBtn}
                            </div>`;
                }).join('');

                listItem.innerHTML = `
                    <div class="subcategory-header">
                        <span class="sub-title">📄 ${sub.title}</span>
                        <div class="sub-actions">${addSubjBtnHTML}${deleteBtnHTML}</div>
                    </div>
                    <div class="subject-buttons-container">
                        ${subjectButtonsHTML}
                    </div>
                `;
                listContainer.appendChild(listItem);
            });
            categoryGrid.appendChild(listContainer);
        }
    }
}

// Admin Login Logic
logoBtn.addEventListener('click', () => {
    // Admin login functionality is now on the logo
    
    // Agar pehle se admin hai toh Logout kar do
    if (sessionStorage.getItem('_md_admin_token') === 'secure_auth_v1') {
        sessionStorage.removeItem('_md_admin_token'); 
        addCardBtn.style.display = 'none';
        alert("Admin Logout successful.");
        renderCards(); // Cards ko wapas normal load karo
        return;
    }
    
    const password = prompt("Admin Password darj karein:");
    // Password ko double encrypt/reverse karke check kiya hai taaki direct decode na ho sake
    if (password !== null && btoa(password).split('').reverse().join('') === "==wYzcXdvbXZ2ZmlGY") { 
        sessionStorage.setItem('_md_admin_token', 'secure_auth_v1');
        addCardBtn.style.display = 'inline-block'; // Button show karein
        alert("Admin mode active! Ab aap naye exams add kar sakte hain.");
        renderCards(); // Admin features ke sath cards load karo
    } else if (password !== null) {
        alert("Galat Password!");
    }
});

// Back Button Logic
backBtn.addEventListener('click', () => {
    currentCategoryIndex = null; // Wapas main menu (categories) par set karein
    renderCards(); // Screen ko refresh karke cards dobara show karein
});

// Card Delete karne ka function
function deleteCard(index, event) {
    event.stopPropagation(); // Card pe click ho kar dusre page pe jaane se roke
    if (confirm("Kya aap sach me is exam category ko delete karna chahte hain?")) {
        categories.splice(index, 1); // Array me se hataye
        localStorage.setItem('examCategories', JSON.stringify(categories)); // Data save karein
        renderCards(); // Screen update karein
    }
}

// Sub-Category Delete karne ka function
function deleteSubCategory(subIndex, event) {
    event.stopPropagation();
    if (confirm("Kya aap sach me is exam ko delete karna chahte hain?")) {
        categories[currentCategoryIndex].subcategories.splice(subIndex, 1);
        localStorage.setItem('examCategories', JSON.stringify(categories));
        renderCards();
    }
}

// Subject add karne ka function
function addSubject(subIndex, event) {
    event.stopPropagation();
    const subjectName = prompt("Naye Subject ka naam dalein (e.g. Computer, Physics):");
    if (!subjectName) return;

    // Agar purana data hai jisme subjects save nahi the, toh pehle default wale add karein
    if (!categories[currentCategoryIndex].subcategories[subIndex].subjects) {
        categories[currentCategoryIndex].subcategories[subIndex].subjects = ['Math', 'Reasoning', 'English', 'Hindi', 'GK/GS'];
    }
    categories[currentCategoryIndex].subcategories[subIndex].subjects.push(subjectName);
    localStorage.setItem('examCategories', JSON.stringify(categories));
    renderCards();
}

// Subject delete karne ka function
function deleteSubject(subIndex, subjIndex, event) {
    event.stopPropagation();
    if (confirm("Kya aap sach me is subject ko delete karna chahte hain?")) {
        categories[currentCategoryIndex].subcategories[subIndex].subjects.splice(subjIndex, 1);
        localStorage.setItem('examCategories', JSON.stringify(categories));
        renderCards();
    }
}

let editingLocation = null; // Save karne ke waqt yaad rakhne ke liye ki konsa exam tha

// Text ko form me daalte waqt safe rakhne ke liye function
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Question Editor Open karna aur form generate karna
function openQuestionEditor(subIndex, subjIndex, subjName, event) {
    event.stopPropagation();
    editingLocation = { catIndex: currentCategoryIndex, subIndex, subjIndex };
    const currentCat = categories[currentCategoryIndex];
    const currentSub = currentCat.subcategories[subIndex];

    let existingQs = [];
    if (currentSub.questionsData && currentSub.questionsData[subjIndex]) {
        existingQs = currentSub.questionsData[subjIndex];
    }

    let numQsStr = "0";
    if (existingQs.length === 0) {
        numQsStr = prompt(`Kitne questions dalne hain "${subjName}" me? (e.g., 10, 20)`, "10");
        if (!numQsStr) return;
    } else {
        numQsStr = prompt(`Pehle se ${existingQs.length} questions hain.\nNaye kitne add karne hain? (Sirf delete/edit karna ho toh 0 likhein)`, "0");
        if (numQsStr === null) return;
    }

    const numQs = parseInt(numQsStr) || 0;

    document.getElementById('modal-title').innerText = `${currentCat.title} > ${currentSub.title} > ${subjName}`;

    let html = '';
    
    // Purane saved questions ko load karna
    existingQs.forEach((qData) => {
        html += generateQuestionBlockHTML(qData);
    });

    // Naye questions ke liye khali dabbe add karna
    for (let j = 1; j <= numQs; j++) {
        html += generateQuestionBlockHTML(null);
    }

    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('question-modal').style.display = 'flex';
    updateQuestionNumbers();
}

function generateQuestionBlockHTML(qData) {
    let engQ = qData ? escapeHTML(qData.eng.q) : '';
    let engA = qData ? escapeHTML(qData.eng.options[0]) : '';
    let engB = qData ? escapeHTML(qData.eng.options[1]) : '';
    let engC = qData ? escapeHTML(qData.eng.options[2]) : '';
    let engD = qData ? escapeHTML(qData.eng.options[3]) : '';

    let hinQ = qData ? escapeHTML(qData.hin.q) : '';
    let hinA = qData ? escapeHTML(qData.hin.options[0]) : '';
    let hinB = qData ? escapeHTML(qData.hin.options[1]) : '';
    let hinC = qData ? escapeHTML(qData.hin.options[2]) : '';
    let hinD = qData ? escapeHTML(qData.hin.options[3]) : '';

    let ans = qData ? qData.answer : 0;

    return `
        <div class="q-entry-block">
            <h3><span class="q-num-label">Question</span> <button type="button" class="del-q-btn" onclick="deleteQuestionBlock(this)">🗑️ Delete</button></h3>
            <div class="two-pane-grid">
                <div class="pane eng-pane">
                    <h4>English</h4>
                    <textarea class="eng-q" placeholder="Enter question in English">${engQ}</textarea>
                    <input type="text" class="eng-opt-a" placeholder="Option A" value="${engA}">
                    <input type="text" class="eng-opt-b" placeholder="Option B" value="${engB}">
                    <input type="text" class="eng-opt-c" placeholder="Option C" value="${engC}">
                    <input type="text" class="eng-opt-d" placeholder="Option D" value="${engD}">
                </div>
                <div class="pane hin-pane">
                    <h4>Hindi</h4>
                    <textarea class="hin-q" placeholder="हिंदी में प्रश्न दर्ज करें">${hinQ}</textarea>
                    <input type="text" class="hin-opt-a" placeholder="विकल्प A" value="${hinA}">
                    <input type="text" class="hin-opt-b" placeholder="विकल्प B" value="${hinB}">
                    <input type="text" class="hin-opt-c" placeholder="विकल्प C" value="${hinC}">
                    <input type="text" class="hin-opt-d" placeholder="विकल्प D" value="${hinD}">
                </div>
            </div>
            <div class="correct-ans-block">
                <label><strong>Correct Answer:</strong></label>
                <select class="correct-ans">
                    <option value="0" ${ans === 0 ? 'selected' : ''}>Option A</option>
                    <option value="1" ${ans === 1 ? 'selected' : ''}>Option B</option>
                    <option value="2" ${ans === 2 ? 'selected' : ''}>Option C</option>
                    <option value="3" ${ans === 3 ? 'selected' : ''}>Option D</option>
                </select>
            </div>
        </div>
    `;
}

function deleteQuestionBlock(btn) {
    if (confirm("Kya aap is question ko delete karna chahte hain? (Neeche Save zaroor karein)")) {
        btn.closest('.q-entry-block').remove();
        updateQuestionNumbers();
    }
}

function updateQuestionNumbers() {
    const labels = document.querySelectorAll('.q-num-label');
    labels.forEach((label, idx) => {
        label.innerText = `Question ${idx + 1}`;
    });
}

// Modal Band Karne Ka Button
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('question-modal').style.display = 'none';
});

// Form Save Karne Ka Logic
document.getElementById('save-questions-btn').addEventListener('click', () => {
    const blocks = document.querySelectorAll('.q-entry-block');
    const questionsArray = [];
    
    blocks.forEach((block) => {
        questionsArray.push({
            eng: {
                q: block.querySelector('.eng-q').value,
                options: [
                    block.querySelector('.eng-opt-a').value,
                    block.querySelector('.eng-opt-b').value,
                    block.querySelector('.eng-opt-c').value,
                    block.querySelector('.eng-opt-d').value
                ]
            },
            hin: {
                q: block.querySelector('.hin-q').value,
                options: [
                    block.querySelector('.hin-opt-a').value,
                    block.querySelector('.hin-opt-b').value,
                    block.querySelector('.hin-opt-c').value,
                    block.querySelector('.hin-opt-d').value
                ]
            },
            answer: parseInt(block.querySelector('.correct-ans').value)
        });
    });

    const { catIndex, subIndex, subjIndex } = editingLocation;
    let targetSub = categories[catIndex].subcategories[subIndex];
    
    // Data ko Local Storage mein save karna
    if (!targetSub.questionsData) targetSub.questionsData = {};
    targetSub.questionsData[subjIndex] = questionsArray;
    
    localStorage.setItem('examCategories', JSON.stringify(categories));
    alert(`${questionsArray.length} Questions Successfully Save Ho Gaye!`);
    document.getElementById('question-modal').style.display = 'none';
});

// Jab admin naya card add karna chahe
addCardBtn.addEventListener('click', () => {
    if (currentCategoryIndex === null) {
        // Main category add karna
        const title = prompt("Nayi Category ka title dalein (e.g. 💻 IT Exams):");
        if (!title) return;
        
        const desc = prompt("Exams ke naam dalein (e.g. TCS, Infosys):");
        if (!desc) return;

        categories.push({ title: title, desc: desc, subcategories: [] });
        localStorage.setItem('examCategories', JSON.stringify(categories));
        renderCards();
    } else {
        // Sub-category (exam) add karna
        const title = prompt("Naye Test ka naam dalein (e.g. SSC CGL, SSC GD):");
        if (!title) return;

        if (!categories[currentCategoryIndex].subcategories) {
            categories[currentCategoryIndex].subcategories = [];
        }
        categories[currentCategoryIndex].subcategories.push({ title: title, subjects: ['Math', 'Reasoning', 'English', 'Hindi', 'GK/GS'] });
        localStorage.setItem('examCategories', JSON.stringify(categories));
        renderCards();
    }
});

// Start karte waqt ek baar saare cards show kar do
renderCards();