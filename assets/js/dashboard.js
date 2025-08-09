document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);
    
    // Initialize chart
    const ctx = document.getElementById('goldChart').getContext('2d');
    const goldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Gold Value (GHS)',
                data: [850000, 920000, 1010000, 980000, 1050000, 1100000, 1150000, 1200000, 1180000, 1250000, 1300000, 1245678],
                backgroundColor: 'rgba(255, 215, 0, 0.2)',
                borderColor: 'rgba(255, 215, 0, 1)',
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
    
    // Simulate loading data
    setTimeout(() => {
        document.getElementById('total-gold-value').textContent = '1,245,678.00';
        document.getElementById('current-profit').textContent = '245,678.00';
        document.getElementById('active-customers').textContent = '38';
        document.getElementById('todays-transactions').textContent = '12';
    }, 1000);
});