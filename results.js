// results.js - Academic results section functionality
let resultsChart = null;

function initResultsSection() {
    const semesterSelect = document.getElementById('semesterSelect');
    const gradeAppealForm = document.getElementById('gradeAppealForm');
    const cancelAppeal = document.getElementById('cancelAppeal');
    const appealForm = document.getElementById('appealForm');
    
    // Initialize semester filter
    if (semesterSelect) {
        semesterSelect.addEventListener('change', loadResultsData);
    }
    
    if (cancelAppeal) {
        cancelAppeal.addEventListener('click', function() {
            gradeAppealForm.style.display = 'none';
        });
    }
    
    if (appealForm) {
        appealForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            formData.append('student_id', window.dashboardData.profile.id);
            
            fetch('php/request_grade_appeal.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Appeal submitted successfully!');
                    gradeAppealForm.style.display = 'none';
                    this.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while submitting appeal');
            });
        });
    }
}

function initResultsData(resultsData) {
    // Initialize chart
    initResultsChart(resultsData);
    
    // Load initial data
    loadResultsData();
}

function initResultsChart(data) {
    const ctx = document.getElementById('gpaChart').getContext('2d');
    
    // Group by semester
    const bySemester = {};
    data.forEach(record => {
        if (!bySemester[record.semester]) {
            bySemester[record.semester] = [];
        }
        bySemester[record.semester].push(record);
    });
    
    // Prepare chart data
    const semesters = Object.keys(bySemester).sort();
    const gpaData = semesters.map(sem => {
        const semesterRecords = bySemester[sem];
        const semesterGPA = semesterRecords.reduce((sum, record) => sum + record.gpa, 0) / semesterRecords.length;
        return parseFloat(semesterGPA.toFixed(2));
    });
    
    if (resultsChart) {
        resultsChart.destroy();
    }
    
    resultsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: semesters.map(sem => `Semester ${sem}`),
            datasets: [{
                label: 'GPA by Semester',
                data: gpaData,
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 4
                }
            }
        }
    });
}

function loadResultsData() {
    const semester = document.getElementById('semesterSelect').value;
    
    fetch(`php/get_results.php?student_id=${window.dashboardData.profile.id}&semester=${semester}`)
        .then(response => response.json())
        .then(data => {
            const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
            
            if (data.length === 0) {
                resultsTable.innerHTML = '<tr><td colspan="5" class="empty-message">No results found for selected semester.</td></tr>';
                return;
            }
            
            resultsTable.innerHTML = '';
            
            data.forEach(result => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${result.semester}</td>
                    <td>${result.subject}</td>
                    <td>${result.credits}</td>
                    <td>${result.grade}</td>
                    <td>${result.points.toFixed(2)}</td>
                `;
                
                row.addEventListener('click', () => {
                    document.getElementById('appealRecordId').value = result.id;
                    document.getElementById('appealSubject').value = result.subject;
                    document.getElementById('appealSemester').value = `Semester ${result.semester}`;
                    document.getElementById('appealCurrentGrade').value = result.grade;
                    
                    document.getElementById('gradeAppealForm').style.display = 'block';
                    window.scrollTo(0, document.getElementById('gradeAppealForm').offsetTop);
                });
                
                resultsTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading results:', error);
        });
}