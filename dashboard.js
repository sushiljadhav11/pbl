// dashboard.js - Updated navigation handling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize section navigation
    setupSectionNavigation();
    
    // Load initial data
    loadDashboardData();
});

function setupSectionNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section ID
            const sectionId = this.getAttribute('data-section');
            
            // Activate the clicked section
            activateSection(sectionId);
            
            // Update browser history (optional)
            history.pushState(null, null, `#${sectionId}`);
        });
    });
    
    // Check URL hash on page load
    const initialSection = window.location.hash.substring(1) || 'profile';
    activateSection(initialSection);
}

function activateSection(sectionId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Remove active class from all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Find the clicked nav link and add active class
    const activeLink = document.querySelector(`.nav-menu a[data-section="${sectionId}"]`);
    if (activeLink) {
        activeLink.parentElement.classList.add('active');
    }
    
    // Find the target section and add active class
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active-section');
        
        // Update dashboard title
        document.getElementById('dashboardTitle').textContent = 
            activeLink ? activeLink.textContent.replace(/<[^>]*>/g, '').trim() : sectionId;
        
        // Scroll to the section smoothly
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Load section data if needed
        loadSectionData(sectionId);
    }
}