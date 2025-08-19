document.addEventListener('DOMContentLoaded', function() {
    // Delete Category Confirmation
    const categoryDeleteButtons = document.querySelectorAll('.delete-category');
    categoryDeleteButtons.forEach(button => {
        // Remove any existing click listeners
        button.removeEventListener('click', handleCategoryDelete);
        // Add new click listener
        button.addEventListener('click', handleCategoryDelete);
    });

    // Handle Acronym Deletion
    const deleteButtons = document.querySelectorAll('.delete-acronym');
    deleteButtons.forEach(button => {
        // Remove any existing click listeners
        button.removeEventListener('click', handleAcronymDelete);
        // Add new click listener
        button.addEventListener('click', handleAcronymDelete);
    });

    // Optional: Add hover effect to dashboard cards
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('shadow-lg');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('shadow-lg');
        });
    });
}); 

// Handler function for category deletion
async function handleCategoryDelete() {
    const categoryId = this.dataset.id;
    const categoryName = this.dataset.name;
    const adminPath = this.dataset.adminPath || 'secure_dashboard_85490gtu4rgj';
    
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`)) {
        try {
            const response = await fetch(`/${adminPath}/categories/delete/${categoryId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                // Remove the row from the table
                this.closest('tr').remove();
                alert(`Category "${categoryName}" has been deleted.`);
            } else {
                throw new Error(data.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Failed to delete category. Please try again.');
        }
    }
}

// Handler function for acronym deletion
async function handleAcronymDelete() {
    const acronymId = this.dataset.id;
    const shortForm = this.dataset.shortform;
    const adminPath = this.dataset.adminPath || 'secure_dashboard_85490gtu4rgj';

    if (confirm(`Are you sure you want to delete the acronym: ${shortForm}?`)) {
        try {
            const response = await fetch(`/${adminPath}/acronyms/delete/${acronymId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Remove the row from the table
                this.closest('tr').remove();
                alert('Acronym deleted successfully');
            } else {
                throw new Error(data.message || 'Failed to delete acronym');
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            alert(error.message || 'An error occurred while trying to delete the acronym.');
        }
    }
} 

