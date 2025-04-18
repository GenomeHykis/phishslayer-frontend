

const content = document.getElementById('content');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');

let isAnswerLoading = false;
let answerSectionId = 0;

sendButton.addEventListener('click', () => handleSendMessage());
chatInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
})

function handleSendMessage() {
    // Get the user input and remove leading/tariling space
    const question = chatInput.value.trim();

    // Prevent sending empty message
    if (question === '' || isAnswerLoading) return;

    // Disable UI send button
    sendButton.classList.add('send-button-nonactive');

    addQuestionSection(question);
    chatInput.value = '';
}

function getAnswer(question) {
    fetch("https://phishslayer-backend.onrender.com/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: question
        })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                console.error('Invalid response:', data);
                isAnswerLoading = false;
                addAnswerSection("⚠️ Sorry, something went wrong. Please try again.");
                return;
            }

            const resultData = data.choices[0].message.content;
            isAnswerLoading = false;
            addAnswerSection(resultData);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            isAnswerLoading = false;
            addAnswerSection("⚠️ Network or server issue. Please try again later.");
        });
}

function addQuestionSection(message) {
    isAnswerLoading = true;
    // Create section element
    const sectionElement = document.createElement('section');
    sectionElement.className = 'question-section';
    sectionElement.textContent = message;

    content.appendChild(sectionElement);
    // Add answer section after added quesion section
    addAnswerSection(message)
    scrollToBottom();
}

function addAnswerSection(message) {
    if (isAnswerLoading) {
        // Increment answer section ID for tracking
        answerSectionId++;
        // Create and empty answer section with a loading animation
        const sectionElement = document.createElement('section');
        sectionElement.className = 'answer-section';
        sectionElement.innerHTML = getLoadingSvg();
        sectionElement.id = answerSectionId;

        content.appendChild(sectionElement);
        getAnswer(message);
    } else {
        // Fill in the answer once it's received
        const answerSectionElement = document.getElementById(answerSectionId);
        // Remove bold (**text**) and headings (###, ##, #)
        const sanitizedMessage = message
            .replace(/\*\*(.*?)\*\*/g, '$1')    // remove **bold**
            .replace(/#+\s*(.*)/g, '$1');       // remove headings

        answerSectionElement.textContent = sanitizedMessage;

    }
}

function getLoadingSvg() {
    return '<svg style="height: 25px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="40" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="100" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate></circle><circle fill="#4F6BFE" stroke="#4F6BFE" stroke-width="15" r="15" cx="160" cy="65"><animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate></circle></svg>';
}

function scrollToBottom() {
    content.scrollTo({
        top: content.scrollHeight,
        behavior: 'smooth'
    });
}