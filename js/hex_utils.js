// js/hex_utils.js
export const HexUtils = {
    getNeighbors: function(r, c, maxRow, maxCol) {
        const neighbors = [];
        const isEvenRow = (r % 2 === 0); 

        // [핵심] game.js의 렌더링 방식과 일치하는 오프셋
        const offsets = isEvenRow 
            ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]] // 짝수 행
            : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];  // 홀수 행

        for (let [dr, dc] of offsets) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < maxRow && nc >= 0 && nc < maxCol) {
                neighbors.push({ r: nr, c: nc, index: nr * maxCol + nc });
            }
        }
        return neighbors;
    }
};