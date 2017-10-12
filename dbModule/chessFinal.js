const util = require('./util');

const douyu = {
    listPrefix: '/video/video/listData',
    actionType: ['hot', 'new', 'num'],
    para: ['cate1Id', 'cate2Id', 'page', 'action']
}
const piexeAvailMapObj = {
    bs: [40, 60, 51, 42, 62],
    bx: [12, 30, 34, 52, 70, 74, 92],
    bj: [40, 41, 42, 50, 51, 52, 60, 61, 62],
    rs: [49, 69, 58, 47, 67],
    rx: [17, 39, 35, 57, 79, 75, 97],
    rj: [49, 48, 47, 59, 58, 57, 69, 68, 67],
}


var local = {
    parseWithProp: function (src, key) {
        if (!src)return '';
        var obj = JSON.parse(src);
        return obj && obj[key] ? obj[key] : {}
    },
    getHorseNextPos(board, curPos){
        let cC = curPos % 10, cR = parseInt(curPos / 10);
        let finalArr = [];
        if (!board.matrix[cC - 1 + '' + cR]) {
            finalArr.push([cC - 2, cR - 1]).push([cC - 2, cR + 1]);
        }
        if (!board.matrix[cC + 1 + '' + cR]) {
            finalArr.push([cC + 2, cR - 1]).push([cC + 2, cR + 1])
        }
        if (!board.matrix[cC + '' + (cR - 1)]) {
            finalArr.push([cC - 1, cR - 2]).push([cC + 1, cR - 2])
        }
        if (!board.matrix[cC + '' + (cR + 1)]) {
            finalArr.push([cC - 1, cR + 2]).push([cC + 1, cR + 2])
        }
        return finalArr.filter(arr => {
            return arr[0] > 0 && arr[0] < 10 && arr[1] > -1 && arr[1] < 10;
        }).map(arr => {
            return arr[0] * 10 + arr[1]
        });
    },
    getBishopNextPos(board, curPos){
        let cC = curPos % 10, cR = parseInt(curPos / 10);
        let finalArr = [];
        if (!board.matrix[cC - 1 + '' + (cR - 1)]) {
            finalArr.push([cC - 2, cR - 2]);
        }
        if (!board.matrix[cC - 1 + '' + (cR + 1)]) {
            finalArr.push([cC - 2, cR + 2])
        }
        if (!board.matrix[cC + 1 + '' + (cR - 1)]) {
            finalArr.push([cC + 2, cR - 2])
        }
        if (!board.matrix[cC + 1 + '' + (cR + 1)]) {
            finalArr.push([cC + 2, cR + 2])
        }
        return finalArr.filter(arr => {
            if ((col - 4.5) * (arr[0] - 4.5) < 0) {
                return false;
            }
            return arr[0] > 0 && arr[0] < 10 && arr[1] > -1 && arr[1] < 10;
        }).map(arr => {
            return arr[0] * 10 + arr[1]
        });
    },
    parseBoard(srcObj, step){
        let board = {matrix: {}, piece: {}, step: step, status: ''};
        for (let key in srcObj) {
            let pieceName = srcObj[key], pos = parseInt(key);

            board.piece[pieceName] = board.piece[pieceName] || [];
            board.piece[pieceName].push(pos);
            board.matrix[pos] = pieceName;
        }

    },
    isRedChecking(board){

    },
    isBlackChecking(board){

    },
    getAllNextCheckingBoard(board){
        return [];
    }
}
var socket = {
    chessValidateBoard: function (req) {
        let reqObj = req || {};
        let errorObj = {}, result = true;
        console.log(reqObj);
        for (let key in reqObj) {
            let pieceName = reqObj[key], pos = parseInt(key), isValid = true;

            if (piexeAvailMapObj[pieceName]) {
                if (piexeAvailMapObj[pieceName].indexOf(pos) == -1) {
                    isValid = false;
                }
                //pending 兩兵咯一塊
            } else if (pieceName == 'bb' && (pos % 10 < 4 && [13, 14, 33, 34, 53, 54, 73, 74, 93, 94].indexOf(pos) == -1)) {
                isValid = false;
            } else if (pieceName == 'rb' && (pos % 10 > 6 && [15, 16, 35, 36, 55, 56, 75, 76, 95, 96].indexOf(pos) == -1)) {
                isValid = false;
            }
            if (!isValid) {
                result = false;
                errorObj[key] = pieceName;
            }
        }

        return {result: result, data: errorObj};
    },
    chessStartBoard: function (req) {
        let validBoard = socket.chessValidateBoard(req);
        if (!validBoard.result) {
            return {result: false, data: [], text: "invalid board"};
        }


    }
}
module.exports = {func: local, socket: socket}