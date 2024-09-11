function renderNumberGallery(cases) {
    const numberGallery = document.getElementById('number-gallery');
    numberGallery.innerHTML = '';

    const sortedCases = cases.sort((a, b) => a.number - b.number);

    sortedCases.forEach(c => {
        const div = document.createElement('div');
        div.className = 'number-icon w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-200 transition-all duration-300';
        
        const backgroundColor = c.color || '#FFFFFF';
        div.style.backgroundColor = backgroundColor;

        const rgb = hexToRgb(backgroundColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        div.style.color = brightness > 128 ? 'black' : 'white';
        
        div.textContent = c.number;
        div.setAttribute('aria-label', `בחר טופס מספר ${c.number}`);
        div.addEventListener('click', () => selectCase(c.number));
        numberGallery.appendChild(div);
    });
}

function renderIssuesTable(issues) {
    const issuesTableBody = document.getElementById('issues-tbody');
    if (!issuesTableBody) {
        console.error("Element with id 'issues-tbody' not found");
        return;
    }

    issuesTableBody.innerHTML = '';

    if (!issues || issues.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center py-4">אין משימות להצגה</td>';
        issuesTableBody.appendChild(emptyRow);
        return;
    }

    issues.forEach((issue, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="תאריך יצירה" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500">${formatDate(issue.createdDate)}</td>
            <td data-label="משימה" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 wrap-text">${escapeHtml(issue.issue)}</td>
            <td data-label="אתגר" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 wrap-text">${escapeHtml(issue.challenge)}</td>
            <td data-label="הערות" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 wrap-text html-content">${issue.notes}</td>
            <td data-label="סטטוס" class="px-3 py-2 sm:px-6 sm:py-4 text-sm">
                <span class="${getStatusStyle(issue.status)} px-2 py-1 rounded-full text-xs font-semibold">
                    ${escapeHtml(issue.status)}
                </span>
            </td>
            <td data-label="אחראי" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500">
                <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    ${escapeHtml(issue.responsible)}
                </div>
            </td>
            <td data-label="פעולות" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500">
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
                    <button onclick="openModal('issue', 'update', ${index})" class="flex items-center justify-center bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition duration-300" aria-label="ערוך משימה">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        עריכה
                    </button>
                    <button onclick="openModal('issue', 'delete', ${index})" class="flex items-center justify-center bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-300" aria-label="מחק משימה">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        מחיקה
                    </button>
                </div>
            </td>
        `;
        issuesTableBody.appendChild(row);
    });
    announceContentChange(`טבלת המשימות עודכנה עם ${issues.length} משימות.`);
    applyPermissions();
    
    updateFilterOptions(issues);
    initializeIssuesTableFilters();
}
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
function setFieldValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value || 'לא הוגדר';
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
}

function setStatusField(elementId, status) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = status || 'לא הוגדר';
        element.className = 'monday-field-value monday-status ' + getStatusClass(status);
    } else {
        console.warn(`Element with id '${elementId}' not found`);
    }
}
function renderIssuesTable(issues) {
    const issuesTableBody = document.getElementById('issues-tbody');
    issuesTableBody.innerHTML = '';
    issues.forEach((issue, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="תאריך יצירה" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500">${formatDate(issue.createdDate)}</td>
<td data-label="משימה" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 wrap-text">${issue.issue}</td>
            <td data-label="אתגר" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 wrap-text">${issue.challenge}</td>
            <td data-label="הערות" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500 wrap-text html-content">${issue.notes}</td>
            <td data-label="סטטוס" class="px-3 py-2 sm:px-6 sm:py-4 text-sm">
                <span class="${getStatusStyle(issue.status)} px-2 py-1 rounded-full text-xs font-semibold">
                    ${issue.status}
                </span>
            </td>
            <td data-label="אחראי" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500">
                <div class="flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    ${issue.responsible}
                </div>
            </td>
            <td data-label="פעולות" class="px-3 py-2 sm:px-6 sm:py-4 text-sm text-gray-500">
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
                    <button onclick="openModal('issue', 'update', ${index})" class="flex items-center justify-center bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition duration-300" aria-label="ערוך משימה">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        עריכה
                    </button>
                    <button onclick="openModal('issue', 'delete', ${index})" class="flex items-center justify-center bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition duration-300" aria-label="מחק משימה">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        מחיקה
                    </button>
                </div>
            </td>
        `;
        issuesTableBody.appendChild(row);
    });
    announceContentChange(`טבלת המשימות עודכנה עם ${issues.length} משימות.`);
    applyPermissions();
    
    updateFilterOptions(issues);
    initializeIssuesTableFilters();
}

function renderSearchAndFilterBar() {
    const container = document.querySelector('#searchFilterContainer');
    
    if (container.querySelector('#searchInput')) {
        return;
    }

    const searchAndFilterBar = document.createElement('div');
    searchAndFilterBar.className = 'flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2';
    searchAndFilterBar.innerHTML = `
        <div class="relative w-full sm:w-auto">
            <input type="text" id="searchInput" placeholder="חיפוש טפסים..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="חיפוש טפסים">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
        </div>
        <select id="statusFilter" class="w-full sm:w-auto p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="סינון לפי סטטוס">
            <option value="all">כל הסטטוסים</option>
            <option value="פיתוח">פיתוח</option>
            <option value="בדיקות DEV">בדיקות DEV</option>
            <option value="בדיקות TEST">בדיקות TEST</option>
            <option value="ייצור HD">ייצור HD</option>
            <option value="ייצור LAPTOP">ייצור LAPTOP</option>
            <option value="ייצור HD+LAPTOP">ייצור HD+LAPTOP</option>
            <option value="בהמתנה">בהמתנה</option>
        </select>
    `;
    container.appendChild(searchAndFilterBar);

    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    searchInput.addEventListener('input', updateSearchAndFilter);
    statusFilter.addEventListener('change', updateSearchAndFilter);
}

function updateSearchAndFilter() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const filterStatus = document.getElementById('statusFilter').value;
    store.setState({ searchQuery, filterStatus });
    
    const { cases } = store.getState();
    const filteredCases = cases.filter(caseItem => 
        (caseItem.number.toString().includes(searchQuery) ||
        caseItem.title.toLowerCase().includes(searchQuery) ||
        caseItem.responsible.toLowerCase().includes(searchQuery)) &&
        (filterStatus === 'all' || caseItem.generalStatus === filterStatus)
    );
    renderNumberGallery(filteredCases);
}

function showNotification(message, type) {
    Swal.fire({
        text: message,
        icon: type,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });
}

function createLoader() {
    let loader = document.getElementById('loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        `;
        document.body.appendChild(loader);
    }
    return loader;
}

function showLoader() {
    const loader = createLoader();
    loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

function openModal(type, action, index = null) {
    const modal = document.getElementById('dynamicModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalButtons = document.getElementById('modalButtons');

    modalTitle.textContent = `${action === 'add' ? 'הוספת' : action === 'update' ? 'עדכון' : 'מחיקת'} ${type === 'case' ? 'טופס' : 'משימה'}`;
    modalContent.innerHTML = '';
    modalButtons.innerHTML = '';
    if (action === 'add' && !checkPermission('create')) {
        showNotification('אין לך הרשאות ליצור', 'error');
        return;
    }
    if (action === 'update' && !checkPermission('update')) {
        showNotification('אין לך הרשאות לעדכן', 'error');
        return;
    }
    if (action === 'delete' && !checkPermission('delete')) {
        showNotification('אין לך הרשאות למחוק', 'error');
        return;
    }
    if (type === 'case') {
    if (action === 'add' || action === 'update') {
        modalContent.innerHTML = `
            <div class="space-y-8">
                <section class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">מידע בסיסי</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${createFormField('מספר טופס', 'number', 'modal-case-number', true, action === 'update')}
                        ${createFormField('כותרת טופס', 'text', 'modal-case-title', true)}
                        ${createFormField('אחראי על הטופס', 'text', 'modal-case-responsible', true)}
                        ${createFormField('סטטוס טופס כללי', 'select', 'modal-case-general-status', true, false, ['פיתוח', 'בדיקות DEV', 'בדיקות TEST', 'ייצור HD', 'ייצור LAPTOP', 'ייצור HD+LAPTOP', 'בהמתנה'])}
                        <div class="form-field col-span-1 md:col-span-2">
                            ${createFormField('תיאור טופס', 'textarea', 'modal-case-description', true)}
                        </div>
<div class="form-field">
    <label for="modal-case-color" class="block text-sm font-medium text-gray-700 mb-1">צבע טופס</label>
    <select id="modal-case-color" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <option value="#4CAF50">ירוק</option>
        <option value="#FFEB3B">צהוב</option>
        <option value="#FFA500">כתום</option>
        <option value="#F18A86">אדום</option>
        <option value="#9E9E9E">אפור</option>
    </select>
</div>
                    </div>
                </section>

                <section class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">תאריכים ואפיון</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${createFormField('תאריך התחלת פיתוח', 'date', 'modal-case-dev-start-date', false)}
                        ${createFormField('תאריך העברה לטסט', 'date', 'modal-case-test-transfer-date', false)}
                        ${createFormField('תאריך העברה לייצור', 'date', 'modal-case-production-transfer-date', false)}
                        <div class="col-span-1 md:col-span-3">
                            ${createFormField('נושאים פתוחים באפיון', 'textarea', 'modal-case-open-issues', false)}
                        </div>
                    </div>
                </section>

                <section class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">סטטוס פיתוח</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${createFormField('פיתוח ל-HD', 'select', 'modal-case-hd-status', true, false, ['טרם החל', 'בפיתוח', 'הושלם'])}
                        ${createFormField('פיתוח לפטופ', 'select', 'modal-case-laptop-status', true, false, ['טרם החל', 'בפיתוח', 'הושלם'])}
                        ${createFormField('מסך מאשרים', 'select', 'modal-case-approvers-status', true, false, ['טרם החל', 'בפיתוח', 'הושלם'])}
                    </div>
                </section>

                <section class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">תכונות נוספות</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${createFormField('התייחסות ב-ACTION CENTER', 'select', 'modal-case-action-center-status', true, false, ['טרם החל', 'בפיתוח', 'הושלם'])}
                        ${createFormField('חיווי על כשלון אוטומציה', 'select', 'modal-case-automation-failure-status', true, false, ['טרם החל', 'בפיתוח', 'הושלם'])}
                        ${createFormField('מייל תזכורות', 'select', 'modal-case-reminder-email-status', true, false, ['טרם החל', 'בפיתוח', 'הושלם'])}
                        ${createFormField('עדכון תפקידי אבטחה', 'select', 'modal-case-security-roles-status', true, false, ['טרם החל', 'בפיתוח', 'הושלם'])}
                    </div>
                </section>
            </div>
        `;
        
        if (action === 'update') {
            const selectedCase = store.getState().selectedCase;
            document.getElementById('modal-case-number').value = selectedCase.number;
            document.getElementById('modal-case-title').value = selectedCase.title;
            document.getElementById('modal-case-responsible').value = selectedCase.responsible;
            document.getElementById('modal-case-description').value = selectedCase.description;
            document.getElementById('modal-case-color').value = selectedCase.color || '#FFFFFF';
            document.getElementById('modal-case-dev-start-date').value = selectedCase.developmentStartDate || '';
            document.getElementById('modal-case-open-issues').value = selectedCase.openIssuesAtStart || '';
            document.getElementById('modal-case-hd-status').value = selectedCase.hdDevelopmentStatus || '';
            document.getElementById('modal-case-laptop-status').value = selectedCase.laptopDevelopmentStatus || '';
            document.getElementById('modal-case-approvers-status').value = selectedCase.approversScreenStatus || '';
            document.getElementById('modal-case-action-center-status').value = selectedCase.actionCenterStatus || '';
            document.getElementById('modal-case-automation-failure-status').value = selectedCase.automationFailureIndicatorStatus || '';
            document.getElementById('modal-case-reminder-email-status').value = selectedCase.reminderEmailStatus || '';
            document.getElementById('modal-case-test-transfer-date').value = selectedCase.testTransferDate || '';
            document.getElementById('modal-case-production-transfer-date').value = selectedCase.productionTransferDate || '';
            document.getElementById('modal-case-security-roles-status').value = selectedCase.securityRolesUpdateStatus || '';
            document.getElementById('modal-case-general-status').value = selectedCase.generalStatus || '';
        }

            modalButtons.innerHTML = `
                <button onclick="handleCase('${action}')" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">${action === 'add' ? 'הוסף' : 'עדכן'} טופס</button>
                <button onclick="closeModal()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2 transition duration-300">ביטול</button>
            `;
        } else if (action === 'delete') {
            modalContent.innerHTML = '<p>האם אתה בטוח שברצונך למחוק את הטופס הזה?</p>';
            modalButtons.innerHTML = `
                <button onclick="handleCase('delete')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">מחק טופס</button>
                <button onclick="closeModal()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2 transition duration-300">ביטול</button>
            `;
        }
    } else  if (type === 'issue') {
        if (action === 'add' || action === 'update') {
            modalContent.innerHTML = `
                <div class="modal-field">
                    <label for="modal-issue-text">משימה:</label>
                    <input type="text" id="modal-issue-text" class="w-full p-2 border rounded" placeholder="הזן את המשימה">
                </div>
                <div class="modal-field">
                    <label for="modal-issue-challenge">אתגר:</label>
                    <textarea id="modal-issue-challenge" class="w-full p-2 border rounded" rows="4"></textarea>
                </div>
                <div class="modal-field">
                    <label for="modal-issue-notes">הערות:</label>
                    <textarea id="modal-issue-notes" class="w-full p-2 border rounded" rows="6"></textarea>
                </div>
                <div class="modal-field">
                    <label for="modal-issue-status">סטטוס:</label>
                    <select id="modal-issue-status" class="w-full p-2 border rounded">
                        <option value="" disabled selected>בחר סטטוס</option>
                        <option value="בעבודה">בעבודה</option>
                        <option value="הושלם">הושלם</option>
                        <option value="בהמתנה">בהמתנה</option>
                    </select>
                </div>
                <div class="modal-field">
                    <label for="modal-issue-responsible">אחראי:</label>
                    <input type="text" id="modal-issue-responsible" class="w-full p-2 border rounded" placeholder="הזן את שם האחראי">
                </div>
            `;

            if (action === 'update') {
                const selectedCase = store.getState().selectedCase;
                const issue = selectedCase.issues[index];
                document.getElementById('modal-issue-text').value = issue.issue;
                document.getElementById('modal-issue-challenge').value = issue.challenge;
                document.getElementById('modal-issue-notes').value = issue.notes; // Preserve HTML
                document.getElementById('modal-issue-status').value = issue.status;
                document.getElementById('modal-issue-responsible').value = issue.responsible;
            }
            ;

            modalButtons.innerHTML = `
                <button onclick="handleIssue('${action}', ${index})" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300">${action === 'add' ? 'הוסף' : 'עדכן'} משימה</button>
                <button onclick="closeModal()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-600 mr-2 transition duration-300">ביטול</button>
            `;
        } else if (action === 'delete') {
            modalContent.innerHTML = '<p>האם אתה בטוח שברצונך למחוק את המשימה הזו?</p>';
            modalButtons.innerHTML = `
                <button onclick="handleIssue('delete', ${index})" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300">מחק משימה</button>
                <button onclick="closeModal()" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2 transition duration-300">ביטול</button>
            `;
        }
    }

    modal.style.display = 'block';
    setupModalAccessibility();
}

function closeModal() {
    const modal = document.getElementById('dynamicModal');
    modal.style.display = 'none';
    cleanupModalAccessibility();
}

function setupModalAccessibility() {
    const modal = document.getElementById('dynamicModal');
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
}

function cleanupModalAccessibility() {
    const modal = document.getElementById('dynamicModal');
    modal.removeEventListener('keydown', null);
}

function announceContentChange(message) {
    let announcer = document.getElementById('content-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'content-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.classList.add('sr-only');
        document.body.appendChild(announcer);
    }
    announcer.textContent = message;
}

function applyPermissions() {
    const canCreate = checkPermission('create');
    const canUpdate = checkPermission('update');
    const canDelete = checkPermission('delete');

    document.querySelectorAll('.create-button').forEach(button => {
        button.style.display = canCreate ? '' : 'none';
    });

    document.querySelectorAll('.update-button').forEach(button => {
        button.style.display = canUpdate ? '' : 'none';
    });

    document.querySelectorAll('.delete-button').forEach(button => {
        button.style.display = canDelete ? '' : 'none';
    });
}
function showMainContent() {
    document.getElementById('mainContentContainer').classList.remove('hidden');
    document.getElementById('mainContentContainer').classList.add('fade-in');
}
// Add this function to ui.js

function selectCase(caseNumber) {
    const selectedCase = store.getState().cases.find(c => c.number === caseNumber);
    if (selectedCase) {
        store.setState({ selectedCase });
        renderCaseInfo(selectedCase);
        renderIssuesTable(selectedCase.issues);
        document.getElementById('case-info').classList.remove('hidden');
        document.getElementById('issues-table-container').classList.remove('hidden');
        announceContentChange(`טופס מספר ${caseNumber} נבחר. מציג פרטים ומשימות.`);
    }
}