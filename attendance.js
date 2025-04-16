// attendance.js - Attendance section functionality
function initAttendanceSection() {
    const monthFilter = document.getElementById('attendanceMonthFilter');
    const subjectFilter = document.getElementById('attendanceSubjectFilter');
    const attendanceRequestForm = document.getElementById('attendanceRequestForm');
    const cancelAttendanceRequest = document.getElementById('cancelAttendanceRequest');
    const attendanceCorrectionForm = document.getElementById('attendanceCorrectionForm');
    
    // Initialize filters
    if (monthFilter) {
        monthFilter.addEventListener('change', loadAttendanceData);
    }
    
    if (subjectFilter) {
        subjectFilter.addEventListener('change', loadAttendanceData);
    }
    
    if (cancelAttendanceRequest) {
        cancelAttendanceRequest.addEventListener('click', function() {
            attendanceRequestForm.style.display = 'none';
        });
    }
    
    if (attendanceCorrectionForm) {
        attendanceCorrectionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            formData.append('student_id', window.dashboardData.profile.id);
            
            fetch('php/request_attendance_correction.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Correction request submitted successfully!');
                    attendanceRequestForm.style.display = 'none';
                    this.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while submitting request');
            });
        });
    }
}

function initAttendanceData(attendanceData) {
    // Update attendance summary
    updateAttendanceSummary(attendanceData);
    
    // Populate subject filter
    const subjectFilter = document.getElementById('attendanceSubjectFilter');
    if (subjectFilter) {
        // Get unique subjects from attendance data
        const subjects = [...new Set(attendanceData.records.map(record => record.subject))];
        
        // Clear existing options (keeping "All Subjects")
        while (subjectFilter.options.length > 1) {
            subjectFilter.remove(1);
        }
        
        // Add subject options
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectFilter.appendChild(option);
        });
    }
}

function updateAttendanceSummary(data) {
    const attendanceCircle = document.getElementById('attendanceCircle');
    const percentageText = attendanceCircle.querySelector('.percentage');
    const circleFill = attendanceCircle.querySelector('.circle-fill');
    
    // Update percentage text
    percentageText.textContent = `${data.percentage}%`;
    
    // Update circle progress
    circleFill.setAttribute('stroke-dasharray', `${data.percentage}, 100`);
    
    // Update numbers
    document.getElementById('presentDays').textContent = data.present;
    document.getElementById('absentDays').textContent = data.total - data.present;
    document.getElementById('totalDays').textContent = data.total;
}

function loadAttendanceData() {
    const monthFilter = document.getElementById('attendanceMonthFilter').value;
    const subjectFilter = document.getElementById('attendanceSubjectFilter').value;
    
    fetch(`php/get_attendance.php?student_id=${window.dashboardData.profile.id}&month=${monthFilter}&subject=${subjectFilter}`)
        .then(response => response.json())
        .then(data => {
            const attendanceTable = document.getElementById('attendanceTable').querySelector('tbody');
            
            if (data.length === 0) {
                attendanceTable.innerHTML = '<tr><td colspan="5" class="empty-message">No attendance records found.</td></tr>';
                return;
            }
            
            attendanceTable.innerHTML = '';
            
            data.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(record.date).toLocaleDateString()}</td>
                    <td>${new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                    <td>${record.subject}</td>
                    <td><span class="status ${record.status}">${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span></td>
                    <td><button class="btn-request" data-id="${record.id}">Request Correction</button></td>
                `;
                
                attendanceTable.appendChild(row);
            });
            
            // Add event listeners to request buttons
            document.querySelectorAll('.btn-request').forEach(btn => {
                btn.addEventListener('click', function() {
                    const recordId = this.getAttribute('data-id');
                    const record = data.find(r => r.id == recordId);
                    
                    if (record) {
                        document.getElementById('attendanceRecordId').value = record.id;
                        document.getElementById('attendanceCorrectionDate').value = new Date(record.date).toLocaleDateString();
                        document.getElementById('attendanceCorrectionSubject').value = record.subject;
                        document.getElementById('attendanceCorrectionStatus').value = record.status.charAt(0).toUpperCase() + record.status.slice(1);
                        
                        document.getElementById('attendanceRequestForm').style.display = 'block';
                        window.scrollTo(0, document.getElementById('attendanceRequestForm').offsetTop);
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error loading attendance:', error);
        });
}