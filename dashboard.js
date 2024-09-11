let dashboardCharts = {};

function initializeDashboard() {
    console.log("Initializing dashboard...");
    const dashboardButton = document.getElementById('dashboardButton');
    const closeDashboardButton = document.getElementById('closeDashboard');
    const dashboardPanel = document.getElementById('dashboardPanel');
    
    if (dashboardButton && closeDashboardButton && dashboardPanel) {
        dashboardButton.addEventListener('click', openDashboard);
        closeDashboardButton.addEventListener('click', closeDashboard);
        console.log("Dashboard initialized successfully");
    } else {
        console.error("Some dashboard elements are missing:", 
            {dashboardButton, closeDashboardButton, dashboardPanel});
    }
}

function openDashboard() {
    const dashboardPanel = document.getElementById('dashboardPanel');
    if (dashboardPanel) {
        updateDashboard();
        dashboardPanel.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        console.error("Dashboard panel not found");
    }
}

function closeDashboard() {
    console.log("Closing dashboard...");
    const dashboardPanel = document.getElementById('dashboardPanel');
    if (dashboardPanel) {
        dashboardPanel.style.display = 'none';
        document.body.style.overflow = 'auto';
    } else {
        console.error("Dashboard panel not found");
    }
}

function updateDashboard() {
    const { cases } = store.getState();
    createStatusPieChart(cases);
    updateStatusSummaryTable(cases);
}

function createStatusPieChart(cases) {
    const statusCounts = cases.reduce((acc, caseItem) => {
        acc[caseItem.generalStatus] = (acc[caseItem.generalStatus] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const ctx = document.getElementById('statusPieChart').getContext('2d');
    
    if (window.statusPieChart instanceof Chart) {
        window.statusPieChart.destroy();
    }

    window.statusPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#4CAF50', '#FFC107', '#2196F3', '#F44336', '#9C27B0', '#FF9800', '#795548'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed;
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function updateStatusSummaryTable(cases) {
    const statusCounts = cases.reduce((acc, caseItem) => {
        acc[caseItem.generalStatus] = (acc[caseItem.generalStatus] || 0) + 1;
        return acc;
    }, {});

    const tableBody = document.getElementById('statusSummaryBody');
    tableBody.innerHTML = '';

    Object.entries(statusCounts).forEach(([status, count]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${status}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${count}</td>
        `;
        tableBody.appendChild(row);
    });
}

function createProcessStageVisualization(cases) {
    const dashboardPanel = document.getElementById('dashboardPanel');
    dashboardPanel.innerHTML = '';
    dashboardPanel.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center';

    const contentContainer = document.createElement('div');
    contentContainer.className = 'bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'float-right text-3xl font-semibold hover:text-gray-700 focus:outline-none';
    closeButton.onclick = closeDashboard;
    contentContainer.appendChild(closeButton);

    const title = document.createElement('h2');
    title.className = 'text-2xl font-bold mb-6';
    title.textContent = 'סטטוס תהליך הטפסים';
    contentContainer.appendChild(title);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'overflow-x-auto';
    
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'dashboard-table-container';

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50';
    thead.innerHTML = `
        <tr>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מספר טופס</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">כותרת</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תהליך</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white divide-y divide-gray-200';

    const statusCounts = {};
    const processSteps = [
        { name: 'פיתוח', icon: 'M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z' },
        { name: 'בדיקות DEV', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
        { name: 'בדיקות TEST', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
        { name: 'ייצור HD', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { name: 'ייצור LAPTOP', icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
        { name: 'ייצור HD+LAPTOP', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' }
    ];

    cases.forEach(caseItem => {
        const row = document.createElement('tr');
        const currentStage = processSteps.findIndex(step => step.name === caseItem.generalStatus);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${caseItem.number}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${caseItem.title}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${statusColors[caseItem.generalStatus] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full text-xs font-semibold">
                    ${caseItem.generalStatus}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex justify-between items-center">
                    ${processSteps.map((step, index) => `
                        <div class="flex flex-col items-center mx-1">
                            <svg class="w-4 h-4 ${index <= currentStage ? 'text-blue-500' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="${step.icon}" clip-rule="evenodd" />
                            </svg>
                            <span class="text-xs mt-1 ${index <= currentStage ? 'font-semibold' : 'text-gray-500'}">${step.name}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);

        statusCounts[caseItem.generalStatus] = (statusCounts[caseItem.generalStatus] || 0) + 1;
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    tableContainer.appendChild(tableWrapper);
    contentContainer.appendChild(tableContainer);

    const summaryTable = document.createElement('table');
    summaryTable.className = 'min-w-full divide-y divide-gray-200 mt-8';
    summaryTable.innerHTML = `
        <thead class="bg-gray-50">
            <tr>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מספר טפסים</th>
            </tr>
        </thead>
<tbody class="bg-white divide-y divide-gray-200">
            ${Object.entries(statusCounts).map(([status, count]) => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="${statusColors[status] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded-full text-xs font-semibold">
                            ${status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${count}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    contentContainer.appendChild(summaryTable);

    dashboardPanel.appendChild(contentContainer);
}

const statusColors = {
    'פיתוח': 'bg-blue-100 text-blue-800',
    'בדיקות DEV': 'bg-yellow-100 text-yellow-800',
    'בדיקות TEST': 'bg-orange-100 text-orange-800',
    'ייצור HD': 'bg-green-100 text-green-800',
    'ייצור LAPTOP': 'bg-indigo-100 text-indigo-800',
    'ייצור HD+LAPTOP': 'bg-purple-100 text-purple-800',
    'בהמתנה': 'bg-gray-100 text-gray-800'
};

function updateOrCreateChart(chartId, type, data, options) {
    const ctx = document.getElementById(chartId).getContext('2d');
    if (dashboardCharts[chartId]) {
        dashboardCharts[chartId].data = data;
        dashboardCharts[chartId].options = options;
        dashboardCharts[chartId].update();
    } else {
        dashboardCharts[chartId] = new Chart(ctx, { type, data, options });
    }
}

function downloadCaseToExcel() {
    const selectedCase = store.getState().selectedCase;
    if (!selectedCase) {
        showNotification('אין טופס נבחר להורדה', 'error');
        return;
    }

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);

    XLSX.utils.sheet_add_aoa(ws, [
        ['פרטי הטופס'],
        ['מספר טופס', selectedCase.number],
        ['כותרת', selectedCase.title],
        ['אחראי', selectedCase.responsible],
        ['תיאור', selectedCase.description],
        ['סטטוס טופס כללי', selectedCase.generalStatus],
        ['צבע', selectedCase.color],
        ['תאריך התחלת פיתוח', formatDate(selectedCase.developmentStartDate)],
        ['נושאים פתוחים באפיון', selectedCase.openIssuesAtStart],
        ['פיתוח ל-HD', selectedCase.hdDevelopmentStatus],
        ['פיתוח לפטופ', selectedCase.laptopDevelopmentStatus],
        ['מסך מאשרים', selectedCase.approversScreenStatus],
        ['התייחסות ב-ACTION CENTER', selectedCase.actionCenterStatus],
        ['חיווי על כשלון אוטומציה', selectedCase.automationFailureIndicatorStatus],
        ['מייל תזכורות', selectedCase.reminderEmailStatus],
        ['תאריך העברה לטסט', formatDate(selectedCase.testTransferDate)],
        ['תאריך העברה לייצור', formatDate(selectedCase.productionTransferDate)],
        ['עדכון תפקידי אבטחה', selectedCase.securityRolesUpdateStatus],
        ['תאריך יצירה', formatDate(selectedCase.createdDate)],
        ['תאריך עדכון', formatDate(selectedCase.modifiedDate)],
        [],
        ['משימות'],
        ['תאריך יצירה', 'משימה', 'אתגר', 'הערות', 'סטטוס', 'אחראי']
    ], { origin: 'A1' });

    selectedCase.issues.forEach((issue, index) => {
        const row = [
            formatDate(issue.createdDate),
            issue.issue,
            issue.challenge,
            issue.notes,
            issue.status,
            issue.responsible
        ];
        XLSX.utils.sheet_add_aoa(ws, [row], { origin: `A${24 + index}` });
    });

    const columnWidths = [
        { wch: 20 }, { wch: 30 }, { wch: 30 }, { wch: 40 }, { wch: 15 }, { wch: 20 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Case Details');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `Case_${selectedCase.number}.xlsx`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showNotification('הקובץ הורד בהצלחה', 'success');
}

// Expose functions to global scope for debugging
window.openDashboard = openDashboard;
window.closeDashboard = closeDashboard;
window.updateDashboard = updateDashboard;
window.downloadCaseToExcel = downloadCaseToExcel;