function stripHtml(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function formatDate(dateString) {
    if (!dateString) return 'לא זמין';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function getStatusClass(status) {
    switch (status) {
        case 'הושלם':
            return 'monday-status-completed';
        case 'בפיתוח':
            return 'monday-status-in-progress';
        case 'טרם החל':
            return 'monday-status-not-started';
        default:
            return '';
    }
}

function getStatusStyle(status) {
    switch (status) {
        case 'בעבודה':
            return 'bg-yellow-100 text-yellow-800';
        case 'הושלם':
            return 'bg-green-100 text-green-800';
        case 'בהמתנה':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function validateCaseData(data) {
    const errors = [];
    
    if (!data.caseNumber || isNaN(data.caseNumber)) {
        errors.push('מספר הטופס חייב להיות מספר תקין');
    }

    if (!data.title || data.title.trim().length === 0) {
        errors.push('כותרת הטופס היא שדה חובה');
    }

    if (!data.responsible || data.responsible.trim().length === 0) {
        errors.push('שם האחראי הוא שדה חובה');
    }

    if (!data.description || data.description.trim().length === 0) {
        errors.push('תיאור הטופס הוא שדה חובה');
    }

    if (!data.hdDevelopmentStatus) {
        errors.push('יש לבחור סטטוס פיתוח ל-HD');
    }

    if (!data.laptopDevelopmentStatus) {
        errors.push('יש לבחור סטטוס פיתוח לפטופ');
    }

    if (!data.approversScreenStatus) {
        errors.push('יש לבחור סטטוס מסך מאשרים');
    }

    if (!data.actionCenterStatus) {
        errors.push('יש לבחור סטטוס התייחסות ב-ACTION CENTER');
    }

    if (!data.automationFailureIndicatorStatus) {
        errors.push('יש לבחור סטטוס חיווי על כשלון אוטומציה');
    }

    if (!data.reminderEmailStatus) {
        errors.push('יש לבחור סטטוס מייל תזכורות');
    }

    if (!data.securityRolesUpdateStatus) {
        errors.push('יש לבחור סטטוס עדכון תפקידי אבטחה');
    }

    if (!data.generalStatus) {
        errors.push('יש לבחור סטטוס טופס כללי');
    }

    return errors;
}

function validateIssueData(data) {
    const errors = [];

    if (!data.issue || data.issue.trim().length === 0) {
        errors.push('תיאור המשימה הוא שדה חובה');
    }

    if (!data.challenge || data.challenge.trim().length === 0) {
        errors.push('תיאור האתגר הוא שדה חובה');
    }

    if (!data.status || data.status.trim().length === 0) {
        errors.push('יש לבחור סטטוס למשימה');
    }

    if (!data.responsible || data.responsible.trim().length === 0) {
        errors.push('שם האחראי למשימה הוא שדה חובה');
    }

    return errors;
}

function searchAndFilterCases(cases, query, status) {
    const lowercaseQuery = query.toLowerCase();
    return cases.filter(c => 
        (c.number.toString().includes(lowercaseQuery) ||
        c.title.toLowerCase().includes(lowercaseQuery) ||
        c.responsible.toLowerCase().includes(lowercaseQuery)) &&
        (status === 'all' || c.generalStatus === status)
    );
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function calculateLuminance(hex) {
    const rgb = hexToRgb(hex);
    return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}