// timetable.js - Timetable section functionality
function initTimetableSection() {
    const viewSelect = document.getElementById('timetableViewSelect');
    const exportBtn = document.getElementById('exportTimetableBtn');
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const classChangeForm = document.getElementById('classChangeForm');
    const cancelClassChange = document.getElementById('cancelClassChange');
    const classChangeRequestForm = document.getElementById('classChangeRequestForm');
    
    // Initialize view selector
    if (viewSelect) {
        viewSelect.addEventListener('change', function() {
            if (this.value === 'week') {
                document.getElementById('timetableWeekly').style.display = 'grid';
                document.getElementById('timetableDaily').style.display = 'none';
            } else {
                document.getElementById('timetableWeekly').style.display = 'none';
                document.getElementById('timetableDaily').style.display = 'block';
                loadDailyTimetable(0); // 0 = Monday
            }
        });
    }
    
    // Initialize export button
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTimetable);
    }
    
    // Initialize day navigation
    if (prevDayBtn) {
        prevDayBtn.addEventListener('click', function() {
            const currentDay = parseInt(document.getElementById('dailyTimetableBody').getAttribute('data-day')) || 0;
            loadDailyTimetable((currentDay - 1 + 5) % 5); // Ensure it stays between 0-4 (Mon-Fri)
        });
    }
    
    if (nextDayBtn) {
        nextDayBtn.addEventListener('click', function() {
            const currentDay = parseInt(document.getElementById('dailyTimetableBody').getAttribute('data-day')) || 0;
            loadDailyTimetable((currentDay + 1) % 5); // Ensure it stays between 0-4 (Mon-Fri)
        });
    }
    
    // Initialize class change form
    if (cancelClassChange) {
        cancelClassChange.addEventListener('click', function() {
            classChangeForm.style.display = 'none';
        });
    }
    
    if (classChangeRequestForm) {
        classChangeRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            formData.append('student_id', window.dashboardData.profile.id);
            
            fetch('php/request_class_change.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Class change request submitted successfully!');
                    classChangeForm.style.display = 'none';
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
    
    // Show/hide additional fields based on request type
    const requestTypeSelect = document.getElementById('classChangeRequest');
    if (requestTypeSelect) {
        requestTypeSelect.addEventListener('change', function() {
            document.getElementById('newTimeContainer').style.display = 'none';
            document.getElementById('newSubjectContainer').style.display = 'none';
            
            if (this.value === 'reschedule') {
                document.getElementById('newTimeContainer').style.display = 'block';
            } else if (this.value === 'change_subject') {
                document.getElementById('newSubjectContainer').style.display = 'block';
            }
        });
    }
}

function initTimetableData(timetableData) {
    // Group timetable by day
    const timetableByDay = {
        0: [], // Monday
        1: [], // Tuesday
        2: [], // Wednesday
        3: [], // Thursday
        4: []  // Friday
    };
    
    timetableData.forEach(item => {
        const dayIndex = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].indexOf(item.day.toLowerCase());
        if (dayIndex >= 0) {
            timetableByDay[dayIndex].push(item);
        }
    });
    
    // Store for later use
    window.timetableByDay = timetableByDay;
    
    // Load initial timetable
    loadWeeklyTimetable();
}

function loadWeeklyTimetable() {
    const timetableBody = document.getElementById('weeklyTimetableBody');
    timetableBody.innerHTML = '';
    
    // Create time slots (8am to 5pm, hourly)
    for (let hour = 8; hour <= 17; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'timetable-cell timetable-time';
        timeSlot.textContent = `${hour}:00 - ${hour+1}:00`;
        timetableBody.appendChild(timeSlot);
        
        // Add slots for each day
        for (let day = 0; day < 5; day++) {
            const daySlot = document.createElement('div');
            daySlot.className = 'timetable-slot';
            
            const dayClasses = window.timetableByDay[day].filter(cls => {
                const clsHour = parseInt(cls.time.split(':')[0]);
                return clsHour === hour;
            });
            
            if (dayClasses.length > 0) {
                const cls = dayClasses[0]; // Assuming one class per hour
                daySlot.innerHTML = `
                    <div class="timetable-subject">${cls.subject}</div>
                    <div class="timetable-room">${cls.room}</div>
                `;
                
                daySlot.addEventListener('click', () => {
                    document.getElementById('classChangeId').value = cls.id;
                    document.getElementById('classChangeDay').value = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][day];
                    document.getElementById('classChangeTime').value = cls.time;
                    document.getElementById('classChangeSubject').value = cls.subject;
                    
                    document.getElementById('classChangeForm').style.display = 'block';
                    window.scrollTo(0, document.getElementById('classChangeForm').offsetTop);
                });
            } else {
                daySlot.className += ' empty';
                daySlot.textContent = 'No class';
            }
            
            timetableBody.appendChild(daySlot);
        }
    }
}

function loadDailyTimetable(dayIndex) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timetableBody = document.getElementById('dailyTimetableBody');
    timetableBody.innerHTML = '';
    timetableBody.setAttribute('data-day', dayIndex);
    
    document.getElementById('currentDayDisplay').textContent = dayNames[dayIndex];
    
    const dayClasses = window.timetableByDay[dayIndex];
    
    if (dayClasses.length === 0) {
        timetableBody.innerHTML = '<div class="empty-message">No classes scheduled for this day.</div>';
        return;
    }
    
    // Sort classes by time
    dayClasses.sort((a, b) => a.time.localeCompare(b.time));
    
    dayClasses.forEach(cls => {
        const classSlot = document.createElement('div');
        classSlot.className = 'daily-class';
        classSlot.innerHTML = `
            <div class="class-time">${cls.time}</div>
            <div class="class-details">
                <div class="class-subject">${cls.subject}</div>
                <div class="class-room">${cls.room}</div>
            </div>
            <button class="btn-request-change" data-id="${cls.id}">Request Change</button>
        `;
        
        classSlot.querySelector('.btn-request-change').addEventListener('click', (e) => {
            e.stopPropagation();
            
            document.getElementById('classChangeId').value = cls.id;
            document.getElementById('classChangeDay').value = dayNames[dayIndex];
            document.getElementById('classChangeTime').value = cls.time;
            document.getElementById('classChangeSubject').value = cls.subject;
            
            document.getElementById('classChangeForm').style.display = 'block';
            window.scrollTo(0, document.getElementById('classChangeForm').offsetTop);
        });
        
        timetableBody.appendChild(classSlot);
    });
}

function exportTimetable() {
    // In a real implementation, this would generate a PDF or CSV
    alert('Timetable exported successfully!');
    // Actual implementation would use a library like jsPDF or window.print()
}