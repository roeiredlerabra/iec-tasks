async function fetchData() {
    showLoader();
    try {
        const response = await fetch('https://prod-104.westeurope.logic.azure.com:443/workflows/b7713903f38b4effb97853ea464dd728/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rkFqioCbLnqcJY7vjvC6KfNY7rsGVpn4YsyRxujJkXY', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_all' })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const processedData = processApiData(data);
        store.setState({ cases: processedData });
        return processedData;
    } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('שגיאה בטעינת נתונים', 'error');
        return [];
    } finally {
        hideLoader();
    }
}

function processApiData(apiData) {
    const cases = apiData.filter(item => !item.FatherID).map(caseItem => ({
        id: caseItem.ID,
        number: parseInt(caseItem.FormNumber),
        title: caseItem.Title,
        responsible: caseItem.Responsible || '',
        description: caseItem.Notes ? stripHtml(caseItem.Notes) : '',
        color: caseItem.Color || '#FFFFFF',
        developmentStartDate: caseItem.developmentStartDate || '',
        openIssuesAtStart: caseItem.openIssuesAtStart ? stripHtml(caseItem.openIssuesAtStart) : '',
        hdDevelopmentStatus: caseItem.hdDevelopmentStatus || '',
        laptopDevelopmentStatus: caseItem.laptopDevelopmentStatus || '',
        approversScreenStatus: caseItem.approversScreenStatus || '',
        actionCenterStatus: caseItem.actionCenterStatus || '',
        automationFailureIndicatorStatus: caseItem.automationFailureIndicatorStatus || '',
        reminderEmailStatus: caseItem.reminderEmailStatus || '',
        testTransferDate: caseItem.testTransferDate || '',
        productionTransferDate: caseItem.productionTransferDate || '',
        securityRolesUpdateStatus: caseItem.securityRolesUpdateStatus || '',
        createdDate: caseItem.Created,
        modifiedDate: caseItem.Modified,
        author: caseItem.Author ? caseItem.Author.DisplayName : '',
        editor: caseItem.Editor ? caseItem.Editor.DisplayName : '',
        generalStatus: caseItem.Status || '',
        issues: []
    }));

    apiData.filter(item => item.FatherID).forEach(issueItem => {
        const parentCase = cases.find(c => c.number === parseInt(issueItem.FormNumber));
        if (parentCase) {
            parentCase.issues.push({
                id: issueItem.ID,
                fatherId: issueItem.FatherID,
                issue: issueItem.Title,
                challenge: stripHtml(issueItem.Challenge),
                notes: stripHtml(issueItem.Notes),
                status: mapStatus(issueItem.Status),
                responsible: issueItem.Responsible,
                createdDate: issueItem.Created
            });
        }
    });

    return cases;
}

function mapStatus(oldStatus) {
    switch (oldStatus.toLowerCase()) {
        case 'בעבודה':
        case 'בתהליך':
            return 'בעבודה';
        case 'הושלם':
        case 'סגור':
            return 'הושלם';
        default:
            return 'בהמתנה';
    }
}

async function handleCase(action) {
    disableButtons();
    let data = {
        action: action,
        id: action === 'add' ? null : store.getState().selectedCase.id,
        caseNumber: action === 'add' ? null : store.getState().selectedCase.number,
        title: '',
        responsible: '',
        description: '',
        color: '#FFFFFF',
        developmentStartDate: '',
        openIssuesAtStart: '',
        hdDevelopmentStatus: '',
        laptopDevelopmentStatus: '',
        approversScreenStatus: '',
        actionCenterStatus: '',
        automationFailureIndicatorStatus: '',
        reminderEmailStatus: '',
        testTransferDate: '',
        productionTransferDate: '',
        securityRolesUpdateStatus: '',
        generalStatus: ''
    };

    if (!checkPermission(action === 'add' ? 'create' : action === 'update' ? 'update' : 'delete')) {
        showNotification(`אין לך הרשאות ל${action === 'add' ? 'יצור' : action === 'update' ? 'עדכן' : 'מחוק'}`, 'error');
        enableButtons();
        return;
    }
    if (action === 'add' || action === 'update') {
        data.caseNumber = parseInt(document.getElementById('modal-case-number').value, 10);
        data.title = document.getElementById('modal-case-title').value;
        data.responsible = document.getElementById('modal-case-responsible').value;
        data.description = document.getElementById('modal-case-description').value;
        data.color = document.getElementById('modal-case-color').value;
        data.developmentStartDate = document.getElementById('modal-case-dev-start-date').value;
        data.openIssuesAtStart = document.getElementById('modal-case-open-issues').value;
        data.hdDevelopmentStatus = document.getElementById('modal-case-hd-status').value;
        data.laptopDevelopmentStatus = document.getElementById('modal-case-laptop-status').value;
        data.approversScreenStatus = document.getElementById('modal-case-approvers-status').value;
        data.actionCenterStatus = document.getElementById('modal-case-action-center-status').value;
        data.automationFailureIndicatorStatus = document.getElementById('modal-case-automation-failure-status').value;
        data.reminderEmailStatus = document.getElementById('modal-case-reminder-email-status').value;
        data.testTransferDate = document.getElementById('modal-case-test-transfer-date').value;
        data.productionTransferDate = document.getElementById('modal-case-production-transfer-date').value;
        data.securityRolesUpdateStatus = document.getElementById('modal-case-security-roles-status').value;
        data.generalStatus = document.getElementById('modal-case-general-status').value;

        const errors = validateCaseData(data);
        if (errors.length > 0) {
            showNotification(errors.join('\n'), 'error');
            enableButtons();
            return;
        }
    }

    try {
        const response = await fetch('https://prod-104.westeurope.logic.azure.com:443/workflows/b7713903f38b4effb97853ea464dd728/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rkFqioCbLnqcJY7vjvC6KfNY7rsGVpn4YsyRxujJkXY', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        await response.json();

        const cases = await fetchData();
        store.setState({ cases });
        if (store.getState().selectedCase) {
            selectCase(store.getState().selectedCase.number);
        }
        closeModal();
        showNotification(`הטופס ${action === 'add' ? 'נוסף' : action === 'update' ? 'עודכן' : 'נמחק'} בהצלחה`, 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('אירעה שגיאה. נא לנסות שוב', 'error');
    } finally {
        enableButtons();
    }
}

async function handleIssue(action, index) {
    const selectedCase = store.getState().selectedCase;
    disableButtons();
    let data = {
        action: action,
        id: action === 'add' ? null : selectedCase.issues[index].id,
        caseNumber: selectedCase.number,
        fatherId: selectedCase.id,
        issue: '',
        challenge: '',
        notes: '',
        status: '',
        responsible: ''
    };

    if (!checkPermission(action === 'add' ? 'create' : action === 'update' ? 'update' : 'delete')) {
        showNotification(`אין לך הרשאות ל${action === 'add' ? 'יצור' : action === 'update' ? 'עדכן' : 'מחוק'}`, 'error');
        enableButtons();
        return;
    }

    if (action === 'add' || action === 'update') {
        data.issue = document.getElementById('modal-issue-text').value;
        data.challenge = document.getElementById('modal-issue-challenge').value;
        data.notes = document.getElementById('modal-issue-notes').value;
        data.status = document.getElementById('modal-issue-status').value;
        data.responsible = document.getElementById('modal-issue-responsible').value;

        const errors = validateIssueData(data);
        if (errors.length > 0) {
            showNotification(errors.join('\n'), 'error');
            enableButtons();
            return;
        }
    }

    try {
        const response = await fetch('https://prod-104.westeurope.logic.azure.com:443/workflows/b7713903f38b4effb97853ea464dd728/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rkFqioCbLnqcJY7vjvC6KfNY7rsGVpn4YsyRxujJkXY', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        await response.json();

        const cases = await fetchData();
        store.setState({ cases });
        if (selectedCase) {
            selectCase(selectedCase.number);
        }
        closeModal();
        showNotification(`המשימה ${action === 'add' ? 'נוספה' : action === 'update' ? 'עודכנה' : 'נמחקה'} בהצלחה`, 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('אירעה שגיאה. נא לנסות שוב', 'error');
    } finally {
        enableButtons();
    }
}