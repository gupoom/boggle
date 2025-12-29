// board_strategies.js
import { HexUtils } from './hex_utils.js';

export const BoardStrategies = {
    square: { // [유지] 사각형 8방향 로직
        getNeighbors: (r, c, rows, cols) => {
            const neighbors = [];
            const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
            for (let [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    neighbors.push({ r: nr, c: nc });
                }
            }
            return neighbors;
        }
    },
    hex: { // [수정] 육각형 전문 엔진으로 위임
        getNeighbors: (r, c, rows, cols) => {
            return HexUtils.getNeighbors(r, c, rows, cols);
        }
    }
};