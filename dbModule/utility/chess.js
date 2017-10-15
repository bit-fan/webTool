const pieceNameList = ['rc', 'rm', 'rp', 'rb', 'rs', 'rx', 'rj', 'bc', 'bm', 'bp', 'bb', 'bs', 'bx', 'bj'];
const pieceInfoObj = {
    bb: {minCount: 0, maxCount: 5},
    bc: {minCount: 0, maxCount: 2},
    bj: {minCount: 1, maxCount: 1},
    bm: {minCount: 0, maxCount: 2},
    bp: {minCount: 0, maxCount: 2},
    bs: {minCount: 0, maxCount: 2},
    bx: {minCount: 0, maxCount: 2},

    rb: {minCount: 0, maxCount: 5},
    rc: {minCount: 0, maxCount: 2},
    rj: {minCount: 1, maxCount: 1},
    rm: {minCount: 0, maxCount: 2},
    rp: {minCount: 0, maxCount: 2},
    rs: {minCount: 0, maxCount: 2},
    rx: {minCount: 0, maxCount: 2}
}
const rbPosbeforeRiver = [15, 16, 35, 36, 55, 56, 75, 76, 95, 96];
const bbPosbeforeRiver = [13, 14, 33, 34, 53, 54, 73, 74, 93, 94];

//     } else if (pieceName == 'bb' && (pos % 10 < 4 && [13, 14, 33, 34, 53, 54, 73, 74, 93, 94].indexOf(pos) == -1)) {
//         isValid = false;
//     } else if (pieceName == 'rb' && (pos % 10 > 6 && [15, 16, 35, 36, 55, 56, 75, 76, 95, 96].indexOf(pos) == -1)) {
//         isValid = false;
//     }


const piexeAllowPosObj = {
    bs: [40, 60, 51, 42, 62],
    bx: [12, 30, 34, 52, 70, 74, 92],
    bj: [40, 41, 42, 50, 51, 52, 60, 61, 62],
    rs: [49, 69, 58, 47, 67],
    rx: [17, 39, 35, 57, 79, 75, 97],
    rj: [49, 48, 47, 59, 58, 57, 69, 68, 67],
}
var self = module.exports = {
    chunkStr(str, len){
        let newA = Array.from(str).reduce((ar, it, i) => {
            const ix = Math.floor(i / len);
            ar[ix] = ar[ix] || "";
            ar[ix] += it;
            return ar;
        }, []);
        return newA;
    },
    cloneArr(src, idx, val){
        let newArr = Array.from(src);
        newArr[idx] = val;
        return newArr;
    },
    getPosArrFromKey(key){
        return self.chunkStr(key, 2);
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
            let x1 = parseInt(cur[0]), y1 = parseInt(cur[1]), x2 = parseInt(x[0]), y2 = parseInt(x[1]);
            let resultArr = [];
            if (x1 !== x2 && y1 !== y2) {
                return 'differentLine';
            } else if (x1 == x2) {
                for (let i = Math.min(y1, y2) + 1; i < Math.max(y1, y2); i++) {
                    let toAdd = '' + x1 + i;
                    arr.indexOf(toAdd) != -1 ? resultArr.push(toAdd) : '';
                }
                return resultArr;
            } else if (y1 == y2) {
                for (let i = Math.min(x1, x2) + 1; i < Math.max(x1, x2); i++) {
                    let toAdd = '' + i + y1;
                    arr.indexOf(toAdd) != -1 ? resultArr.push(toAdd) : '';
                }
                return resultArr;
            }
        }
    },

    isBoardObjValid(obj){
        let pieceObj = {}, matrix = {}, allValid = true, boardKey = '';
        let rbPosList = Array.from(rbPosbeforeRiver);
        let bbPosList = Array.from(bbPosbeforeRiver);

        let errorObj = {
            'invalidPiece': [], 'invalidPos': [], 'duplicatePos': [], 'invalidQty': []
        };
        for (let key in obj) {
            let pieceName = obj[key], pos = parseInt(key), isValid = true;
            if (pieceNameList.indexOf(pieceName) == -1) {
                errorObj['invalidPiece'].push(pieceName);
                isValid = false;
                allValid = false;
            }
            if (pos < 10 || pos > 99) {
                errorObj['invalidPos'].push(key);
                isValid = false;
                allValid = false;
            } else if (piexeAllowPosObj[pieceName] && piexeAllowPosObj[pieceName].indexOf(pos) == -1) {
                errorObj['invalidPos'].push(key);
                isValid = false;
                allValid = false;
            } else if (pieceName == 'rb') {
                if (pos % 10 < 4) {

                } else if (rbPosList.indexOf(pos) != -1) {
                    rbPosList = rbPosList.filter(item => {
                        return parseInt(item / 10) != parseInt(pos / 10);
                    })
                } else {
                    errorObj['invalidPos'].push(key);
                    isValid = false;
                    allValid = false;
                }
            } else if (pieceName == 'bb') {
                if (pos % 10 > 6) {

                } else if (bbPosList.indexOf(pos) != -1) {
                    bbPosList = bbPosList.filter(item => {
                        return parseInt(item / 10) != parseInt(pos / 10);
                    })
                } else {
                    errorObj['invalidPos'].push(key);
                    isValid = false;
                    allValid = false;
                }
            }
            if (matrix[key] && matrix[key].length > 1) {
                errorObj['duplicatePos'].push(key);
                isValid = false;
                allValid = false;
            }
            if (isValid) {
                matrix[key] = matrix[key] || [];
                matrix[key].push(pieceName);
                pieceObj[pieceName] = pieceObj[pieceName] || '';
                pieceObj[pieceName] += key;
            }
        }
        for (let piece in pieceInfoObj) {
            if (!pieceObj[piece] && pieceInfoObj[piece].minCount == 0) {
                //err
            } else if (pieceObj[piece] && pieceObj[piece].length <= 2 * pieceInfoObj[piece].maxCount) {

            } else {
                errorObj.invalidQty.push(piece);
                allValid = false;
            }

        }
        if (allValid) {
            for (let i = 0; i < pieceNameList.length; i++) {
                let pieceName = pieceNameList[i];
                let count = pieceInfoObj[pieceName].maxCount;
                let newStr = (pieceObj[pieceName] || '0000').concat("0000000000000").slice(0, 2 * count);
                console.log('newStr', pieceName, newStr);
                boardKey += newStr;
            }
        }
        let posArr = self.getPosArrFromKey(boardKey, 2);
        if (allValid) {
            let meet = self.boardUtil('between', posArr, posArr[15], posArr[31]);
            if (meet) {
                allValid = false;
                errorObj.invalidPos.push(posArr[15]).push(posArr[31]);
            }
        }

        return {
            boardKey: boardKey,
            error: errorObj,
            isValid: allValid
        }
    },
    getAllNextCheckingBoard(posArr, side){
        let nextboardObj = {};
        let nextStepArr = [];
        let offset = side === 'r' ? 0 : 16
        for (let i = offset; i < 15 + offset; i++) {
            let newBoardKeys = [];
            if (i == 0 || i == 1) {
                newBoardKeys = self.getCastleNextPos(posArr, posArr[i]);
            }
            // if (i == 2 || i == 3) {
            //     newBoardKeys = self.getKnightNextPos(posArr, posArr[i]);
            // }
            // if (i == 4 || i == 5) {
            //     newBoardKeys = self.getCannonNextPos(posArr, posArr[i]);
            // }
            // if (i > 5 || i < 11) {
            //     newBoardKeys = self.getPawnNextPos(posArr, posArr[i]);
            // }
            // if (i == 11 || i == 12) {
            //     newBoardKeys = self.getAdvisoryNextPos(posArr, posArr[i]);
            // }
            // if (i == 13 || i == 14) {
            //     newBoardKeys = self.getBishopNextPos(posArr, posArr[i]);
            // }
            nextStepArr = nextStepArr.concat(newBoardKeys);
        }
        return nextStepArr.filter(posArr => {
            console.log('nextPos', posArr.join());
            // let rCheck= self.isChecking('r', posArr);
            return self.isChecking(side, posArr) && !self.isChecking(side === 'r' ? 'b' : 'r', posArr);
        });
    },

    // parseBoardToStr(obj){
    //     function concat(src, key, size) {
    //         if (size == 0) {
    //             return src;
    //         }
    //         let item = (obj[key] && obj[key].length + 1 > size) ? obj[key][size - 1] : '00';
    //         // console.log(item);
    //         return concat(src += item, key, size - 1);
    //     }
    //
    //     let str = '';
    //
    //     str = concat(str, 'rc', 2);
    //     str = concat(str, 'rm', 2);
    //     str = concat(str, 'rp', 2);
    //     str = concat(str, 'rb', 5);
    //     str = concat(str, 'rj', 1);
    //     str = concat(str, 'rs', 2);
    //     str = concat(str, 'rx', 2);
    //
    //     str = concat(str, 'bc', 2);
    //     str = concat(str, 'bm', 2);
    //     str = concat(str, 'bp', 2);
    //     str = concat(str, 'bb', 5);
    //     str = concat(str, 'bj', 1);
    //     str = concat(str, 'bs', 2);
    //     str = concat(str, 'bx', 2);
    //
    //     console.log(str);
    //     if (str.length == 64) {
    //         return {valid: true, str: str};
    //     } else {
    //         return {valid: false, str: ''}
    //     }
    // },
    parseBoardKeytoArr(str){
        let pos = chunkStr(str, 2);
        if (pos.length != 32) {
            debugger;
            console.log('invalid parse str', str);
        }
        return pos;
        // return {
        //     valid: true, posArr1: {
        //         bb: [pos[6], pos[7], pos[8], pos[9], pos[10]],
        //         bc: [pos[0], pos[1]],
        //         bj: [pos[11]],
        //         bm: [pos[2], pos[3]],
        //         bp: [pos[4], pos[5]],
        //         bs: [pos[12], pos[13]],
        //         bx: [pos[14], pos[15]],
        //
        //         rb: [pos[22], pos[23], pos[24], pos[25], pos[26]],
        //         rc: [pos[16], pos[17]],
        //         rj: [pos[27]],
        //         rm: [pos[18], pos[19]],
        //         rp: [pos[20], pos[21]],
        //         rs: [pos[28], pos[29]],
        //         rx: [pos[30], pos[31]]
        //     }, posArr: pos
        // };
    },
    parseBoardArrtoKey(arr){

    },
    getNewArrAfterMoving(oriArr, pos1, pos2){
        let idx = oriArr.indexOf(pos1);
        let newArr = Array.from(oriArr);
        newArr.splice(idx, 1, pos2);
        return newArr;
    },
    isChecking(side, posArr){
        let jPos = side == 'r' ? posArr[31] : posArr[15];
        let jPosX = parseInt(jPos[0]), jPosY = parseInt(jPos[1]);
        let offset = side == 'r' ? 0 : 16;
        if (self.boardUtil('between', posArr, posArr[15], posArr[31]) === []) {
            return true;
        }
        console.log('checking check', posArr.join());
        for (let i = 0; i < 11; i++) {
            console.log('cur', i, posArr[i + offset]);
            if (posArr[i + offset] === '00') {
                continue;
            }
            let pos = posArr[i + offset];
            //check castle
            if (i === 0 || i === 1) {
                let castle = self.boardUtil('between', posArr, pos, jPos);
                if (castle.length == 0) {
                    return true;
                }
            }
            //check knight
            if (i === 2 || i === 3) {
                let knightX = parseInt(pos[0]), knightY = parseInt(pos[1]);
                if ((knightX - jPosX) * (knightX - jPosX) + (knightY - jPosY) * (knightY - jPosY) !== 5) {
                    continue;
                }
                //check knight hinder
                let midX = (knightX + jPosX) / 2;
                let midY = (knightY + jPosY) / 2;
                if ((midX - knightX) * (midX - knightX) < 1) {
                    midX = knightX;
                } else if ((midY - knightY) * (midY - knightY) < 1) {
                    midY = knightY;
                }
                if (posArr.indexOf('' + midX + midY) == -1) {
                    return true;
                }
            }
        }

        return false;
    },
    getCastleNextPos(pieceArr, curPos){
        if (curPos == "00") {
            return [];
        }
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
        let afterArr = nextArr.filter(item => {
            if (self.boardUtil('between', pieceArr, curPos, item).length > 0) {
                return false;
            }
            let testSide = self.boardUtil('side', pieceArr, item);
            if (testSide && testSide == side) {
                return false;
            }
            return true;
        })
        return afterArr.map(pos => {
            return self.getNewArrAfterMoving(pieceArr, curPos, pos);
        });
    },
}
