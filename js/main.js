let game;
let chat;
let currentUser = {
    nickname: '',
    id: null
};

// 初始化函数
function init() {
    game = new Game();
    chat = new Chat();
    checkNickname();
    initFirebase();
}

// 检查昵称
function checkNickname() {
    const savedNickname = localStorage.getItem('nickname');
    if (!savedNickname) {
        showNicknameModal();
    } else {
        currentUser.nickname = savedNickname;
        currentUser.id = localStorage.getItem('userId') || generateUserId();
        updateUserInfo();
    }
}

// 显示昵称设置弹窗
function showNicknameModal() {
    const modal = document.getElementById('nickname-modal');
    modal.style.display = 'block';
}

// 设置昵称
function setNickname() {
    const input = document.getElementById('nickname-input');
    const nickname = input.value.trim();
    
    if (nickname) {
        currentUser.nickname = nickname;
        currentUser.id = currentUser.id || generateUserId();
        
        localStorage.setItem('nickname', nickname);
        localStorage.setItem('userId', currentUser.id);
        
        document.getElementById('nickname-modal').style.display = 'none';
        updateUserInfo();
    }
}

// 更新用户信息显示
function updateUserInfo() {
    const userInfo = document.getElementById('current-user');
    if (userInfo) {
        userInfo.textContent = `当前用户：${currentUser.nickname}`;
    }
}

// 生成用户ID
function generateUserId() {
    return Math.random().toString(36).substr(2, 9);
}

// 初始化Firebase实时数据库监听
function initFirebase() {
    // 监听在线用户
    database.ref('users').on('value', (snapshot) => {
        updateOnlineUsers(snapshot.val());
    });

    // 监听房间列表
    database.ref('rooms').on('value', (snapshot) => {
        updateRoomsList(snapshot.val());
    });

    // 更新用户在线状态
    const userRef = database.ref(`users/${currentUser.id}`);
    userRef.set({
        nickname: currentUser.nickname,
        lastActive: Date.now()
    });

    // 设置用户离线时自动清除
    userRef.onDisconnect().remove();

    // 定期更新在线状态
    setInterval(() => {
        userRef.update({
            lastActive: Date.now()
        });
    }, CONSTANTS.HEARTBEAT_INTERVAL);
}

// 更新在线用户列表
function updateOnlineUsers(users) {
    const usersList = document.getElementById('online-players');
    if (!usersList || !users) return;

    usersList.innerHTML = '';
    Object.entries(users).forEach(([id, user]) => {
        // 检查用户是否在线（最后活动时间在超时时间内）
        if (Date.now() - user.lastActive <= CONSTANTS.OFFLINE_TIMEOUT) {
            const div = document.createElement('div');
            div.className = 'player-item';
            div.innerHTML = `
                <span>${user.nickname}</span>
                <button onclick="inviteToGame('${id}')">邀请对战</button>
            `;
            usersList.appendChild(div);
        }
    });
}

// 邀请对战
function inviteToGame(userId) {
    const roomId = generateRoomId();
    database.ref(`rooms/${roomId}`).set({
        players: {
            [currentUser.id]: {
                nickname: currentUser.nickname,
                color: 'black'
            },
            [userId]: {
                nickname: users[userId].nickname,
                color: 'white'
            }
        },
        gameState: {
            board: game.board,
            currentPlayer: 'black',
            gameState: 'waiting'
        },
        created: Date.now()
    });

    joinRoom(roomId);
}

// 加入房间
function joinRoom(roomId) {
    game.roomId = roomId;
    game.gameState = 'playing';
    
    document.getElementById('lobby').classList.add('hidden');
    document.getElementById('game-room').classList.remove('hidden');
    
    // 监听房间状态
    database.ref(`rooms/${roomId}/gameState`).on('value', (snapshot) => {
        const gameState = snapshot.val();
        if (gameState) {
            game.board = gameState.board;
            game.currentPlayer = gameState.currentPlayer;
            game.gameState = gameState.gameState;
            game.drawBoard();
            game.updateGameInfo();
        }
    });
}

// 离开房间
function leaveRoom() {
    if (game.roomId) {
        database.ref(`rooms/${game.roomId}`).off();
        game.roomId = null;
    }
    
    game.resetGame();
    document.getElementById('game-room').classList.add('hidden');
    document.getElementById('lobby').classList.remove('hidden');
}

// 发送大厅消息
function sendLobbyMessage() {
    const input = document.getElementById('lobby-message');
    const content = input.value.trim();
    
    if (content && currentUser.nickname) {
        chat.sendLobbyMessage(currentUser.nickname, content);
        input.value = '';
    }
}

// 发送房间消息
function sendRoomMessage() {
    const input = document.getElementById('room-message');
    const content = input.value.trim();
    
    if (content && currentUser.nickname && game.roomId) {
        chat.sendRoomMessage(game.roomId, currentUser.nickname, content);
        input.value = '';
    }
}

// 生成房间ID
function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

// 页面加载完成后初始化
window.addEventListener('load', init);