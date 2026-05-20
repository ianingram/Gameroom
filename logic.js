// logic.js

const game = new Chess();

export function getBoardState() {
    return game.board(); 
}

export function attemptMove(sourceSquare, targetSquare) {
    const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' 
    });

    if (move === null) {
        return false; 
    }

    updateStatus();
    return true; 
}

export function getPossibleMoves(square) {
    return game.moves({ square: square, verbose: true }); 
}

function updateStatus() {
    let statusHTML = '';
    let moveColor = game.turn() === 'b' ? 'Black' : 'White';

    if (game.in_checkmate()) {
        statusHTML = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.in_draw()) {
        statusHTML = 'Game over, drawn position';
    } else {
        statusHTML = `${moveColor} to move`;
        if (game.in_check()) {
            statusHTML += ', ' + moveColor + ' is in check';
        }
    }

    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.innerText = statusHTML;
    }
}

updateStatus();
