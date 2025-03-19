document.addEventListener('DOMContentLoaded', () => {
    // Get user info from localStorage
    const userName = localStorage.getItem('streamUserName');
    const userId = localStorage.getItem('streamUserId');
    const eventId = localStorage.getItem('streamEventId');
    
    // Check if we have necessary info
    if (!userName || !userId || !eventId) {
        alert('Missing user information. Redirecting to login page.');
        window.location.href = '/';
        return;
    }
    
    // Set user name in the header
    const currentUserNameElement = document.getElementById('currentUserName');
    currentUserNameElement.textContent = userName;
    
    // Set event title
    const eventTitle = document.getElementById('eventTitle');
    eventTitle.textContent = `Event Stream: ${eventId}`;
    
    // Leave button functionality
    const leaveBtn = document.getElementById('leaveBtn');
    leaveBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to leave this event?')) {
            // Tell server user is leaving
            if (socket) {
                socket.emit('leaveEvent', { eventId, userId, userName });
            }
            
            // Clear local storage and go back to login
            localStorage.removeItem('streamUserName');
            localStorage.removeItem('streamUserId');
            localStorage.removeItem('streamEventId');
            
            window.location.href = '/';
        }
    });
    
    // Chat functionality
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const viewerCount = document.getElementById('viewerCount');
    
    // Connect to Socket.io
    const socket = io();
    
    // Join the event room
    socket.emit('joinEvent', { userName, userId, eventId });
    
    // Send chat message
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        if (message) {
            socket.emit('chatMessage', {
                eventId,
                userId,
                userName,
                message
            });
            
            messageInput.value = '';
            messageInput.focus();
        }
    });
    
    // Listen for new messages
    socket.on('newMessage', (data) => {
        addMessageToChat(data);
    });
    
    // User joined notification
    socket.on('userJoined', (data) => {
        // Update viewer count
        viewerCount.textContent = data.participants.length;
        
        // Add system message
        const systemMessage = document.createElement('div');
        systemMessage.className = 'system-message';
        systemMessage.textContent = data.message;
        chatMessages.appendChild(systemMessage);
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
    
    // User left notification
    socket.on('userLeft', (data) => {
        // Update viewer count
        viewerCount.textContent = data.participants.length;
        
        // Add system message
        const systemMessage = document.createElement('div');
        systemMessage.className = 'system-message';
        systemMessage.textContent = data.message;
        chatMessages.appendChild(systemMessage);
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
    
    // Function to add a message to the chat
    function addMessageToChat(data) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const usernameElement = document.createElement('span');
        usernameElement.className = 'message-username';
        usernameElement.textContent = data.userName;
        
        const timeElement = document.createElement('span');
        timeElement.className = 'message-time';
        const messageTime = new Date(data.timestamp);
        timeElement.textContent = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = data.message;
        
        messageHeader.appendChild(usernameElement);
        messageHeader.appendChild(timeElement);
        
        messageElement.appendChild(messageHeader);
        messageElement.appendChild(messageContent);
        
        chatMessages.appendChild(messageElement);
        
        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Handle page unload/close
    window.addEventListener('beforeunload', () => {
        if (socket) {
            socket.emit('leaveEvent', { eventId, userId, userName });
        }
    });
});