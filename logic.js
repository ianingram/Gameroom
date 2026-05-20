// logic.js

// 1. Initialize the Chess engine (chess.js is loaded globally from the HTML)
const game = new Chess();

// 2. A function to check the current state of the board
export function getBoardState() {
    // This returns an 8x8 array detailing exactly what piece is on what square.
    // We will use this later to tell Three.js where to draw the 3D primitives.
    return game.board(); 
}

// 3. A function to attempt a move
export function attemptMove(sourceSquare, targetSquare) {
    // We ask chess.js to try making the move (e.g., "e2" to "e4")
    const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to a queen for now to keep it simple
    });

    // If the move is illegal, chess.js returns null
    if (move === null) {
        console.log(`Illegal move: ${sourceSquare} to ${targetSquare}`);
        return false; 
    }

    // If the move is legal, update the status and return true
    console.log(`Success! Moved from ${sourceSquare} to ${targetSquare}`);
    updateStatus();
    return true; 
}

// 4. A function to update our HTML UI text
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

    // Update the DOM element we created in index.html
    document.getElementById('status').innerText = statusHTML;
}

// 5. Run the status update once at the start to set the text to "White to move"
updateStatus();
