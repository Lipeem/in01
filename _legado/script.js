const messages = [
    { text: 'Olá! Bem-vindo ao chat.', sender: 'sender' },
    { text: 'Como você está hoje?', sender: 'sender' },
    { text: 'Estou ótimo, obrigado!', sender: 'user' },
    { text: 'Que bom saber. Podemos continuar nossa conversa.', sender: 'sender' },
    { text: 'Claro, até a próxima!', sender: 'user' }
];

let index = 0;
const messagesContainer = document.getElementById('messages');
const nextButton = document.getElementById('nextButton');

function showNextMessage() {
    if (index < messages.length) {
        const msg = messages[index];
        const div = document.createElement('div');
        div.classList.add('message', msg.sender);
        div.textContent = msg.text;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        index++;
        if (index === messages.length) {
            nextButton.disabled = true;
        }
    }
}

nextButton.addEventListener('click', showNextMessage);

// show first message immediately
showNextMessage();
