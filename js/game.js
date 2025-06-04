class Game {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.board = Array(CONSTANTS.BOARD_SIZE).fill().map(() => Array(CONSTANTS.BOARD_SIZE).fill(null));
        this.currentPlayer = 'black';
        this.gameState = 'waiting'; // waiting, playing, ended
        this.roomId = null;
        this.players = {};
        this.spectators = [];
        
        this.initCanvas();
        this.bindEvents();
    }

    initCanvas() {
        this.canvas.width = CONSTANTS.BOARD_SIZE * CONSTANTS.CELL_SIZE;
        this.canvas.height = CONSTANTS.BOARD_SIZE * CONSTANTS.CELL_SIZE;
        this.drawBoard();
    }

    drawBoard() {
        // 绘制棋盘背景
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < CONSTANTS.BOARD_SIZE; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(CONSTANTS.CELL_SIZE/2, i * CONSTANTS.CELL_SIZE + CONSTANTS.CELL_SIZE/2);
            this.ctx.lineTo(this.canvas.width - CONSTANTS.CELL_SIZE/2, i * CONSTANTS.CELL_SIZE + CONSTANTS.CELL_SIZE/2);
            this.ctx.stroke();

            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(i * CONSTANTS.CELL_SIZE + CONSTANTS.CELL_SIZE/2, CONSTANTS.CELL_SIZE/2);
            this.ctx.lineTo(i * CONSTANTS.CELL_SIZE + CONSTANTS.CELL_SIZE/2, this.canvas.height - CONSTANTS.CELL_SIZE/2);
            this.ctx.stroke();
        }
    }

    // ... 更多游戏逻辑代码将在下一部分继续
}