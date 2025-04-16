// profile.js - Profile section functionality
function initProfileSection() {
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelProfileEdit = document.getElementById('cancelProfileEdit');
    const profileForm = document.getElementById('profileForm');
    const formActions = document.querySelector('#profileForm .form-actions');
    const inputs = profileForm.querySelectorAll('input');
    
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Enable editing
            inputs.forEach(input => {
                if (input.id !== 'profileEnrollment') { // Don't allow editing enrollment no
                    input.readOnly = false;
                }
            });
            
            // Show form actions
            formActions.style.display = 'flex';
            
            // Hide edit button
            this.style.display = 'none';
        });
    }
    
    if (cancelProfileEdit) {
        cancelProfileEdit.addEventListener('click', function() {
            // Disable editing
            inputs.forEach(input => {
                input.readOnly = true;
            });
            
            // Hide form actions
            formActions.style.display = 'none';
            
            // Show edit button
            editProfileBtn.style.display = 'block';
            
            // Reset form values
            if (window.dashboardData && window.dashboardData.profile) {
                updateProfileSummary(window.dashboardData.profile);
            }
        });
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            fetch('php/update_profile.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Profile updated successfully!');
                    
                    // Disable editing
                    inputs.forEach(input => {
                        input.readOnly = true;
                    });
                    
                    // Hide form actions
                    formActions.style.display = 'none';
                    
                    // Show edit button
                    editProfileBtn.style.display = 'block';
                    
                    // Update session data
                    if (data.name) {
                        document.getElementById('studentName').textContent = data.name;
                    }
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating profile');
            });
        });
    }
}