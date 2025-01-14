window.onload = function() {
    const board = new Board();

    // 绑定新游戏按钮
    document.getElementById('newGame').addEventListener('click', () => {
        board.initBoard();
    });

    // 绑定悔棋按钮
    document.getElementById('undoMove').addEventListener('click', () => {
        board.undoMove();
    });
}; 