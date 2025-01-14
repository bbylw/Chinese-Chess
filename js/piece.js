class Piece {
    constructor(type, color, x, y) {
        this.type = type;  // 棋子类型：将/帅、士、象/相、马、车、炮、兵/卒
        this.color = color;  // 红方或黑方
        this.x = x;  // 棋盘坐标 x
        this.y = y;  // 棋盘坐标 y
    }

    // 获取棋子的中文名称
    getName() {
        const names = {
            'general': this.color === 'red' ? '帅' : '将',
            'advisor': '士',
            'elephant': this.color === 'red' ? '相' : '象',
            'horse': '马',
            'chariot': '车',
            'cannon': '炮',
            'soldier': this.color === 'red' ? '兵' : '卒'
        };
        return names[this.type];
    }
} 