// Global declarations
let incomeTable, expenseTable, incomeChart;

$(document).ready(function() {
    // Categories
    const incomeCategories = ['Gold Sales', 'Service Fees', 'Interest', 'Other Income'];
    const expenseCategories = ['Salaries', 'Rent', 'Utilities', 'Supplies', 'Transportation', 'Marketing', 'Other Expenses'];
    
    // Initialize DataTables - assign to global variables
    incomeTable = $('#income-table').DataTable({
        columns: [
            { data: 'id' },
            { data: 'date' },
            { data: 'description' },
            { 
                data: 'amount',
                render: function(data) {
                    return data.toFixed(2);
                }
            },
            { data: 'category' },
            { 
                data: null,
                render: function(_, __, row) {
                    return `
                        <button class="btn btn-sm btn-outline-primary edit-income" data-id="${row.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-income" data-id="${row.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                },
                orderable: false
            }
        ],
        dom: '<"top"f>rt<"bottom"lip><"clear">',
        responsive: true
    });
    
    expenseTable = $('#expense-table').DataTable({
        columns: [
            { data: 'id' },
            { data: 'date' },
            { data: 'description' },
            { 
                data: 'amount',
                render: function(data) {
                    return data.toFixed(2);
                }
            },
            { data: 'category' },
            { 
                data: null,
                render: function(_, __, row) {
                    return `
                        <button class="btn btn-sm btn-outline-primary edit-expense" data-id="${row.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${row.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                },
                orderable: false
            }
        ],
        dom: '<"top"f>rt<"bottom"lip><"clear">',
        responsive: true
    });
    
    // Sample data
    const sampleIncome = [
        { id: 1, date: '2023-06-01', description: 'Gold Sale - Customer A', amount: 4500.00, category: 'Gold Sales', notes: '' },
        { id: 2, date: '2023-06-05', description: 'Service Fee - Appraisal', amount: 150.00, category: 'Service Fees', notes: 'For gold appraisal' },
        { id: 3, date: '2023-06-10', description: 'Gold Sale - Customer B', amount: 3200.00, category: 'Gold Sales', notes: 'Bulk purchase' }
    ];
    
    const sampleExpense = [
        { id: 1, date: '2023-06-02', description: 'Office Rent', amount: 1200.00, category: 'Rent', notes: 'Monthly rent' },
        { id: 2, date: '2023-06-03', description: 'Staff Salaries', amount: 3500.00, category: 'Salaries', notes: 'June salaries' },
        { id: 3, date: '2023-06-08', description: 'Electricity Bill', amount: 250.00, category: 'Utilities', notes: '' }
    ];
    
    // Load sample data
    incomeTable.rows.add(sampleIncome).draw();
    expenseTable.rows.add(sampleExpense).draw();
    
    // Initialize with a small delay to ensure everything is ready
    setTimeout(() => {
        updateSummary();
        updateChart();
    }, 100);
    
    // ... rest of your event handlers and functions ...
});

// Define functions outside document.ready but with safety checks
function updateSummary() {
    if (!incomeTable || !expenseTable) return;
    
    const incomeTotal = incomeTable.rows().data().toArray().reduce((sum, r) => sum + r.amount, 0);
    const expenseTotal = expenseTable.rows().data().toArray().reduce((sum, r) => sum + r.amount, 0);
    const netProfit = incomeTotal - expenseTotal;
    
    $('#total-income').text('GHS ' + incomeTotal.toFixed(2));
    $('#total-expense').text('GHS ' + expenseTotal.toFixed(2));
    $('#net-profit').text('GHS ' + netProfit.toFixed(2));
    
    updateChart();
}

function updateChart() {
    if (!incomeTable || !expenseTable) return;
    
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Get actual data from tables
    const incomeData = incomeTable.rows().data().toArray();
    const expenseData = expenseTable.rows().data().toArray();
    
    // Group by month (simplified example)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeByMonth = months.map((_, i) => 
        incomeData.filter(r => new Date(r.date).getMonth() === i)
                 .reduce((sum, r) => sum + r.amount, 0)
    );
    const expenseByMonth = months.map((_, i) => 
        expenseData.filter(r => new Date(r.date).getMonth() === i)
                  .reduce((sum, r) => sum + r.amount, 0)
    );
    
    if (incomeChart) {
        incomeChart.destroy();
    }
    
    incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeByMonth,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseByMonth,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
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
                            return context.dataset.label + ': GHS ' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function exportToExcel() {
    if (!incomeTable || !expenseTable) return;
    
    // Prepare worksheets
    const incomeWsData = [
        ['ID', 'Date', 'Description', 'Amount (GHS)', 'Category', 'Notes'],
        ...incomeTable.rows().data().toArray().map(r => [
            r.id,
            r.date,
            r.description,
            r.amount.toFixed(2),
            r.category,
            r.notes || ''
        ])
    ];
    
    const expenseWsData = [
        ['ID', 'Date', 'Description', 'Amount (GHS)', 'Category', 'Notes'],
        ...expenseTable.rows().data().toArray().map(r => [
            r.id,
            r.date,
            r.description,
            r.amount.toFixed(2),
            r.category,
            r.notes || ''
        ])
    ];
    
    const summaryWsData = [
        ['Summary', 'Amount (GHS)'],
        ['Total Income', incomeTable.rows().data().toArray().reduce((sum, r) => sum + r.amount, 0).toFixed(2)],
        ['Total Expenses', expenseTable.rows().data().toArray().reduce((sum, r) => sum + r.amount, 0).toFixed(2)],
        ['Net Profit', (incomeTable.rows().data().toArray().reduce((sum, r) => sum + r.amount, 0) - 
                       expenseTable.rows().data().toArray().reduce((sum, r) => sum + r.amount, 0)).toFixed(2)]
    ];
    
    // Create workbook and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incomeWsData), "Income");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expenseWsData), "Expenses");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryWsData), "Summary");
    XLSX.writeFile(wb, `Income_Statement_${new Date().toISOString().split('T')[0]}.xlsx`);
}