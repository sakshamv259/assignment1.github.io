document.addEventListener('DOMContentLoaded', function () {
    // Redirect if not logged in (check using 'username')
    if (!localStorage.getItem('username')) {
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html';
        return;
    }

    const chartCanvas = document.getElementById('visitorChart');
    if (!chartCanvas) {
        console.error('Error: visitorChart canvas element not found.');
        return;
    }

    fetch('public/data/statistics.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load statistics.json');
            }
            return response.json();
        })
        .then(data => {
            const ctx = chartCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.months,
                    datasets: [{
                        label: 'Monthly Visitors',
                        data: data.visitors,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: 'Website Visitor Statistics',
                            font: {
                                size: 18
                            }
                        }
                    }
                }
            });
        })
        .catch(err => {
            console.error('Error loading statistics:', err);
            alert('Unable to load statistics data. Please try again later.');
        });
});
