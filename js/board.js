class Board {
    constructor() {
        this.pieces = [];
        this.selectedPiece = null;
        this.currentPlayer = 'red';  // 红方先手
        this.canvas = document.getElementById('chessboard');
        this.ctx = this.canvas.getContext('2d');
        
        // 调整棋盘参数
        this.gridSize = 56;     // 格子大小
        this.padding = 40;      // 边距
        this.pieceRadius = 25;  // 棋子半径
        
        this.moveHistory = [];  // 记录移动历史
        this.gameOver = false;
        this.winner = null;
        
        // 添加上一步棋的记录
        this.lastMove = null;
        
        // 添加音效
        this.moveSound = new Audio('sounds/move.mp3');
        this.captureSound = new Audio('sounds/capture.mp3');
        this.checkSound = new Audio('sounds/check.mp3');
        
        this.initBoard();
        this.bindEvents();
        this.updateStatus();
    }

    // 初始化棋盘
    initBoard() {
        // 完整的状态重置
        this.pieces = [];
        this.moveHistory = [];
        this.lastMove = null;
        this.gameOver = false;
        this.winner = null;
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.isCheck = false;
        
        // 初始化布局
        this.initPieces('red');
        this.initPieces('black');
        
        // 更新显示
        this.drawBoard();
        this.updateStatus();
    }

    // 初始化某一方的棋子
    initPieces(color) {
        const y = color === 'red' ? 9 : 0;
        const direction = color === 'red' ? -1 : 1;

        // 添加车
        this.pieces.push(new Piece('chariot', color, 0, y));
        this.pieces.push(new Piece('chariot', color, 8, y));

        // 添加马
        this.pieces.push(new Piece('horse', color, 1, y));
        this.pieces.push(new Piece('horse', color, 7, y));

        // 添加象/相
        this.pieces.push(new Piece('elephant', color, 2, y));
        this.pieces.push(new Piece('elephant', color, 6, y));

        // 添加士
        this.pieces.push(new Piece('advisor', color, 3, y));
        this.pieces.push(new Piece('advisor', color, 5, y));

        // 添加将/帅
        this.pieces.push(new Piece('general', color, 4, y));

        // 添加炮
        this.pieces.push(new Piece('cannon', color, 1, y + direction * 2));
        this.pieces.push(new Piece('cannon', color, 7, y + direction * 2));

        // 添加兵/卒
        for (let i = 0; i < 5; i++) {
            this.pieces.push(new Piece('soldier', color, i * 2, y + direction * 3));
        }
    }

    // 绘制棋盘
    drawBoard() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        ctx.fillStyle = '#ffedcc';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制格子线
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        // 绘制横线和竖线
        for (let i = 0; i < 10; i++) {
            // 横线
            ctx.moveTo(this.padding, this.padding + i * this.gridSize);
            ctx.lineTo(this.padding + 8 * this.gridSize, this.padding + i * this.gridSize);
        }
        for (let i = 0; i < 9; i++) {
            // 竖线
            ctx.moveTo(this.padding + i * this.gridSize, this.padding);
            ctx.lineTo(this.padding + i * this.gridSize, this.padding + 9 * this.gridSize);
        }
        ctx.stroke();

        // 绘制九宫格斜线
        ctx.beginPath();
        // 上方九宫格
        ctx.moveTo(this.padding + 3 * this.gridSize, this.padding);
        ctx.lineTo(this.padding + 5 * this.gridSize, this.padding + 2 * this.gridSize);
        ctx.moveTo(this.padding + 5 * this.gridSize, this.padding);
        ctx.lineTo(this.padding + 3 * this.gridSize, this.padding + 2 * this.gridSize);
        // 下方九宫格
        ctx.moveTo(this.padding + 3 * this.gridSize, this.padding + 7 * this.gridSize);
        ctx.lineTo(this.padding + 5 * this.gridSize, this.padding + 9 * this.gridSize);
        ctx.moveTo(this.padding + 5 * this.gridSize, this.padding + 7 * this.gridSize);
        ctx.lineTo(this.padding + 3 * this.gridSize, this.padding + 9 * this.gridSize);
        ctx.stroke();

        // 绘制河界
        ctx.font = '24px "Microsoft YaHei"';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText('楚 河', this.padding + 1.5 * this.gridSize, this.padding + 4.7 * this.gridSize);
        ctx.fillText('漢 界', this.padding + 6.5 * this.gridSize, this.padding + 4.7 * this.gridSize);

        // 绘制棋子
        this.pieces.forEach(piece => this.drawPiece(piece));

        // 绘制上一步棋的提示
        if (this.lastMove) {
            // 绘制起点
            const fromX = this.padding + this.lastMove.fromX * this.gridSize;
            const fromY = this.padding + this.lastMove.fromY * this.gridSize;
            ctx.beginPath();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.arc(fromX, fromY, this.pieceRadius - 8, 0, Math.PI * 2);
            ctx.stroke();

            // 绘制终点
            const toX = this.padding + this.lastMove.toX * this.gridSize;
            const toY = this.padding + this.lastMove.toY * this.gridSize;
            ctx.beginPath();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            ctx.arc(toX, toY, this.pieceRadius + 2, 0, Math.PI * 2);
            ctx.stroke();

            // 绘制连线
            ctx.beginPath();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 绘制选中棋子的提示（保持在最上层）
        if (this.selectedPiece) {
            const x = this.padding + this.selectedPiece.x * this.gridSize;
            const y = this.padding + this.selectedPiece.y * this.gridSize;
            ctx.beginPath();
            ctx.strokeStyle = '#00f';
            ctx.lineWidth = 2;
            ctx.arc(x, y, this.pieceRadius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // 绘制棋子
    drawPiece(piece) {
        const ctx = this.ctx;
        const x = this.padding + piece.x * this.gridSize;
        const y = this.padding + piece.y * this.gridSize;

        // 绘制棋子背景
        ctx.beginPath();
        ctx.fillStyle = '#f0d9b5';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.arc(x, y, this.pieceRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制棋子内圈
        ctx.beginPath();
        ctx.arc(x, y, this.pieceRadius - 3, 0, Math.PI * 2);
        ctx.stroke();

        // 绘制棋子文字
        ctx.fillStyle = piece.color === 'red' ? '#c00' : '#000';
        ctx.font = 'bold 24px "Microsoft YaHei"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(piece.getName(), x, y);
    }

    // 绑定事件
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    // 处理点击事件
    handleClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left - this.padding) / this.gridSize);
        const y = Math.round((e.clientY - rect.top - this.padding) / this.gridSize);

        // 检查是否点击了棋子
        const piece = this.pieces.find(p => p.x === x && p.y === y);

        if (this.selectedPiece) {
            if (piece && piece.color === this.currentPlayer) {
                // 选择新棋子
                this.selectedPiece = piece;
            } else if (this.isValidMove(this.selectedPiece, x, y)) {
                // 移动棋子
                this.movePiece(this.selectedPiece, x, y);
                this.selectedPiece = null;
                if (!this.gameOver) {
                    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                }
            }
        } else if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = piece;
        }

        if (this.selectedPiece) {
            // 添加：显示可能的移动位置
            this.drawPossibleMoves(this.selectedPiece);
        }

        this.drawBoard();
        this.updateStatus();
    }

    // 检查移动是否合法
    isValidMove(piece, toX, toY) {
        // 添加：检查坐标是否在棋盘范围内
        if (toX < 0 || toX > 8 || toY < 0 || toY > 9) {
            return false;
        }

        // 添加：检查是否移动到原位置
        if (piece.x === toX && piece.y === toY) {
            return false;
        }

        // 检查目标位置是否有己方棋子
        const targetPiece = this.pieces.find(p => p.x === toX && p.y === toY);
        if (targetPiece && targetPiece.color === piece.color) {
            return false;
        }

        // 根据不同棋子类型检查移动是否合法
        switch (piece.type) {
            case 'general':
                return this.isValidGeneralMove(piece, toX, toY);
            case 'advisor':
                return this.isValidAdvisorMove(piece, toX, toY);
            case 'elephant':
                return this.isValidElephantMove(piece, toX, toY);
            case 'horse':
                return this.isValidHorseMove(piece, toX, toY);
            case 'chariot':
                return this.isValidChariotMove(piece, toX, toY);
            case 'cannon':
                return this.isValidCannonMove(piece, toX, toY);
            case 'soldier':
                return this.isValidSoldierMove(piece, toX, toY);
            default:
                return false;
        }
    }

    // 将/帅移动规则
    isValidGeneralMove(piece, toX, toY) {
        // 只能在九宫格内移动
        const isRedSide = piece.color === 'red';
        const minY = isRedSide ? 7 : 0;
        const maxY = isRedSide ? 9 : 2;
        
        if (toX < 3 || toX > 5 || toY < minY || toY > maxY) {
            return false;
        }

        // 只能上下左右移动一格
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    // 士/仕移动规则
    isValidAdvisorMove(piece, toX, toY) {
        // 只能在九宫格内移动
        const isRedSide = piece.color === 'red';
        const minY = isRedSide ? 7 : 0;
        const maxY = isRedSide ? 9 : 2;
        
        if (toX < 3 || toX > 5 || toY < minY || toY > maxY) {
            return false;
        }

        // 只能斜着移动一格
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        return dx === 1 && dy === 1;
    }

    // 象/相移动规则
    isValidElephantMove(piece, toX, toY) {
        // 不能过河
        const isRedSide = piece.color === 'red';
        if (isRedSide && toY < 5) return false;
        if (!isRedSide && toY > 4) return false;

        // 只能走田字
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        if (dx !== 2 || dy !== 2) return false;

        // 检查象眼是否被塞
        const eyeX = (piece.x + toX) / 2;
        const eyeY = (piece.y + toY) / 2;
        return !this.pieces.some(p => p.x === eyeX && p.y === eyeY);
    }

    // 马移动规则
    isValidHorseMove(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = Math.abs(toY - piece.y);
        
        // 马走日
        if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) {
            return false;
        }

        // 检查马腿
        let legX = piece.x;
        let legY = piece.y;
        if (dx === 2) {
            legX = piece.x + (toX > piece.x ? 1 : -1);
        } else {
            legY = piece.y + (toY > piece.y ? 1 : -1);
        }

        return !this.pieces.some(p => p.x === legX && p.y === legY);
    }

    // 车移动规则
    isValidChariotMove(piece, toX, toY) {
        // 必须直线移动
        if (toX !== piece.x && toY !== piece.y) {
            return false;
        }

        // 检查路径上是否有其他棋子
        const dx = Math.sign(toX - piece.x);
        const dy = Math.sign(toY - piece.y);
        let x = piece.x + dx;
        let y = piece.y + dy;

        while (x !== toX || y !== toY) {
            if (this.pieces.some(p => p.x === x && p.y === y)) {
                return false;
            }
            x += dx;
            y += dy;
        }

        return true;
    }

    // 炮移动规则
    isValidCannonMove(piece, toX, toY) {
        // 必须直线移动
        if (toX !== piece.x && toY !== piece.y) {
            return false;
        }

        // 检查路径上的棋子
        const dx = Math.sign(toX - piece.x);
        const dy = Math.sign(toY - piece.y);
        let x = piece.x + dx;
        let y = piece.y + dy;
        let obstacleCount = 0;

        while (x !== toX || y !== toY) {
            if (this.pieces.some(p => p.x === x && p.y === y)) {
                obstacleCount++;
            }
            x += dx;
            y += dy;
        }

        const targetPiece = this.pieces.find(p => p.x === toX && p.y === toY);
        // 吃子时必须翻过一个棋子
        if (targetPiece) {
            return obstacleCount === 1;
        }
        // 移动时不能有障碍
        return obstacleCount === 0;
    }

    // 兵/卒移动规则
    isValidSoldierMove(piece, toX, toY) {
        const dx = Math.abs(toX - piece.x);
        const dy = toY - piece.y;
        const isRedSide = piece.color === 'red';
        const direction = isRedSide ? -1 : 1;

        // 未过河只能向前
        if (isRedSide ? piece.y > 4 : piece.y < 5) {
            return dx === 0 && dy === direction;
        }

        // 过河后可以左右移动
        return (dx === 1 && dy === 0) || (dx === 0 && dy === direction);
    }

    // 移动棋子
    movePiece(piece, toX, toY) {
        // 记录这一步棋
        this.lastMove = {
            fromX: piece.x,
            fromY: piece.y,
            toX: toX,
            toY: toY
        };

        // 记录移动历史（用于悔棋）
        this.moveHistory = this.moveHistory || [];
        this.moveHistory.push({
            piece: piece,
            fromX: piece.x,
            fromY: piece.y,
            toX: toX,
            toY: toY,
            capturedPiece: this.pieces.find(p => p.x === toX && p.y === toY)
        });

        // 移除被吃的棋子
        this.pieces = this.pieces.filter(p => p.x !== toX || p.y !== toY);

        // 移动棋子
        piece.x = toX;
        piece.y = toY;

        // 检查将帅是否碰面
        const redGeneral = this.pieces.find(p => p.type === 'general' && p.color === 'red');
        const blackGeneral = this.pieces.find(p => p.type === 'general' && p.color === 'black');
        
        if (redGeneral && blackGeneral && redGeneral.x === blackGeneral.x) {
            let hasObstacle = false;
            const minY = Math.min(redGeneral.y, blackGeneral.y);
            const maxY = Math.max(redGeneral.y, blackGeneral.y);
            
            for (let y = minY + 1; y < maxY; y++) {
                if (this.pieces.some(p => p.x === redGeneral.x && p.y === y)) {
                    hasObstacle = true;
                    break;
                }
            }
            
            if (!hasObstacle) {
                this.gameOver = true;
                this.winner = piece.color === 'red' ? 'black' : 'red';
                this.currentPlayer = null;
            }
        }

        // 检查是否将军
        this.checkForCheck();

        // 播放相应音效
        if (this.pieces.some(p => p.x === toX && p.y === toY)) {
            this.captureSound.play();
        } else {
            this.moveSound.play();
        }

        // 如果将军则播放将军音效
        if (this.isCheck) {
            this.checkSound.play();
        }
    }

    // 检查是否将军
    checkForCheck() {
        // 找到双方的将帅
        const redGeneral = this.pieces.find(p => p.type === 'general' && p.color === 'red');
        const blackGeneral = this.pieces.find(p => p.type === 'general' && p.color === 'black');
        
        // 如果一方的将帅被吃掉，游戏结束
        if (!redGeneral || !blackGeneral) {
            this.gameOver = true;
            this.winner = redGeneral ? 'red' : 'black';
            this.currentPlayer = null;
            this.updateStatus();
            return;
        }

        // 检查将帅是否照面
        if (redGeneral.x === blackGeneral.x) {
            let hasObstacle = false;
            for (let y = redGeneral.y - 1; y > blackGeneral.y; y--) {
                if (this.pieces.some(p => p.x === redGeneral.x && p.y === y)) {
                    hasObstacle = true;
                    break;
                }
            }
            if (!hasObstacle) {
                // 将帅照面，当前行动方输
                this.gameOver = true;
                this.winner = this.currentPlayer === 'red' ? 'black' : 'red';
                this.currentPlayer = null;
                this.updateStatus();
                return;
            }
        }

        // 检查是否被将军
        const currentColor = this.currentPlayer;
        const opponentColor = currentColor === 'red' ? 'black' : 'red';
        const currentGeneral = currentColor === 'red' ? redGeneral : blackGeneral;

        this.isCheck = this.pieces
            .filter(p => p.color === this.currentPlayer)
            .some(p => this.isValidMove(p, 
                this.currentPlayer === 'red' ? blackGeneral.x : redGeneral.x,
                this.currentPlayer === 'red' ? blackGeneral.y : redGeneral.y
            ));

        if (this.isCheck) {
            // 检查是否将死
            const isCheckmate = !this.hasValidMoves(currentColor);
            if (isCheckmate) {
                this.gameOver = true;
                this.winner = opponentColor;
                this.currentPlayer = null;
                this.updateStatus();
            }
        }
    }

    // 检查是否有合法移动
    hasValidMoves(color) {
        const pieces = this.pieces.filter(p => p.color === color);
        
        for (const piece of pieces) {
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 10; y++) {
                    if (this.isValidMove(piece, x, y)) {
                        // 模拟移动，检查是否能解除将军
                        const originalX = piece.x;
                        const originalY = piece.y;
                        const capturedPiece = this.pieces.find(p => p.x === x && p.y === y);
                        
                        piece.x = x;
                        piece.y = y;
                        if (capturedPiece) {
                            this.pieces = this.pieces.filter(p => p !== capturedPiece);
                        }

                        const stillInCheck = this.isInCheck(color);

                        // 恢复位置
                        piece.x = originalX;
                        piece.y = originalY;
                        if (capturedPiece) {
                            this.pieces.push(capturedPiece);
                        }

                        if (!stillInCheck) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // 检查某方是否被将军
    isInCheck(color) {
        const general = this.pieces.find(p => p.type === 'general' && p.color === color);
        return this.pieces
            .filter(p => p.color !== color)
            .some(p => this.isValidMove(p, general.x, general.y));
    }

    // 悔棋功能
    undoMove() {
        if (!this.moveHistory || this.moveHistory.length === 0) {
            return;
        }

        const lastMove = this.moveHistory.pop();
        
        // 添加：恢复游戏状态
        this.gameOver = false;
        this.winner = null;
        
        // 恢复棋子位置
        lastMove.piece.x = lastMove.fromX;
        lastMove.piece.y = lastMove.fromY;
        
        // 恢复被吃的棋子
        if (lastMove.capturedPiece) {
            this.pieces.push(lastMove.capturedPiece);
        }

        // 更新上一步棋的记录
        this.lastMove = this.moveHistory.length > 0 ? {
            fromX: this.moveHistory[this.moveHistory.length - 1].fromX,
            fromY: this.moveHistory[this.moveHistory.length - 1].fromY,
            toX: this.moveHistory[this.moveHistory.length - 1].toX,
            toY: this.moveHistory[this.moveHistory.length - 1].toY
        } : null;

        // 切换当前玩家
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.selectedPiece = null;
        this.isCheck = false;
        
        // 修改：重新检查将军状态
        this.checkForCheck();
        this.drawBoard();
        this.updateStatus();
    }

    // 更新游戏状态显示
    updateStatus() {
        const statusElement = document.querySelector('.status');
        const redPlayer = document.querySelector('.player.red');
        const blackPlayer = document.querySelector('.player.black');
        
        // 更新玩家状态显示
        if (this.gameOver) {
            redPlayer.classList.remove('active');
            blackPlayer.classList.remove('active');
            const winnerText = this.winner === 'red' ? '红方' : '黑方';
            statusElement.textContent = `游戏结束，${winnerText}胜利！`;
            setTimeout(() => alert(`${winnerText}胜利！`), 100);
        } else {
            redPlayer.classList.toggle('active', this.currentPlayer === 'red');
            blackPlayer.classList.toggle('active', this.currentPlayer === 'black');
            if (this.isCheck) {
                statusElement.textContent = `将军！轮到${this.currentPlayer === 'red' ? '红方' : '黑方'}走棋`;
            } else {
                statusElement.textContent = `轮到${this.currentPlayer === 'red' ? '红方' : '黑方'}走棋`;
            }
        }
    }

    drawPossibleMoves(piece) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';

        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                if (this.isValidMove(piece, x, y)) {
                    const drawX = this.padding + x * this.gridSize;
                    const drawY = this.padding + y * this.gridSize;
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
} 