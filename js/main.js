let game;
let chat;
let currentUser = {
    nickname: '',
    id: null
};

// 初始化函数
async function init() {
    await checkNickname();
    await initFirebase();
    game = new Game();
    chat = new Chat();
}

// 检查昵称
function checkNickname() {
    return new Promise((resolve) => {
        const savedNickname = localStorage.getItem('nickname');
        if (!savedNickname) {
            showNicknameModal();
            // 等待用户设置昵称
            const checkInterval = setInterval(() => {
                if (currentUser.nickname) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        } else {
            currentUser.nickname = savedNickname;
            currentUser.id = localStorage.getItem('userId') || generateUserId();
            updateUserInfo();
            resolve();
        }
    });
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
// 在 initFirebase 函数中添加错误处理
function initFirebase() {
    try {
        // 监听在线用户
        database.ref('users').on('value', (snapshot) => {
            try {
                updateOnlineUsers(snapshot.val());
            } catch (error) {
                console.error('更新在线用户列表失败:', error);
            }
        }, (error) => {
            console.error('监听在线用户失败:', error);
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
    } catch (error) {
        console.error('Firebase初始化失败:', error);
    }
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
// 邀请对战
async function inviteToGame(userId) {
    try {
        // 获取被邀请用户信息
        const userSnapshot = await database.ref(`users/${userId}`).once('value');
        const invitedUser = userSnapshot.val();
        
        if (!invitedUser) {
            alert('无法找到该用户');
            return;
        }

        const roomId = generateRoomId();
        
        // 创建房间数据
        await database.ref(`rooms/${roomId}`).set({
            players: {
                [currentUser.id]: {
                    nickname: currentUser.nickname,
                    color: 'black'
                },
                [userId]: {
                    nickname: invitedUser.nickname,
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

        // 加入房间
        await joinRoom(roomId);
        
    } catch (error) {
        console.error('邀请对战失败:', error);
        alert('邀请对战失败，请重试');
    }
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
// 发送大厅消息
async function sendLobbyMessage() {
    const input = document.getElementById('lobby-message');
    const content = input.value.trim();
    
    if (content && currentUser.nickname) {
        try {
            await chat.sendLobbyMessage(currentUser.nickname, content);
            input.value = '';
        } catch (error) {
            console.error('发送消息失败:', error);
            alert('发送消息失败，请重试');
        }
    }
}

// 发送房间消息
async function sendRoomMessage() {
    const input = document.getElementById('room-message');
    const content = input.value.trim();
    
    if (content && currentUser.nickname && game.roomId) {
        try {
            await chat.sendRoomMessage(game.roomId, currentUser.nickname, content);
            input.value = '';
        } catch (error) {
            console.error('发送消息失败:', error);
            alert('发送消息失败，请重试');
        }
    }
}

// 生成房间ID
function generateRoomId() {
    return Math.random().toString(36).substr(2, 9);
}

// 页面加载完成后初始化
window.addEventListener('load', init);

// 在 init 函数中添加事件监听器绑定
function init() {
    game = new Game();
    chat = new Chat();
    checkNickname();
    initFirebase();
    
    // 绑定消息发送按钮事件
    document.getElementById('lobby-message-btn')?.addEventListener('click', sendLobbyMessage);
    document.getElementById('room-message-btn')?.addEventListener('click', sendRoomMessage);
    
    // 绑定回车发送消息
    document.getElementById('lobby-message')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendLobbyMessage();
    });
    document.getElementById('room-message')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendRoomMessage();
    });
}