$(document).ready(function() {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    $('#current-date').text(today.toLocaleDateString('en-US', options));
    
    // Mobile sidebar toggle
    $('.sidebar-toggle').click(function() {
        $('.sidebar').toggleClass('active');
    });
    
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();
    
    // Print functionality
    $('.print-btn').click(function() {
        window.print();
    });
    
    // Initialize charts if they exist on the page
    if ($('#goldChart').length) {
        initGoldChart();
    }
});

// Initialize gold value chart
function initGoldChart() {
    const ctx = document.getElementById('goldChart').getContext('2d');
    const goldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Gold Value (GHS)',
                data: [850000, 920000, 1010000, 980000, 1050000, 1100000, 1150000, 1200000, 1180000, 1250000, 1300000, 1245678],
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                borderColor: 'rgba(212, 175, 55, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'GHS ' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return 'GHS ' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// AJAX function to save data to backend
function saveToBackend(endpoint, data, callback) {
    $.ajax({
        url: endpoint,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            if (callback) callback(response);
        },
        error: function(xhr, status, error) {
            console.error('Error saving data:', error);
            alert('Error saving data. Please try again.');
        }
    });
}

// Function to export data
function exportData(data, type = 'pdf') {
    // In a real app, this would call a backend endpoint to generate the export
    console.log(`Exporting data as ${type}:`, data);
    alert(`Export functionality would generate a ${type.toUpperCase()} file here`);
}