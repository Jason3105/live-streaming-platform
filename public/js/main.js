document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('eventForm');
    const eventCards = document.querySelectorAll('.event-card');
    
    // Handle event card click
    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.getAttribute('data-event-id');
            document.getElementById('eventId').value = eventId;
        });
    });
    
    // Handle form submission
    eventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const userName = document.getElementById('userName').value.trim();
        const userId = document.getElementById('userId').value.trim();
        const eventId = document.getElementById('eventId').value.trim();
        
        if (!userName || !userId || !eventId) {
            alert('Please fill in all fields');
            return;
        }
        
        // Store user info in localStorage to use in the stream page
        localStorage.setItem('streamUserName', userName);
        localStorage.setItem('streamUserId', userId);
        localStorage.setItem('streamEventId', eventId);
        
        // Redirect to the stream page
        window.location.href = '/stream.html';
    });
});