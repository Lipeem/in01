const conversations = {
    'Alice': [
        { text: 'Olá! Bem-vindo ao chat com Alice.', sender: 'sender' },
        { text: 'Como você está?', sender: 'sender' },
        { text: 'Estou bem, obrigado!', sender: 'user' },
        { text: 'Que bom ouvir isso.', sender: 'sender' },
        { text: 'Até logo!', sender: 'user' }
    ],
    'Bob': [
        { text: 'Oi! Aqui é o Bob.', sender: 'sender' },
        { text: 'E aí, Bob!', sender: 'user' },
        { text: 'Vamos conversar mais tarde?', sender: 'sender' },
        { text: 'Claro, até mais!', sender: 'user' }
    ]
};

const conversationList = document.getElementById('conversationList');
const messagesContainer = document.getElementById('messages');
const nextButton = document.getElementById('nextButton');

let current = null;
const indexes = {};

function loadConversations() {
    for (const name in conversations) {
        const item = document.createElement('div');
        item.classList.add('conversation-item');
        item.textContent = name;
        item.addEventListener('click', () => selectConversation(name));
        conversationList.appendChild(item);
    }
}

function selectConversation(name) {
    current = name;
    if (!indexes[name]) {
        indexes[name] = 0;
    }
    messagesContainer.innerHTML = '';
    nextButton.disabled = false;
    showNextMessage();
}

function showNextMessage() {
    if (!current) return;
    const conv = conversations[current];
    const idx = indexes[current];
    if (idx < conv.length) {
        const msg = conv[idx];
        const div = document.createElement('div');
        div.classList.add('message', msg.sender);
        div.textContent = msg.text;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        indexes[current]++;
        if (indexes[current] === conv.length) {
            nextButton.disabled = true;
        }
    }
}

nextButton.addEventListener('click', showNextMessage);

loadConversations();
