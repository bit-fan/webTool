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

const boardObj = {
    bb: [],
    bc: [],
    bj: [],
    bm: [],
    bp: [],
    bs: [],
    bx: [],

    rb: [],
    rc: [],
    rj: [],
    rm: [],
    rp: [],
    rs: [],
    rx: []
}

var local = {
    parseStrToBoard(str){
        //车2马2炮2兵5将1士2象2
        let pos = util.chunkStr(str, 2);
        if (pos.length != 32) {
            return {valid: false, data: {}};
        }
        return {
            valid: true, posArr1: {
                bb: [pos[6], pos[7], pos[8], pos[9], pos[10]],
                bc: [pos[0], pos[1]],
                bj: [pos[11]],
                bm: [pos[2], pos[3]],
                bp: [pos[4], pos[5]],
                bs: [pos[12], pos[13]],
                bx: [pos[14], pos[15]],

                rb: [pos[22], pos[23], pos[24], pos[25], pos[26]],
                rc: [pos[16], pos[17]],
                rj: [pos[27]],
                rm: [pos[18], pos[19]],
                rp: [pos[20], pos[21]],
                rs: [pos[28], pos[29]],
                rx: [pos[30], pos[31]]
            }, posArr: pos
        };
    },
    parseBoardToStr(obj){
        function concat(src, key, size) {
            if (size == 0) {
                return src;
            }
            let item = (obj[key] && obj[key].length + 1 > size) ? obj[key][size - 1] : '00';
            // console.log(item);
            return concat(src += item, key, size - 1);
        }

        let str = '';

        str = concat(str, 'rc', 2);
        str = concat(str, 'rm', 2);
        str = concat(str, 'rp', 2);
        str = concat(str, 'rb', 5);
        str = concat(str, 'rj', 1);
        str = concat(str, 'rs', 2);
        str = concat(str, 'rx', 2);

        str = concat(str, 'bc', 2);
        str = concat(str, 'bm', 2);
        str = concat(str, 'bp', 2);
        str = concat(str, 'bb', 5);
        str = concat(str, 'bj', 1);
        str = concat(str, 'bs', 2);
        str = concat(str, 'bx', 2);

        console.log(str);
        if (str.length == 64) {
            return {valid: true, str: str};
        } else {
            return {valid: false, str: ''}
        }
    },
    getPos(type, cur, x, y, para1, para2){
        if (type == 'offset') {
            x += parseInt(cur[0]);
            y += parseInt(cur[1]);
            if (x < 1 || x > 9 || y < 0 || y > 9) {
                return false;
            } else {
                return '' + x + y;
            }
        } else if (type == "march") {
            let item = local.getPos("offset", cur, x, y);
            if (item) {
                return getPos("march", item, x, y).push(item);
            } else {
                return [];
            }
        }
    },
    boardUtil(type, arr, cur, x, y){
        if (type == "isExist") {
            return arr.indexOf(cur) > -1;
        } else if (type == "side") {
            let idx = arr.indexOf(cur);
            if (idx == -1) {
                return null;
            } else {
                return idx < 16 ? 'r' : 'b';
            }
        } else if (type == "between") {
            let x1 = parseInt(cur / 10), y1 = cur % 10, x2 = parseInt(x / 10), y2 = x % 10;
            let resultArr = [];
            if (x1 != x2 && y1 != y2) {
                return [];
            } else if (x1 == x2) {
                for (let i = Math.min(y1, y2); i < Math.max(y1, y2); i++) {
                    resultArr.push('' + x1 + i);
                }
                return resultArr;
            } else if (y1 == y2) {
                for (let i = Math.min(x1, x2); i < Math.max(x1, x2); i++) {
                    resultArr.push('' + i + x1);
                }
                return resultArr;
            }
        }
    },
    getCastleNextPos(pieceArr, curPos){
        let side = pieceArr.indexOf(curPos) < 16 ? 'r' : 'b';
        let nextArr = [];
        let curX = parseInt(curPos / 10), curY = curPos % 10;
        for (let i = 0; i < 10; i++) {
            if (i != 0) {
                nextArr.push(('' + curX + i));
                nextArr.push(('' + i + curY));
            } else {
                nextArr.push(curX + '0');
            }
        }
        console.log('pre next', nextArr);
        return nextArr.filter(item => {
            if (item == curPos) {
                return false
            }
            if (local.boardUtil('between', pieceArr, curPos, item).length > 0) {
                return false;
            }
            let testSide = local.boardUtil('isExist', pieceArr, item);
            if (testSide && testSide == side) {
                return false;
            }
            return true;
        })
    },

    getHorseNextPos(pieceArr, curPos){
        let cC = curPos % 10, cR = parseInt(curPos / 10);
        let finalArr = [];
        if (!board.matrix[local.getPos('offset', curPos, -1, 0)]) {
            finalArr.push(local.getPos('offset', curPos, -2, -1)).push(local.getPos('offset', curPos, -2, 1));
        }
        if (!board.matrix[local.getPos('offset', curPos, 1, 0)]) {
            finalArr.push([cC + 2, cR - 1]).push([cC + 2, cR + 1])
        }
        if (!board.matrix[local.getPos('offset', curPos, 0, -1)]) {
            finalArr.push([cC - 1, cR - 2]).push([cC + 1, cR - 2])
        }
        if (!board.matrix[local.getPos('offset', curPos, 0, 1)]) {
            finalArr.push([cC - 1, cR + 2]).push([cC + 1, cR + 2])
        }
        return finalArr.filter(arr => {
            return arr != false;
        });
    },
    getBishopNextPos(board, curPos)
    {
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
    parseBoard(srcObj, step)
    {
        let board = {matrix: {}, piece: {}, step: step, status: ''};
        for (let key in srcObj) {
            let pieceName = srcObj[key], pos = parseInt(key);

            board.piece[pieceName] = board.piece[pieceName] || [];
            board.piece[pieceName].push(pos);
            board.matrix[pos] = pieceName;
        }

    },
    getSolution(solObj, step){
        console.log('solObj', solObj);
        let found = false;
        for (let boardKey in solObj) {
            let nextboardArr = [];
            if (solObj[boardKey].step == step) {
                found = true;
                if (!solObj[boardKey].status) {
                    solObj[boardKey].posArr = local.parseStrToBoard(boardKey).posArr;
                    solObj[boardKey].status = 'hasNext';
                }
                if (step % 2 == 0) {
                    nextboardArr = local.getAllNextCheckingBoard(solObj, boardKey);
                } else {
                    nextboardArr = local.getAllNextEscapingBoard(solObj, boardKey);
                }
                nextboardArr.forEach(board => {
                    solObj[board.boardKey] = {
                        piece: board.piece,
                        from: boardKey,
                        stepId: step + 1,
                        status: board.status
                    }
                });
                if (nextboardArr.length == 0) {
                    solObj[boardKey].status = "dead";
                } else {
                    solObj[boardKey].nextKeyArr = nextboardArr.map(item => item.boardKey);
                }

            }
        }
        if (found) {
            return local.getSolution(solObj, step + 1)
        } else {
            return local.minifySol(solObj, step);
        }

    },
    minifySol(solObj, curStep){
        if (curStep == 0) {
            return solObj;
        } else {
            //simpl
            return local.minifySol(solObj, curStep - 1);
        }
    },
    isRedChecking(board, piecesObj)
    {

    },
    isBlackChecking(board, piecesObj)
    {

    },
    getAllNextCheckingBoard(solObj, boardKey)
    {
        let posArr = solObj[boardKey].posArr;
        if (posArr[0] != 0) {
            console.log('next catle', local.getCastleNextPos(posArr, posArr[0]));
        }
        if (posArr[1] != 0) {
            console.log(local.getCastleNextPos(posArr, posArr[1]));
        }

        return [];
    },
    getAllNextEscapingBoard(boardKey, piecesObj){

    }
}
var socket = {
    chessValidateBoard: function (req) {
        let reqObj = req || {};
        let errorObj = {}, result = true;
        let parseObj = JSON.parse(JSON.stringify(boardObj));
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
                parseObj[pieceName] = parseObj[pieceName] || [];
                parseObj[pieceName].push(key);
            } else {
                parseObj[pieceName] = parseObj[pieceName] || [];
                parseObj[pieceName].push(key);
            }
        }
        console.log('parse', local.parseBoardToStr(parseObj));

        return {
            result: result,
            data: errorObj,
            parseStr: result ? local.parseBoardToStr(parseObj).str : ''
        };
    },
    chessStartBoard: function (req) {
        let validBoard = socket.chessValidateBoard(req);
        if (!validBoard.result) {
            return {result: false, data: [], text: "invalid board"};
        }
        let solObj = {};
        solObj[validBoard.parseStr] = {
            nextBoardArr: [],
            step: 0,
            from: null,
            result: 'working',//'done','nosolution'
        }
        local.getSolution(solObj, 0);


    }
}
module.exports = {func: local, socket: socket}