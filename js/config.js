// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDJh6u-t-U7itivGrxAeJ5qHlHFuoJpAAc",
    authDomain: "game-d4950.firebaseapp.com",
    databaseURL: "https://game-d4950-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "game-d4950",
    storageBucket: "game-d4950.firebasestorage.app",
    messagingSenderId: "177087120115",
    appId: "1:177087120115:web:daa64309d6f1c22ab12d86",
    measurementId: "G-YBPB8CSPKV"
  };

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 常量配置
const CONSTANTS = {
    BOARD_SIZE: 15, // 棋盘大小
    CELL_SIZE: 40, // 每个格子的大小
    PIECE_RADIUS: 18, // 棋子半径
    COOKIE_EXPIRE_DAYS: 1, // Cookie 过期时间（天）
    HEARTBEAT_INTERVAL: 30000, // 心跳间隔（毫秒）
    OFFLINE_TIMEOUT: 60000, // 离线超时时间（毫秒）
};