// Global declarations
let customersTable;
let customersChart;

// Define functions first (but they won't be called yet)
function updateSummary() {
    if (!customersTable) return; // Safety check
    const data = customersTable.rows().data().toArray();
    const totalCustomers = data.length;
    const activeCustomers = data.filter(c => c.status === 'active').length;
    
    // Count customer types
    const typeCount = { BB: 0, SB: 0, M: 0 };
    data.forEach(customer => {
        if (customer.type in typeCount) {
            typeCount[customer.type]++;
        }
    });
    
    $('#total-customers').text(totalCustomers);
    $('#active-customers').text(activeCustomers);
    $('#customer-types').text(`${typeCount.BB} BB, ${typeCount.SB} SB, ${typeCount.M} M`);
    
    updateChart();
}

function updateChart() {
    if (!customersTable) return; // Safety check
    const ctx = document.getElementById('customersChart').getContext('2d');
    const data = customersTable.rows().data().toArray();
    
    // Count customers by location
    const locationCount = {};
    data.forEach(customer => {
        locationCount[customer.location] = (locationCount[customer.location] || 0) + 1;
    });
    
    const locations = Object.keys(locationCount);
    const counts = Object.values(locationCount);
    
    if (customersChart) {
        customersChart.destroy();
    }
    
    customersChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: locations,
            datasets: [{
                data: counts,
                backgroundColor: [
                    'rgba(212, 175, 55, 0.6)',
                    'rgba(53, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function exportToExcel() {
    if (!customersTable) return; // Safety check
    const data = customersTable.rows().data().toArray();
    const wsData = [
        ['ID', 'Name', 'Type', 'Phone', 'Location', 'Status', 'Last Transaction', 'Total Value (GHS)', 'Notes'],
        ...data.map(c => [
            c.id,
            c.name,
            c.type,
            c.phone,
            c.location,
            c.status.charAt(0).toUpperCase() + c.status.slice(1),
            c.lastTransaction || 'N/A',
            c.totalValue?.toFixed(2) || '0.00',
            c.notes || ''
        ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `Customer_Database_${new Date().toISOString().split('T')[0]}.xlsx`);
}

$(document).ready(function() {
    // Initialize DataTable
    customersTable = $('#customers-table').DataTable({
        columns: [
            { data: 'id' },
            { data: 'name' },
            { 
                data: 'type',
                render: function(data) {
                    const typeMap = { 'BB': 'Big Buyer', 'SB': 'Small Buyer', 'M': 'Merchant' };
                    return typeMap[data] || data;
                }
            },
            { data: 'phone' },
            { data: 'location' },
            { data: 'lastTransaction', render: data => data || 'N/A' },
            { data: 'totalValue', render: data => data ? 'GHS ' + data.toFixed(2) : 'N/A' },
            { 
                data: 'status',
                render: function(data) {
                    const statusClass = {
                        active: 'badge bg-success',
                        inactive: 'badge bg-secondary',
                        prospect: 'badge bg-warning'
                    }[data] || 'badge bg-secondary';
                    return `<span class="${statusClass}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
                }
            },
            { 
                data: null,
                render: function(_, __, row) {
                    return `
                        <button class="btn btn-sm btn-outline-primary edit-customer" data-id="${row.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-customer" data-id="${row.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info view-customer" data-id="${row.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    `;
                },
                orderable: false
            }
        ],
        dom: '<"top"f>rt<"bottom"lip><"clear">',
        responsive: true,
        initComplete: updateSummary
    });

     // Add this after initializing the DataTable
     setTimeout(() => {
        updateChart();
    }, 500);
    // Sample data
    customersTable.rows.add([
        { id: 1, name: 'Tonny', type: 'BB', phone: '244546564', location: 'Tarkwa', lastTransaction: '2023-06-15', totalValue: 45200.00, status: 'active', notes: 'Regular buyer' },
        { id: 2, name: 'Mensah', phone: '244931981', type: 'BB', location: 'Tarkwa', lastTransaction: '2023-06-10', totalValue: 32150.00, status: 'active', notes: 'Bulk purchases' },
        { id: 3, name: 'Eshun', phone: '243070871', type: 'SB', location: 'Tarkwa', lastTransaction: '2023-06-05', totalValue: 8750.00, status: 'active', notes: 'Small transactions' },
        { id: 4, name: 'Special', phone: '242052967', type: 'M', location: 'Kumasi', lastTransaction: '2023-06-12', totalValue: 120450.00, status: 'active', notes: 'Major merchant' }
    ]).draw();

    // Event handlers
    $('#add-customer').click(() => {
        $('#customerId').val('');
        $('#modalTitle').text('Add New Customer');
        $('#customerForm')[0].reset();
        $('#customerForm').removeClass('was-validated');
        $('#customerModal').modal('show');
    });

    $('#saveCustomer').click(function() {
        const form = $('#customerForm')[0];
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const customerData = {
            id: $('#customerId').val() || Date.now(),
            name: $('#customerName').val(),
            type: $('#customerType').val(),
            phone: $('#customerPhone').val(),
            location: $('#customerLocation').val(),
            status: $('#customerStatus').val(),
            notes: $('#customerNotes').val(),
            lastTransaction: null,
            totalValue: 0
        };

        if ($('#customerId').val()) {
            const row = customersTable.row(`[data-id="${$('#customerId').val()}"]`);
            const existing = row.data();
            customerData.lastTransaction = existing.lastTransaction;
            customerData.totalValue = existing.totalValue;
            row.data(customerData).draw();
        } else {
            customersTable.row.add(customerData).draw();
        }
        updateSummary();
        $('#customerModal').modal('hide');
    });

    $('#customers-table')
        .on('click', '.edit-customer', function() {
            const customer = customersTable.row($(this).closest('tr')).data();
            $('#customerId').val(customer.id);
            $('#modalTitle').text('Edit Customer');
            $('#customerName').val(customer.name);
            $('#customerType').val(customer.type);
            $('#customerPhone').val(customer.phone);
            $('#customerLocation').val(customer.location);
            $('#customerStatus').val(customer.status);
            $('#customerNotes').val(customer.notes || '');
            $('#customerForm').removeClass('was-validated');
            $('#customerModal').modal('show');
        })
        .on('click', '.delete-customer', function() {
            if (confirm('Are you sure you want to delete this customer?')) {
                customersTable.row($(this).closest('tr')).remove().draw();
                updateSummary();
            }
        })
        .on('click', '.view-customer', function() {
            const customer = customersTable.row($(this).closest('tr')).data();
            alert(`Viewing customer: ${customer.name}\nType: ${customer.type}\nLocation: ${customer.location}\nStatus: ${customer.status}\nLast Transaction: ${customer.lastTransaction || 'N/A'}\nTotal Value: GHS ${customer.totalValue?.toFixed(2) || '0.00'}\nNotes: ${customer.notes || 'None'}`);
        });

    $('#export-customers').click(exportToExcel);
    $('#print-customers').click(() => window.print());
});