// achievements.js - Achievements section functionality
function initAchievementsSection() {
    const addAchievementBtn = document.getElementById('addAchievementBtn');
    const achievementFormContainer = document.getElementById('achievementFormContainer');
    const cancelAchievement = document.getElementById('cancelAchievement');
    const achievementForm = document.getElementById('achievementForm');
    
    if (addAchievementBtn) {
        addAchievementBtn.addEventListener('click', function() {
            achievementFormContainer.style.display = 'block';
            window.scrollTo(0, achievementFormContainer.offsetTop);
        });
    }
    
    if (cancelAchievement) {
        cancelAchievement.addEventListener('click', function() {
            achievementFormContainer.style.display = 'none';
            achievementForm.reset();
        });
    }
    
    if (achievementForm) {
        achievementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            formData.append('student_id', window.dashboardData.profile.id);
            
            fetch('php/add_achievement.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Achievement added successfully!');
                    achievementForm.reset();
                    achievementFormContainer.style.display = 'none';
                    loadAchievementsData();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while adding achievement');
            });
        });
    }
}

function loadAchievementsData() {
    fetch(`php/get_achievements.php?student_id=${window.dashboardData.profile.id}`)
        .then(response => response.json())
        .then(data => {
            const achievementsGrid = document.getElementById('achievementsGrid');
            
            if (data.length === 0) {
                achievementsGrid.innerHTML = '<p class="empty-message">No achievements recorded yet.</p>';
                return;
            }
            
            achievementsGrid.innerHTML = '';
            
            data.forEach(achievement => {
                const achievementCard = document.createElement('div');
                achievementCard.className = 'achievement-card';
                achievementCard.innerHTML = `
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-footer">
                        <span class="date">${new Date(achievement.date).toLocaleDateString()}</span>
                        <div class="achievement-actions">
                            <button class="btn-view" data-id="${achievement.id}">View</button>
                            <button class="btn-delete" data-id="${achievement.id}">Delete</button>
                        </div>
                    </div>
                `;
                
                achievementsGrid.appendChild(achievementCard);
            });
            
            // Add event listeners to action buttons
            document.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', viewAchievement);
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', deleteAchievement);
            });
        })
        .catch(error => {
            console.error('Error loading achievements:', error);
        });
}

function viewAchievement(e) {
    const achievementId = e.target.getAttribute('data-id');
    // Implement view functionality
    console.log('View achievement:', achievementId);
}

function deleteAchievement(e) {
    if (!confirm('Are you sure you want to delete this achievement?')) {
        return;
    }
    
    const achievementId = e.target.getAttribute('data-id');
    
    fetch(`php/delete_achievement.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: achievementId,
            student_id: window.dashboardData.profile.id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAchievementsData();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}