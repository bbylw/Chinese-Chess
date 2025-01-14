class ChessAI {
    constructor(board) {
        this.board = board;
        this.maxDepth = 4;  // 增加搜索深度
        this.maxTime = 3000; // 增加思考时间到3秒
        this.startTime = 0;
        this.nodeCount = 0;
        this.initPiecePositionValues();
    }

    // 初始化棋子位置价值表
    initPiecePositionValues() {
        // 兵/卒的位置价值
        this.soldierPositionValues = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [2, 4, 6, 6, 6, 6, 6, 4, 2],
            [4, 6, 8, 8, 8, 8, 8, 6, 4],
            [6, 8, 10, 10, 10, 10, 10, 8, 6],
            [8, 10, 12, 12, 12, 12, 12, 10, 8],
            [10, 12, 14, 14, 14, 14, 14, 12, 10],
            [12, 14, 16, 16, 16, 16, 16, 14, 12],
            [14, 16, 18, 18, 18, 18, 18, 16, 14],
        ];

        // 马的位置价值
        this.horsePositionValues = [
            [0, 2, 4, 4, 4, 4, 4, 2, 0],
            [2, 4, 6, 6, 6, 6, 6, 4, 2],
            [4, 6, 8, 8, 8, 8, 8, 6, 4],
            [4, 6, 8, 8, 8, 8, 8, 6, 4],
            [4, 6, 8, 8, 8, 8, 8, 6, 4],
            [4, 6, 8, 8, 8, 8, 8, 6, 4],
            [4, 6, 8, 8, 8, 8, 8, 6, 4],
            [2, 4, 6, 6, 6, 6, 6, 4, 2],
            [0, 2, 4, 4, 4, 4, 4, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        // 炮的位置价值
        this.cannonPositionValues = [
            [6, 6, 6, 6, 6, 6, 6, 6, 6],
            [6, 8, 8, 8, 8, 8, 8, 8, 6],
            [6, 8, 8, 8, 8, 8, 8, 8, 6],
            [6, 8, 8, 10, 10, 10, 8, 8, 6],
            [6, 8, 8, 10, 10, 10, 8, 8, 6],
            [6, 8, 8, 10, 10, 10, 8, 8, 6],
            [6, 8, 8, 8, 8, 8, 8, 8, 6],
            [6, 8, 8, 8, 8, 8, 8, 8, 6],
            [6, 6, 6, 6, 6, 6, 6, 6, 6],
            [6, 6, 6, 6, 6, 6, 6, 6, 6],
        ];
    }

    // 修改评估函数
    evaluateBoard() {
        if (this.board.gameOver) {
            if (this.board.winner === 'black') {
                return 1000000;
            } else if (this.board.winner === 'red') {
                return -1000000;
            }
            return 0; // 和棋
        }

        let score = 0;
        const pieceValues = {
            'general': 10000,
            'advisor': 250,
            'elephant': 250,
            'horse': 600,    // 提高马的价值
            'chariot': 1200, // 提高车的价值
            'cannon': 550,
            'soldier': 150   // 提高兵的价值
        };

        for (const piece of this.board.pieces) {
            let value = pieceValues[piece.type];
            
            // 位置价值
            value += this.getPositionValue(piece) * 2;
            
            // 机动性加分
            value += this.getMobilityBonus(piece) * 15;
            
            // 威胁检测
            if (this.isUnderThreat(piece)) {
                value *= 0.8; // 被威胁的棋子降低价值
            }

            // 控制中路加分
            if (piece.x >= 3 && piece.x <= 5) {
                value *= 1.2;
            }

            // 过河兵/卒加分
            if (piece.type === 'soldier') {
                const crossedRiver = piece.color === 'red' ? piece.y < 5 : piece.y > 4;
                if (crossedRiver) {
                    value *= 1.5;
                }
            }

            if (piece.color === 'black') {
                score += value;
            } else {
                score -= value;
            }
        }

        // 将军状态评估
        if (this.board.isCheck) {
            const checkingColor = this.board.currentPlayer === 'red' ? 'black' : 'red';
            score += (checkingColor === 'black' ? 500 : -500);
        }

        return score;
    }

    // 获取位置价值
    getPositionValue(piece) {
        let value = 0;
        const y = piece.color === 'red' ? 9 - piece.y : piece.y;  // 翻转红方的坐标

        switch (piece.type) {
            case 'soldier':
                value = this.soldierPositionValues[y][piece.x];
                break;
            case 'horse':
                value = this.horsePositionValues[y][piece.x];
                break;
            case 'cannon':
                value = this.cannonPositionValues[y][piece.x];
                break;
        }

        return value;
    }

    // 计算棋子机动性
    getMobilityBonus(piece) {
        let mobility = 0;
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 10; y++) {
                if (this.board.isValidMove(piece, x, y)) {
                    mobility++;
                }
            }
        }
        return mobility;
    }

    // 判断是否进入残局
    isEndgame() {
        const pieceCount = this.board.pieces.length;
        return pieceCount <= 16;  // 当棋子数量少于一半时视为残局
    }

    // 添加开局库
    getOpeningMove() {
        const openingMoves = {
            'red': [
                { from: { x: 4, y: 9 }, to: { x: 4, y: 8 } },  // 帅前进
                { from: { x: 1, y: 9 }, to: { x: 2, y: 7 } },  // 马进中
                { from: { x: 1, y: 7 }, to: { x: 1, y: 4 } },  // 炮平中
            ],
            'black': [
                { from: { x: 4, y: 0 }, to: { x: 4, y: 1 } },  // 将前进
                { from: { x: 1, y: 0 }, to: { x: 2, y: 2 } },  // 马进中
                { from: { x: 1, y: 2 }, to: { x: 1, y: 5 } },  // 炮平中
            ]
        };

        const moves = openingMoves[this.board.currentPlayer];
        for (const move of moves) {
            const piece = this.board.pieces.find(p => 
                p.x === move.from.x && 
                p.y === move.from.y && 
                p.color === this.board.currentPlayer
            );
            if (piece && this.board.isValidMove(piece, move.to.x, move.to.y)) {
                return {
                    fromX: move.from.x,
                    fromY: move.from.y,
                    toX: move.to.x,
                    toY: move.to.y
                };
            }
        }
        return null;
    }

    // 获取最佳移动
    getBestMove() {
        this.startTime = Date.now();
        this.nodeCount = 0;

        // 先检查开局库
        const openingMove = this.getOpeningMove();
        if (openingMove) return openingMove;

        let bestMove = null;
        let bestScore = -Infinity;

        // 获取所有可能的移动
        const moves = this.getAllPossibleMoves(this.board.currentPlayer);
        
        // 按照简单评估进行排序，优先搜索可能更好的移动
        moves.sort((a, b) => {
            const scoreA = this.getSimpleEvaluation(a);
            const scoreB = this.getSimpleEvaluation(b);
            return scoreB - scoreA;
        });

        // 迭代加深搜索
        for (let depth = 1; depth <= this.maxDepth; depth++) {
            let alphaBeta = {
                alpha: -Infinity,
                beta: Infinity
            };

            for (const move of moves) {
                // 检查是否超时
                if (Date.now() - this.startTime > this.maxTime) {
                    console.log(`搜索到深度 ${depth-1}，评估了 ${this.nodeCount} 个节点`);
                    return bestMove;
                }

                this.makeMove(move);
                const score = this.minimax(depth - 1, false, alphaBeta.alpha, alphaBeta.beta);
                this.undoMove(move);

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        console.log(`完成搜索，评估了 ${this.nodeCount} 个节点`);
        return bestMove;
    }

    // 优化后的 Minimax 算法
    minimax(depth, isMaximizing, alpha, beta) {
        this.nodeCount++;

        // 检查是否超时
        if (Date.now() - this.startTime > this.maxTime) {
            return this.evaluateBoard();
        }

        // 到达搜索深度或游戏结束
        if (depth === 0 || this.board.gameOver) {
            return this.evaluateBoard();
        }

        const moves = this.getAllPossibleMoves(isMaximizing ? 'black' : 'red');
        
        // 如果没有合法移动，可能是将军或和棋
        if (moves.length === 0) {
            return isMaximizing ? -Infinity : Infinity;
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                this.makeMove(move);
                const score = this.minimax(depth - 1, false, alpha, beta);
                this.undoMove(move);

                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-Beta 剪枝
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                this.makeMove(move);
                const score = this.minimax(depth - 1, true, alpha, beta);
                this.undoMove(move);

                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-Beta 剪枝
            }
            return minScore;
        }
    }

    // 优化移动评估
    getSimpleEvaluation(move) {
        let score = 0;
        
        // 吃子得分
        if (move.capturedPiece) {
            const values = {
                'general': 1000,
                'advisor': 25,
                'elephant': 25,
                'horse': 60,
                'chariot': 120,
                'cannon': 55,
                'soldier': 15
            };
            score += values[move.capturedPiece.type] * 10;

            // 用小子吃大子额外加分
            const attackerValue = values[move.piece.type];
            const targetValue = values[move.capturedPiece.type];
            if (attackerValue < targetValue) {
                score += (targetValue - attackerValue) * 5;
            }
        }

        // 中心控制
        if (move.toX >= 3 && move.toX <= 5) {
            score += 10;
        }

        // 向前移动
        const forward = move.piece.color === 'red' ? move.fromY - move.toY : move.toY - move.fromY;
        if (forward > 0) {
            score += 5;
        }

        // 避免被吃
        if (this.isUnderThreat(move.piece)) {
            const willBeSafe = !this.willBeUnderThreat(move);
            if (willBeSafe) {
                score += 50;
            }
        }

        return score;
    }

    // 检查移动后是否会被威胁
    willBeUnderThreat(move) {
        // 模拟移动
        const originalX = move.piece.x;
        const originalY = move.piece.y;
        const capturedPiece = this.board.pieces.find(p => 
            p.x === move.toX && p.y === move.toY
        );

        move.piece.x = move.toX;
        move.piece.y = move.toY;
        if (capturedPiece) {
            this.board.pieces = this.board.pieces.filter(p => p !== capturedPiece);
        }

        // 检查威胁
        const isUnderThreat = this.isUnderThreat(move.piece);

        // 恢复位置
        move.piece.x = originalX;
        move.piece.y = originalY;
        if (capturedPiece) {
            this.board.pieces.push(capturedPiece);
        }

        return isUnderThreat;
    }

    // 获取所有可能的移动
    getAllPossibleMoves(color) {
        const moves = [];
        const pieces = this.board.pieces.filter(p => p.color === color);

        for (const piece of pieces) {
            // 遍历所有可能的目标位置
            for (let x = 0; x < 9; x++) {
                for (let y = 0; y < 10; y++) {
                    if (this.board.isValidMove(piece, x, y)) {
                        // 模拟移动，检查是否会导致自己被将军
                        const originalX = piece.x;
                        const originalY = piece.y;
                        const capturedPiece = this.board.pieces.find(p => p.x === x && p.y === y);
                        
                        piece.x = x;
                        piece.y = y;
                        if (capturedPiece) {
                            this.board.pieces = this.board.pieces.filter(p => p !== capturedPiece);
                        }

                        const isValid = !this.board.isInCheck(color);

                        // 恢复位置
                        piece.x = originalX;
                        piece.y = originalY;
                        if (capturedPiece) {
                            this.board.pieces.push(capturedPiece);
                        }

                        if (isValid) {
                            moves.push({
                                fromX: originalX,
                                fromY: originalY,
                                toX: x,
                                toY: y,
                                piece: piece,
                                capturedPiece: capturedPiece
                            });
                        }
                    }
                }
            }
        }

        return moves;
    }

    // 执行移动
    makeMove(move) {
        const piece = this.board.pieces.find(p => 
            p.x === move.fromX && p.y === move.fromY
        );
        move.piece = piece;
        move.capturedPiece = this.board.pieces.find(p => 
            p.x === move.toX && p.y === move.toY
        );

        // 保存原始位置
        move.originalX = piece.x;
        move.originalY = piece.y;

        // 执行移动
        piece.x = move.toX;
        piece.y = move.toY;

        // 移除被吃的棋子
        if (move.capturedPiece) {
            this.board.pieces = this.board.pieces.filter(p => p !== move.capturedPiece);
        }
    }

    // 撤销移动
    undoMove(move) {
        // 恢复移动的棋子位置
        move.piece.x = move.originalX;
        move.piece.y = move.originalY;

        // 恢复被吃的棋子
        if (move.capturedPiece) {
            this.board.pieces.push(move.capturedPiece);
        }
    }

    // 检查棋子是否被威胁
    isUnderThreat(piece) {
        const opponentColor = piece.color === 'red' ? 'black' : 'red';
        const opponentPieces = this.board.pieces.filter(p => p.color === opponentColor);
        
        return opponentPieces.some(p => 
            this.board.isValidMove(p, piece.x, piece.y)
        );
    }
} 