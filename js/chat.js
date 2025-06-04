class Chat {
    constructor() {
        this.lobbyMessages = [];
        this.roomMessages = {};
        this.initFirebase();
    }

    initFirebase() {
        // 监听大厅消息
        database.ref('lobby/messages').on('child_added', (snapshot) => {
            const message = snapshot.val();
            this.displayLobbyMessage(message);
        });

        // 监听房间消息
        database.ref('rooms').on('child_added', (snapshot) => {
            const roomId = snapshot.key;
            database.ref(`rooms/${roomId}/messages`).on('child_added', (msgSnapshot) => {
                const message = msgSnapshot.val();
                this.displayRoomMessage(roomId, message);
            });
        });
    }

    sendLobbyMessage(nickname, content) {
        const message = {
            nickname,
            content,
            timestamp: Date.now()
        };

        return database.ref('lobby/messages').push(message);
    }

    sendRoomMessage(roomId, nickname, content) {
        const message = {
            nickname,
            content,
            timestamp: Date.now()
        };

        return database.ref(`rooms/${roomId}/messages`).push(message);
    }

    displayLobbyMessage(message) {
        const chatDiv = document.getElementById('lobby-chat');
        const messageElement = this.createMessageElement(message);
        chatDiv.appendChild(messageElement);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    displayRoomMessage(roomId, message) {
        const chatDiv = document.getElementById('room-chat');
        if (!chatDiv) return;

        const messageElement = this.createMessageElement(message);
        chatDiv.appendChild(messageElement);
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = 'message';
        const time = new Date(message.timestamp).toLocaleTimeString();
        div.innerHTML = `<span class="time">[${time}]</span> <span class="nickname">${message.nickname}</span>: ${message.content}`;
        return div;
    }
}