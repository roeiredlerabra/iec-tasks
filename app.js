let appInitialized = false;

async function initializeApp() {
    if (appInitialized) return;

    const token = localStorage.getItem('token');
    if (!token) {
        showLoginForm();
        return;
    }

    if (!checkPermission('read')) {
        showNotification('אין לך הרשאות לצפות בנתונים', 'error');
        logout();
        return;
    }

    hideLoginForm();
    showMainContent();

    try {
        await fetchData();
        renderSearchAndFilterBar();
        renderNumberGallery(store.getState().cases);
        applyPermissions();

        appInitialized = true;
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('אירעה שגיאה בטעינת הנתונים', 'error');
    }
}

window.addEventListener('load', initializeApp);

store.subscribe(() => {
    const { cases, selectedCase, searchQuery, filterStatus } = store.getState();
    const filteredCases = searchAndFilterCases(cases, searchQuery, filterStatus);
    renderNumberGallery(filteredCases);
    if (selectedCase) {
        renderCaseInfo(selectedCase);
        renderIssuesTable(selectedCase.issues);
    }
});

document.addEventListener('DOMContentLoaded', initializeDashboard);

window.selectCase = selectCase;
window.openModal = openModal;
window.closeModal = closeModal;
window.handleCase = handleCase;
window.handleIssue = handleIssue;
window.downloadCaseToExcel = downloadCaseToExcel;
window.logout = logout;