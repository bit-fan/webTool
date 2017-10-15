const util = require('./utility/util');
const Chess = require('./utility/chess');

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
var redNotCheckingArr = [];

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

    getCastleNextPos(pieceArr, curPos){
        let side = pieceArr.indexOf(curPos) < 16 ? 'r' : 'b';
        let nextArr = [];
        let curX = parseInt(curPos[0]), curY = parseInt(curPos[1]);
        for (let i = 0; i < 10; i++) {
            if (i != 0) {
                nextArr.push(('' + curX + i));
                nextArr.push(('' + i + curY));
            } else {
                nextArr.push(curX + '0');
            }
        }
        console.log('pre next', nextArr, curPos);
        return nextArr.filter(item => {
            // if (item == curPos) {
            //     return false
            // }
            if (local.boardUtil('between', pieceArr, curPos, item).length > 0) {
                console.log('item between fail', item, local.boardUtil('between', pieceArr, curPos, item))
                return false;
            }
            let testSide = local.boardUtil('side', pieceArr, item);
            if (testSide && testSide == side) {
                console.log('item side fail', item)
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
        console.log('solObj in step', step, solObj);
        let foundBoard = false;
        for (let boardKey in solObj) {
            let nextboardArr = [];
            if (solObj[boardKey].step == step) {
                foundBoard = true;
                solObj[boardKey].posArr = solObj[boardKey].posArr || Chess.getPosArrFromKey(boardKey);
                solObj[boardKey].nextAllKey = [];
                solObj[boardKey].nextWinKey = {};
                solObj[boardKey].nextLoseKey = {};
                if (step % 2 == 0) {
                    nextboardArr = Chess.getAllNextCheckingBoard(solObj[boardKey].posArr, 'r');
                } else {
                    nextboardArr = Chess.getAllNextEscapingBoard(solObj[boardKey].posArr, 'b');
                }
                let hasNextKey = false;
                for (let i = 0; i < nextboardArr.length; i++) {
                    let newKey = nextboardArr[i].join('');
                    if (!solObj[newKey]) {
                        solObj[newKey] = {
                            posArr: nextboardArr[i],
                            from: boardKey,
                            step: step + 1
                        }
                        solObj[boardKey].nextAllKey.push(newKey);
                        hasNextKey = true;
                    } else {

                    }
                }
                if (!hasNextKey) {
                    solObj[boardKey].status = (step % 2 === 0) ? 'bWin' : 'rWin';
                }
            }
        }
        if (foundBoard) {
            return local.getSolution(solObj, step + 1);
        } else {
            return solObj;
        }
    },

    simplifySol(solObj){
        let maxStep = 0;
        let startKey = 0;
        for (let key in solObj) {
            if (solObj[key].step > maxStep) {
                maxStep = solObj[key].step
            }
            if (solObj[key].step == 0) {
                startKey = key;
            }
        }
        console.log(maxStep);
        for (let curStep = maxStep; curStep > 0; curStep--) {
            let curRound = curStep % 2 === 0 ? 'r' : 'b';
            let oppoRound = curStep % 2 === 0 ? 'b' : 'r';
            for (let key in solObj) {
                let thisObj = solObj[key];
                if (thisObj.step == curStep) {
                    let fromObj = solObj[thisObj.from];
                    let curStatus = thisObj.status ? thisObj.status.toString() : '';
                    if (curStatus === curRound + 'Win') {
                        fromObj.nextLoseKey[key] = curStep;
                        fromObj.maxLose = fromObj.maxLose || -1;
                        fromObj.maxLose = Math.max(fromObj.maxLose, curStep);
                    } else if (curStatus === oppoRound + 'Win') {
                        fromObj.nextWinKey[key] = curStep;
                        fromObj.minWin = fromObj.minWin || 9999999;
                        fromObj.minWin = Math.min(fromObj.minWin, curStep);
                    } else if (thisObj.minWin) {
                        fromObj.nextLoseKey[key] = thisObj.minWin;
                        fromObj.maxLose = fromObj.maxLose || -1;
                        fromObj.maxLose = Math.max(fromObj.maxLose, thisObj.minWin);
                    } else if (thisObj.maxLose) {
                        fromObj.nextWinKey[key] = thisObj.maxLose;
                        fromObj.minWin = fromObj.minWin || 9999999;
                        fromObj.minWin = Math.min(fromObj.minWin, thisObj.maxLose);
                        // } else {
                        //     fromObj.nextLoseKey[key] = thisObj.maxLose;
                        //     fromObj.maxLose = fromObj.maxLose || -1;
                        //     fromObj.maxLose = Math.max(fromObj.maxLose, thisObj.maxLose);
                        //
                        //     fromObj.nextWinKey[key] = thisObj.minWin;
                        //     fromObj.minWin = fromObj.minWin || 9999999;
                        //     fromObj.minWin = Math.min(fromObj.minWin, thisObj.minWin);
                    }
                }
            }
        }
        return {startKey: startKey, data: solObj};
    },
}
var socket = {
    chessValidateBoard: function (req) {
        let reqObj = req || {};
        let errorObj = {}, result = true;
        let parseObj = JSON.parse(JSON.stringify(boardObj));
        console.log(reqObj);

        return Chess.isBoardObjValid(req);
    },
    chessStartBoard: function (reqKey) {

        let solObj = {};
        solObj[reqKey] = {
            posArr: Chess.getPosArrFromKey(reqKey),
            step: 0,
            from: null
        }
        if (Chess.isChecking('b', solObj[reqKey].posArr)) {
            return 'b is checking';
        } else {
            solObj = local.getSolution(solObj, 0);
        }
        console.log('--------------------------', solObj);
        return local.simplifySol(solObj);
    }
}
module.exports = {func: local, socket: socket}