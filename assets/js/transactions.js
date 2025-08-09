// Global declarations
let transactionsTable;

$(document).ready(function() {
    // Initialize DataTable - assign to global variable
    transactionsTable = $('#transactions-table').DataTable({
        columns: [
            { data: 'id' },
            { data: 'date' },
            { data: 'type' },
            { data: 'name' },
            { data: 'top' },
            { data: 'down' },
            { data: 'base' },
            { data: 'pounds' },
            { data: 'karat' },
            { 
                data: 'value',
                render: function(data) {
                    return data.toFixed(2);
                }
            },
            { data: 'status' },
            { 
                data: null,
                render: function(_, __, row) {
                    return `
                        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${row.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${row.id}">
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
            // Use setTimeout to ensure table is fully initialized
            setTimeout(calculateTotals, 100);
        }
    });

    // Sample data
    const sampleData = [
        {
            id: 1,
            date: '2023-06-15',
            type: 'buy',
            name: 'Junior',
            top: 26.60,
            down: 1.49,
            base: 1075,
            pounds: 3.43,
            karat: 17.85,
            value: 1027,
            status: 'completed',
            notes: 'Initial purchase'
        },
        {
            id: 2,
            date: '2023-06-16',
            type: 'buy',
            name: 'Ema',
            top: 101.63,
            down: 5.62,
            base: 1075,
            pounds: 13.11,
            karat: 18.08,
            value: 3931,
            status: 'completed',
            notes: 'Bulk purchase'
        },
        {
            id: 3,
            date: '2023-06-18',
            type: 'sell',
            name: 'Gold Buyer Inc',
            top: 50.25,
            down: 2.75,
            base: 1080,
            pounds: 6.48,
            karat: 18.27,
            value: 2105,
            status: 'completed',
            notes: 'Regular customer'
        }
    ];

    // Load sample data
    transactionsTable.rows.add(sampleData).draw();

    // Event handlers
    $('#add-transaction').click(function() {
        $('#transactionId').val('');
        $('#modalTitle').text('Add New Transaction');
        $('#transactionForm')[0].reset();
        $('#transactionForm').removeClass('was-validated');
        $('#transactionModal').modal('show');
    });

    $('#transTop, #transDown, #transBase').on('input', calculateTransactionValues);
    $('#saveTransaction').click(saveTransaction);
    
    $('#transactions-table')
        .on('click', '.edit-btn', editTransaction)
        .on('click', '.delete-btn', deleteTransaction);
    
    $('#export-transactions').click(exportToExcel);
    $('#print-transactions').click(function() { window.print(); });
    
    // Initialize with a small delay
    setTimeout(calculateTotals, 200);
});

// Helper functions
function calculateTransactionValues() {
    const top = parseFloat($('#transTop').val()) || 0;
    const down = parseFloat($('#transDown').val()) || 0;
    const base = parseInt($('#transBase').val()) || 0;
    
    if (top && down && base) {
        const pounds = Math.floor(top / 7.75 * 100) / 100;
        const karat = Math.floor(top / down * 100) / 100;
        const value = Math.floor((base * pounds * karat) / 23);
        
        $('#transPounds').val(pounds.toFixed(2));
        $('#transKarat').val(karat.toFixed(2));
        $('#transValue').val(value.toFixed(2));
    } else {
        $('#transPounds').val('');
        $('#transKarat').val('');
        $('#transValue').val('');
    }
}

function saveTransaction() {
    const form = $('#transactionForm')[0];
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const transactionData = {
        id: $('#transactionId').val() || Date.now(),
        date: $('#transDate').val(),
        type: $('#transType').val(),
        name: $('#transName').val(),
        phone: $('#transPhone').val() || '',
        top: parseFloat($('#transTop').val()),
        down: parseFloat($('#transDown').val()),
        base: parseInt($('#transBase').val()),
        pounds: parseFloat($('#transPounds').val()),
        karat: parseFloat($('#transKarat').val()),
        value: parseFloat($('#transValue').val()),
        status: 'completed',
        notes: $('#transNotes').val() || ''
    };

    if ($('#transactionId').val()) {
        const row = transactionsTable.row(`[data-id="${$('#transactionId').val()}"]`);
        row.data(transactionData).draw();
    } else {
        transactionsTable.row.add(transactionData).draw();
    }

    calculateTotals();
    $('#transactionModal').modal('hide');
}

function editTransaction() {
    const transactionId = $(this).data('id');
    const transactionData = transactionsTable.row($(this).closest('tr')).data();
    
    $('#transactionId').val(transactionData.id);
    $('#modalTitle').text('Edit Transaction');
    $('#transDate').val(transactionData.date);
    $('#transType').val(transactionData.type);
    $('#transName').val(transactionData.name);
    $('#transPhone').val(transactionData.phone || '');
    $('#transTop').val(transactionData.top);
    $('#transDown').val(transactionData.down);
    $('#transBase').val(transactionData.base);
    $('#transPounds').val(transactionData.pounds);
    $('#transKarat').val(transactionData.karat);
    $('#transValue').val(transactionData.value);
    $('#transNotes').val(transactionData.notes || '');
    
    $('#transactionForm').removeClass('was-validated');
    $('#transactionModal').modal('show');
}

function deleteTransaction() {
    const transactionId = $(this).data('id');
    
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactionsTable.row($(this).closest('tr')).remove().draw();
        calculateTotals();
    }
}

function calculateTotals() {
    if (!transactionsTable) return;
    
    const data = transactionsTable.rows().data().toArray();
    
    // Buy totals
    const buyTransactions = data.filter(t => t.type === 'buy');
    const totalBuy = {
        top: buyTransactions.reduce((sum, t) => sum + t.top, 0),
        down: buyTransactions.reduce((sum, t) => sum + t.down, 0),
        base: buyTransactions.length ? buyTransactions[0].base : 0,
        pounds: buyTransactions.reduce((sum, t) => sum + t.pounds, 0),
        karat: buyTransactions.length ? buyTransactions.reduce((sum, t) => sum + t.karat, 0) / buyTransactions.length : 0,
        value: buyTransactions.reduce((sum, t) => sum + t.value, 0)
    };
    
    // Sell totals
    const sellTransactions = data.filter(t => t.type === 'sell');
    const totalSell = {
        top: sellTransactions.reduce((sum, t) => sum + t.top, 0),
        down: sellTransactions.reduce((sum, t) => sum + t.down, 0),
        base: sellTransactions.length ? sellTransactions[0].base : 0,
        pounds: sellTransactions.reduce((sum, t) => sum + t.pounds, 0),
        karat: sellTransactions.length ? sellTransactions.reduce((sum, t) => sum + t.karat, 0) / sellTransactions.length : 0,
        value: sellTransactions.reduce((sum, t) => sum + t.value, 0)
    };
    
    // Profit/Loss
    const profit = totalSell.value - totalBuy.value;
    
    // Update footer
    $('#total-top').text(totalBuy.top.toFixed(2));
    $('#total-down').text(totalBuy.down.toFixed(2));
    $('#total-base').text(totalBuy.base);
    $('#total-pounds').text(totalBuy.pounds.toFixed(2));
    $('#total-karat').text(totalBuy.karat.toFixed(2));
    $('#total-value').text(totalBuy.value.toFixed(2));
    
    $('#sell-top').text(totalSell.top.toFixed(2));
    $('#sell-down').text(totalSell.down.toFixed(2));
    $('#sell-base').text(totalSell.base);
    $('#sell-pounds').text(totalSell.pounds.toFixed(2));
    $('#sell-karat').text(totalSell.karat.toFixed(2));
    $('#sell-value').text(totalSell.value.toFixed(2));
    
    $('#profit-value').text(profit.toFixed(2));
    if (profit > 0) {
        $('#profit-value').addClass('text-success').removeClass('text-danger');
        $('#profit-status').html('<span class="badge bg-success">Profit</span>');
    } else if (profit < 0) {
        $('#profit-value').addClass('text-danger').removeClass('text-success');
        $('#profit-status').html('<span class="badge bg-danger">Loss</span>');
    } else {
        $('#profit-value').removeClass('text-success text-danger');
        $('#profit-status').html('<span class="badge bg-secondary">Break Even</span>');
    }
}

function exportToExcel() {
    if (!transactionsTable) return;
    
    const data = transactionsTable.rows().data().toArray();
    
    // Prepare worksheet
    const wsData = [
        ['ID', 'Date', 'Type', 'Name', 'TOP', 'DOWN', 'BASE', 'POUNDS', 'KARAT', 'VALUE', 'Status', 'Notes'],
        ...data.map(t => [
            t.id,
            t.date,
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            t.name,
            t.top.toFixed(2),
            t.down.toFixed(2),
            t.base,
            t.pounds.toFixed(2),
            t.karat.toFixed(2),
            t.value.toFixed(2),
            t.status.charAt(0).toUpperCase() + t.status.slice(1),
            t.notes || ''
        ])
    ];
    
    // Add totals
    wsData.push([]);
    wsData.push(['TOTAL BUY', '', '', '',
        $('#total-top').text(),
        $('#total-down').text(),
        $('#total-base').text(),
        $('#total-pounds').text(),
        $('#total-karat').text(),
        $('#total-value').text(),
        '', ''
    ]);
    wsData.push(['TOTAL SELL', '', '', '',
        $('#sell-top').text(),
        $('#sell-down').text(),
        $('#sell-base').text(),
        $('#sell-pounds').text(),
        $('#sell-karat').text(),
        $('#sell-value').text(),
        '', ''
    ]);
    wsData.push(['PROFIT/LOSS', '', '', '', '', '', '', '', '',
        $('#profit-value').text(),
        $('#profit-status').text(),
        ''
    ]);
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Gold_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
}