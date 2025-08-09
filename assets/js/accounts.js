// Global variable declarations
let accountsTable;
let accountsChart;

// Document ready wrapper
$(document).ready(function() {
    // Initialize DataTable - assign to global variable
    accountsTable = $('#accounts-table').DataTable({
        columns: [
            { data: 'id' },
            { data: 'name' },
            { data: 'top' },
            { data: 'down' },
            { data: 'base' },
            { data: 'pounds' },
            { data: 'karat' },
            { 
                data: 'value',
                render: function(data) {
                    return 'GHS ' + data.toFixed(2);
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    const statusClass = data === 'active' ? 'badge bg-success' : 
                                      data === 'inactive' ? 'badge bg-secondary' : 'badge bg-warning';
                    return `<span class="${statusClass}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
                }
            },
            { 
                data: null,
                render: function(_, __, row) {
                    return `
                        <button class="btn btn-sm btn-outline-primary edit-account" data-id="${row.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-account" data-id="${row.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                },
                orderable: false
            }
        ],
        dom: '<"top"f>rt<"bottom"lip><"clear">',
        responsive: true,
        initComplete: function() {
            // Use setTimeout to ensure accountsTable is fully initialized
            setTimeout(updateSummary, 100);
        }
    });
    
    // Sample data
    const sampleAccounts = [
        {
            id: 1,
            name: 'Ema',
            phone: '244546564',
            email: 'ema@example.com',
            location: 'Tarkwa',
            top: 2520.11,
            down: 138.39,
            base: 1030,
            pounds: 325.18,
            karat: 18.21,
            value: 94042.35,
            status: 'active',
            notes: 'Premium client'
        },
        {
            id: 2,
            name: 'Dan',
            phone: '244931981',
            email: 'dan@example.com',
            location: 'Tarkwa',
            top: 2987.23,
            down: 160.17,
            base: 1025,
            pounds: 385.45,
            karat: 18.65,
            value: 112543.20,
            status: 'active',
            notes: 'Regular trader'
        },
        {
            id: 3,
            name: 'John',
            phone: '243070871',
            email: 'john@example.com',
            location: 'Kumasi',
            top: 3000.12,
            down: 166.21,
            base: 1028,
            pounds: 387.11,
            karat: 18.05,
            value: 113876.50,
            status: 'active',
            notes: 'New account'
        }
    ];
    
    // Load sample data
    accountsTable.rows.add(sampleAccounts).draw();
    
    // Event handlers
    $('#add-account').click(function() {
        $('#accountId').val('');
        $('#modalTitle').text('Add New Account');
        $('#accountForm')[0].reset();
        $('#accountForm').removeClass('was-validated');
        $('#accountModal').modal('show');
    });
    
    $('#accountTop, #accountDown, #accountBase').on('input', calculateAccountValues);
    
    $('#saveAccount').click(saveAccount);
    
    $('#accounts-table')
        .on('click', '.edit-account', editAccount)
        .on('click', '.delete-account', deleteAccount);
    
    $('#export-accounts').click(exportToExcel);
    $('#print-accounts').click(function() { window.print(); });
    
    // Initialize chart after a short delay
    setTimeout(updateChart, 200);
});

// Helper functions (defined inside document.ready but referenced by name)
function calculateAccountValues() {
    const top = parseFloat($('#accountTop').val()) || 0;
    const down = parseFloat($('#accountDown').val()) || 0;
    const base = parseInt($('#accountBase').val()) || 0;
    
    if (top && down && base) {
        const pounds = Math.floor(top / 7.75 * 100) / 100;
        const karat = Math.floor(top / down * 100) / 100;
        const value = (base * pounds * karat) / 23;
        
        $('#accountPounds').val(pounds.toFixed(2));
        $('#accountKarat').val(karat.toFixed(2));
        $('#accountValue').val(value.toFixed(2));
    } else {
        $('#accountPounds').val('');
        $('#accountKarat').val('');
        $('#accountValue').val('');
    }
}

function saveAccount() {
    const form = $('#accountForm')[0];
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const accountData = {
        id: $('#accountId').val() || Date.now(),
        name: $('#accountName').val(),
        phone: $('#accountPhone').val(),
        email: $('#accountEmail').val(),
        location: $('#accountLocation').val(),
        top: parseFloat($('#accountTop').val()),
        down: parseFloat($('#accountDown').val()),
        base: parseInt($('#accountBase').val()),
        pounds: parseFloat($('#accountPounds').val()),
        karat: parseFloat($('#accountKarat').val()),
        value: parseFloat($('#accountValue').val()),
        status: $('#accountStatus').val(),
        notes: $('#accountNotes').val()
    };

    if ($('#accountId').val()) {
        const row = accountsTable.row(`[data-id="${$('#accountId').val()}"]`);
        row.data(accountData).draw();
    } else {
        accountsTable.row.add(accountData).draw();
    }

    updateSummary();
    $('#accountModal').modal('hide');
}

function editAccount() {
    const accountId = $(this).data('id');
    const accountData = accountsTable.row($(this).closest('tr')).data();
    
    $('#accountId').val(accountData.id);
    $('#modalTitle').text('Edit Account');
    $('#accountName').val(accountData.name);
    $('#accountPhone').val(accountData.phone);
    $('#accountEmail').val(accountData.email || '');
    $('#accountLocation').val(accountData.location || '');
    $('#accountTop').val(accountData.top);
    $('#accountDown').val(accountData.down);
    $('#accountBase').val(accountData.base);
    $('#accountPounds').val(accountData.pounds);
    $('#accountKarat').val(accountData.karat);
    $('#accountValue').val(accountData.value);
    $('#accountStatus').val(accountData.status);
    $('#accountNotes').val(accountData.notes || '');
    
    $('#accountForm').removeClass('was-validated');
    $('#accountModal').modal('show');
}

function deleteAccount() {
    const accountId = $(this).data('id');
    
    if (confirm('Are you sure you want to delete this account?')) {
        accountsTable.row($(this).closest('tr')).remove().draw();
        updateSummary();
    }
}

function updateSummary() {
    if (!accountsTable) return;
    
    const data = accountsTable.rows().data().toArray();
    const totalAccounts = data.length;
    const activeAccounts = data.filter(a => a.status === 'active').length;
    const totalValue = data.reduce((sum, a) => sum + a.value, 0);
    
    $('#total-accounts').text(totalAccounts);
    $('#active-accounts').text(activeAccounts);
    $('#total-gold-value').text('GHS ' + totalValue.toFixed(2));
    
    updateChart();
}

function updateChart() {
    if (!accountsTable) return;
    
    const ctx = document.getElementById('accountsChart').getContext('2d');
    const data = accountsTable.rows().data().toArray();
    
    const chartData = data
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(a => ({
            name: a.name,
            value: a.value
        }));
    
    if (accountsChart) {
        accountsChart.destroy();
    }
    
    accountsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(a => a.name),
            datasets: [{
                label: 'Gold Value (GHS)',
                data: chartData.map(a => a.value),
                backgroundColor: 'rgba(212, 175, 55, 0.6)',
                borderColor: 'rgba(212, 175, 55, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'GHS ' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Value: GHS ' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function exportToExcel() {
    if (!accountsTable) return;
    
    const data = accountsTable.rows().data().toArray();
    const wsData = [
        ['ID', 'Name', 'Phone', 'Email', 'Location', 'TOP', 'DOWN', 'BASE', 'POUNDS', 'KARAT', 'VALUE (GHS)', 'Status', 'Notes'],
        ...data.map(a => [
            a.id,
            a.name,
            a.phone,
            a.email || '',
            a.location || '',
            a.top,
            a.down,
            a.base,
            a.pounds,
            a.karat,
            a.value.toFixed(2),
            a.status.charAt(0).toUpperCase() + a.status.slice(1),
            a.notes || ''
        ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Accounts");
    XLSX.writeFile(wb, `Brokerage_Accounts_${new Date().toISOString().split('T')[0]}.xlsx`);
}