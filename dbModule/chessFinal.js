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

    // getCastleNextPos(pieceArr, curPos){
    //     let side = pieceArr.indexOf(curPos) < 16 ? 'r' : 'b';
    //     let nextArr = [];
    //     let curX = parseInt(curPos[0]), curY = parseInt(curPos[1]);
    //     for (let i = 0; i < 10; i++) {
    //         if (i != 0) {
    //             nextArr.push(('' + curX + i));
    //             nextArr.push(('' + i + curY));
    //         } else {
    //             nextArr.push(curX + '0');
    //         }
    //     }
    //     console.log('pre next', nextArr, curPos);
    //     return nextArr.filter(item => {
    //         // if (item == curPos) {
    //         //     return false
    //         // }
    //         if (local.boardUtil('between', pieceArr, curPos, item).length > 0) {
    //             console.log('item between fail', item, local.boardUtil('between', pieceArr, curPos, item))
    //             return false;
    //         }
    //         let testSide = local.boardUtil('side', pieceArr, item);
    //         if (testSide && testSide == side) {
    //             console.log('item side fail', item)
    //             return false;
    //         }
    //         return true;
    //     })
    // },


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
    getFromObj(obj, curKey){
        return obj[obj[curKey].from];
    },
    getSolution(solObj, step, checkKey){
        if (checkKey.length == 0) {
            return solObj;
        }
        let checkNowKey = [], nextCheckKey = [];
        while (checkKey.length > 0) {

            let thisBoardKey = checkKey[0], curRound = thisBoardKey[0];
            let thisBoardObj = solObj.boardList[thisBoardKey];
            let nextboardArr = [];
            if (thisBoardKey.startsWith('r')) {
                nextboardArr = Chess.getAllNextCheckingBoard(solObj.boardList[thisBoardKey].posArr, 'r');
            } else {
                nextboardArr = Chess.getAllNextEscapingBoard(solObj.boardList[thisBoardKey].posArr, 'b');
            }
            thisBoardObj.nextListed = true;

            if (nextboardArr.length === 0) {
                if (curRound == 'r') {
                    thisBoardObj.status = 'bLastWin';
                    thisBoardObj.minWin = 1;
                } else {
                    thisBoardObj.status = 'rLastWin';
                    thisBoardObj.maxLose = 1;
                }
                checkNowKey = checkNowKey.concat(thisBoardObj.from);
            } else {
                nextboardArr.forEach(posArr => {
                    let newKey = (curRound == 'r' ? 'b' : 'r') + posArr.join('');
                    if (solObj.boardList[newKey]) {
                        solObj.boardList[newKey].from.push(thisBoardKey);
                    } else {
                        solObj.boardList[newKey] = {
                            posArr: posArr,
                            from: [thisBoardKey],
                            step: thisBoardObj.step + 1,
                            nextListed: false,
                            nextAllKey: [],
                            nextWinKey: [],
                            nextLoseKey: []
                        }
                        nextCheckKey.push(newKey)
                    }
                    solObj.boardList[thisBoardKey].nextAllKey.push(newKey);

                })
            }
            checkKey.splice(0, 1);
            while (checkNowKey.length > 0) {
                let thisKeyObj = solObj.boardList[checkNowKey[0]];
                let thisRound = checkNowKey[0][0];
                let oppoRound = thisRound == 'r' ? 'b' : 'r';
                let newNextAllKey = [];
                let hasChange = false;
                thisKeyObj.nextAllKey.forEach(childKey => {
                    let childObj = solObj.boardList[childKey];
                    let childStatus = childObj.status;
                    if (childStatus && childStatus[0] === thisRound) {
                        if (childStatus === thisRound + 'LastWin') {
                            thisKeyObj.nextWinKey.push(childKey + '#' + 1);
                        } else {
                            thisKeyObj.nextWinKey.push(childKey + '#' + (1 + childObj.maxLose));
                        }
                        thisKeyObj.status = thisRound + 'Win';
                        thisKeyObj.minWin = thisKeyObj.minWin || 9999999999999;
                        thisKeyObj.minWin = Math.min(thisKeyObj.minWin, childObj.maxLose);
                        hasChange = true;
                    } else if (childStatus && childStatus[0] === oppoRound) {
                        if (childStatus === oppoRound + 'LastWin') {
                            thisKeyObj.nextLoseKey.push(childKey + '#' + 1);
                        } else {
                            thisKeyObj.nextLoseKey.push(childKey + '#' + (1 + childObj.minWin));
                        }
                        thisKeyObj.maxLose = thisKeyObj.maxLose || -1;
                        thisKeyObj.maxLose = Math.max(thisKeyObj.maxLose, childObj.minWin);
                        hasChange = true;
                    } else {
                        newNextAllKey.push(childKey);
                    }
                })
                thisKeyObj.nextAllKey = newNextAllKey;
                if (thisKeyObj.nextWinKey.length >= solObj.maxNumSolution) {
                    solObj.winList.push(checkNowKey[0]);
                }
                if (thisKeyObj.nextAllKey.length == 0 && thisKeyObj.nextWinKey.length == 0) {

                    thisKeyObj.maxLose = thisKeyObj.nextLoseKey.map(key => {
                        let arr = key.split('#');
                        return parseInt(arr[1]);
                    }).reduce((cur, prev) => {
                        return prev > cur ? prev : cur;
                    })
                    thisKeyObj.status = oppoRound + 'Win';
                    hasChange = true;
                }
                if (hasChange) {
                    checkNowKey = checkNowKey.concat(thisKeyObj.from);

                }
                checkNowKey.shift();
            }
        }
        return local.getSolution(solObj, step + 1, nextCheckKey);
    },
    generateSolutionList(solObj, solList){
        let appendArr = [];
        let change = false;
        for (let i = 0; i < solList.length; i++) {
            let keyArr = solList[i];
            let lastKey = keyArr.slice(-1);
            let lastKeyObj = solObj.boardList[lastKey];
            if (lastKeyObj.status && lastKeyObj.status.indexOf('LastWin') != -1) {
                appendArr.push(keyArr);
            } else if (lastKeyObj.nextWinKey.length > 0) {
                lastKeyObj.nextWinKey.forEach(newKey => {
                    if (keyArr.indexOf(newKey.split('#')[0]) === -1) {
                        let newArr = Array.from(keyArr);
                        newArr.push(newKey.split('#')[0]);
                        appendArr.push(newArr);
                        change = true;
                    }
                })
            } else if (lastKeyObj.nextLoseKey.length > 0) {
                lastKeyObj.nextLoseKey.forEach(newKey => {
                    if (keyArr.indexOf(newKey.split('#')[0]) === -1) {
                        let newArr = Array.from(keyArr);
                        newArr.push(newKey.split('#')[0]);
                        appendArr.push(newArr);
                        change = true;
                    }
                })
            }
        }
        if (change) {
            return local.generateSolutionList(solObj, appendArr);
        } else {
            return solList;
        }

    },

    simplifySol(solObj){
        // let finalObj = {};
        // let toAddKeys = [solObj.startKey];
        // while (toAddKeys.length > 0) {
        //     let newKey = toAddKeys.shift();
        //     let newObj = solObj.boardList[newKey];
        //
        //     let keyNameToAdd = newObj.nextWinKey.length > 0 ? 'nextWinKey' : 'nextLoseKey'
        //     let newKeyArr = newObj[keyNameToAdd].map(rawKey => {
        //         return rawKey.split('#');
        //     }).sort((a, b) => {
        //         return a[1] < b[1]
        //     }).slice(-solObj.maxNumSolution);
        //     let addObj = {
        //         nextSteps: []
        //     };
        //     newKeyArr.forEach(keyWin => {
        //         if (!finalObj[keyWin[0]]) {
        //             toAddKeys.push(keyWin[0]);
        //         }
        //         addObj.nextSteps.push({
        //             key: keyWin[0],
        //             name: Chess.getMoveName(newKey, keyWin[0]),
        //             step: keyWin[1]
        //         })
        //     })
        //
        //     finalObj[newKey] = addObj;
        // }
        let solList = local.generateSolutionList(solObj, [[solObj.startKey]]);
        return {startKey: solObj.startKey, solList: solList};//, steps: finalObj

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
        let solObj = {
            startKey: reqKey,
            boardList: {},
            winList: [],
            maxNumSolution: 3
        };
        solObj.boardList[reqKey] = {
            posArr: Chess.getPosArrFromKey(reqKey),
            step: 0,
            from: [],
            nextListed: false,
            nextAllKey: [],
            nextWinKey: [],
            nextLoseKey: []
        }

        solObj = local.getSolution(solObj, 0, [reqKey]);
        console.log('solObj', JSON.stringify(solObj));
        return local.simplifySol(solObj);
    }
}
module.exports = {func: local, socket: socket}