// Initial Step: Get Registration Number
document.getElementById('next-btn').addEventListener('click', async () => {
    const regno = document.getElementById('regno-input').value.trim();
    if (!regno) {
        alert('Please enter a valid Registration Number');
        return;
    }

    // Hide regno form and show chat box
    document.getElementById('regno-form').style.display = 'none';
    document.getElementById('chat-box-container').style.display = 'flex';

    // Display loading spinner
    showLoadingSpinner(true);

    // Send the regno to the backend to get the student's marks and initiate conversation
    const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            regno: regno,
            user: 'get marks'  // Initial input to get marks
        })
    });

    const result = await response.json();
    const marksData = result.msg;

    // Remove loading spinner and display AI's response
    showLoadingSpinner(false);

    // Send AI's response (marks) to the chat
    addMessage(marksData, 'bot');
});

// Step 2: Chat with the bot
document.getElementById('send-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;

    // Add user's message to the chat box
    addMessage(userInput, 'user');

    // Clear the input field
    document.getElementById('user-input').value = '';

    // Display loading spinner
    showLoadingSpinner(true);

    // Send user input to the backend
    const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            regno: document.getElementById('regno-input').value.trim(),
            user: userInput
        })
    });

    const result = await response.json();

    // Remove loading spinner and add AI's response to the chat box
    showLoadingSpinner(false);

    // Add AI's response to the chat box
    addMessage(result.msg, 'bot');
});

// Function to show/hide the loading spinner
function showLoadingSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) {
        spinner.style.display = 'block';  // Show loading spinner
    } else {
        spinner.style.display = 'none';   // Hide loading spinner
    }
}

// Function to add messages to the chat box
function addMessage(message, sender) {
    const formattedMessage = message
        .replace(/\n/g, '<br>')   // Replace all newlines with <br> tags
        .replace(/\*/g, '');      // Remove all stars

    const chatBox = document.getElementById('chat-box');
    console.log(formattedMessage);  // Log the formatted message

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.innerHTML = formattedMessage;  // Use innerHTML to allow <br> to be rendered

    console.log(messageElement);  // Log the message element with <br> tags
    chatBox.appendChild(messageElement);

    // Scroll to the bottom to show the latest message, whether it's from the user or bot
    chatBox.scrollTop = chatBox.scrollHeight;
}
