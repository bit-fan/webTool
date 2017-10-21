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
const piecePosName = 'ccmmppbbbbbssxxjccmmppbbbbbssxxj';
const piecePosArr = [4, 4, 4, 10, 4, 4, 2];
const rbPosbeforeRiver = [15, 16, 35, 36, 55, 56, 75, 76, 95, 96];
const bbPosbeforeRiver = [13, 14, 33, 34, 53, 54, 73, 74, 93, 94];

//     } else if (pieceName == 'bb' && (pos % 10 < 4 && [13, 14, 33, 34, 53, 54, 73, 74, 93, 94].indexOf(pos) == -1)) {
//         isValid = false;
//     } else if (pieceName == 'rb' && (pos % 10 > 6 && [15, 16, 35, 36, 55, 56, 75, 76, 95, 96].indexOf(pos) == -1)) {
//         isValid = false;
//     }
const allNextAdvisoryPos = {
    40: ["51"],
    60: ["51"],
    42: ["51"],
    62: ["51"],
    51: ["40", "60", "42", "62"],

    49: ["58"],
    69: ["58"],
    47: ["58"],
    67: ["58"],
    58: ["49", "69", "47", "67"],

}
const allNextBishopPos = {
    12: ["30", "34"],
    30: ["12", "52"],
    34: ["12", "52"],
    52: ["30", "34", "70", "74"],
    92: ["70", "74"],
    70: ["92", "52"],
    74: ["92", "52"],

    17: ["39", "35"],
    39: ["17", "57"],
    35: ["17", "57"],
    57: ["39", "35", "79", "75"],
    97: ["79", "75"],
    79: ["97", "57"],
    75: ["97", "57"],

}


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
        return self.chunkStr(key.slice(1), 2);
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
        } else if (type == 'offset') {
            let x1 = parseInt(cur[0]) + x, y1 = parseInt(cur[1]) + y;
            if (x1 < 1 || x1 > 9 || y1 < 0 || y1 > 9) {
                return false;
            } else {
                return '' + x + y;
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
        let pieceObj = {}, matrix = {}, allValid = true, boardKey = 'r';
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
                // console.log('newStr', pieceName, newStr);
                boardKey += newStr;
            }
        }
        let posArr = self.getPosArrFromKey(boardKey, 2);
        if (allValid) {
            let meet = self.boardUtil('between', posArr, posArr[15], posArr[31]);
            if (meet.length == 0) {
                allValid = false;
                errorObj.invalidPos.push(posArr[15]);
                errorObj.invalidPos.push(posArr[31]);
            }
        }

        return {
            boardKey: boardKey,
            error: errorObj,
            isValid: allValid
        }
    },
    getAllNextCheckingBoard(posArr, side){
        let nextStepArr = [];
        let offset = side === 'r' ? 0 : 16
        for (let j = offset; j < 16 + offset; j++) {
            let newBoardKeys = [];
            let i = j - offset;
            if (i == 0 || i == 1) {
                newBoardKeys = self.getCastleNextPos(posArr, posArr[j]);
            }
            if (i == 2 || i == 3) {
                newBoardKeys = self.getKnightNextPos(posArr, posArr[j]);
            }
            if (i == 4 || i == 5) {
                newBoardKeys = self.getCannonNextPos(posArr, posArr[j]);
            }
            if (i > 5 && i < 11) {
                newBoardKeys = self.getPawnNextPos(posArr, posArr[j]);
            }
            if (i == 11 || i == 12) {
                newBoardKeys = self.getAdvisoryNextPos(posArr, posArr[j]);
            }
            if (i == 13 || i == 14) {
                newBoardKeys = self.getBishopNextPos(posArr, posArr[j]);
            }
            nextStepArr = nextStepArr.concat(newBoardKeys);
        }
        return nextStepArr.filter(posArr => {
            // console.log('nextPos', posArr.join(''));
            // let rCheck= self.isChecking('r', posArr);
            return self.isChecking(side, posArr) && !self.isChecking(side === 'r' ? 'b' : 'r', posArr);
        });
    },
    getAllNextEscapingBoard(posArr, side){
        let nextStepArr = [];
        let offset = side === 'r' ? 0 : 16
        for (let j = offset; j < 16 + offset; j++) {
            let newBoardKeys = [];
            let i = j - offset;
            if (i == 0 || i == 1) {
                newBoardKeys = self.getCastleNextPos(posArr, posArr[j]);
            }
            if (i == 2 || i == 3) {
                newBoardKeys = self.getKnightNextPos(posArr, posArr[j]);
            }
            if (i == 4 || i == 5) {
                newBoardKeys = self.getCannonNextPos(posArr, posArr[j]);
            }
            if (i > 5 && i < 11) {
                newBoardKeys = self.getPawnNextPos(posArr, posArr[j]);
            }
            if (i == 11 || i == 12) {
                newBoardKeys = self.getAdvisoryNextPos(posArr, posArr[j]);
            }
            if (i == 13 || i == 14) {
                newBoardKeys = self.getBishopNextPos(posArr, posArr[j]);
            }
            if (i == 15) {
                newBoardKeys = self.getMarshalNextPos(posArr, posArr[j]);
            }
            nextStepArr = nextStepArr.concat(newBoardKeys);
        }
        return nextStepArr.filter(posArr => {
            // console.log('nextPos', posArr.join(''));
            // let rCheck= self.isChecking('r', posArr);
            let check = self.isChecking(side === 'r' ? 'b' : 'r', posArr)
            return !check;
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
    getValidNextMoveArr(oriArr, pos1, pos2Arr){
        if (pos1 == '00') {
            return [];
        }
        let nextArr = [], side1 = oriArr.indexOf(pos1) > 15 ? 'b' : 'r';
        pos2Arr.forEach(pos2 => {
            let newArr = Array.from(oriArr);
            let side2 = oriArr.indexOf(pos2);
            if (side2 < 16 && side1 == 'b') {
                //r
                newArr.splice(side2, 1, '00');
            } else if (side2 > 15 && side1 == 'r') {
                //b
                newArr.splice(side2, 1, '00');
            }
            let idx = oriArr.indexOf(pos1);
            newArr.splice(idx, 1, pos2);
            nextArr.push(newArr);
        })
        return nextArr;
    },
    getNewArrAfterMoving(oriArr, pos1, pos2){
        if (pos1 == '53') {
            console.log(oriArr, pos1, pos2);
        }
        let newArr = Array.from(oriArr);
        let del = oriArr.indexOf(pos2);
        if (del != -1) {
            newArr.splice(del, 1, '00');
        }
        let idx = oriArr.indexOf(pos1);
        newArr.splice(idx, 1, pos2);
        return newArr;
    },
    isChecking(side, posArr){
        let jPos = side == 'r' ? posArr[31] : posArr[15];
        let jPosX = parseInt(jPos[0]), jPosY = parseInt(jPos[1]);
        let offset = side == 'r' ? 0 : 16;
        if (self.boardUtil('between', posArr, posArr[15], posArr[31]).length === 0) {
            return true;
        }
        // console.log('checking check', posArr.join(''));
        for (let i = 0; i < 11; i++) {
            // console.log('cur', i, posArr[i + offset]);
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
            //checkPawn
            if (i > 5 || i < 11) {
                let pawnX = parseInt(pos[0]), pawnY = parseInt(pos[1]);
                if ((pawnX - jPosX) * (pawnX - jPosX) + (pawnY - jPosY) * (pawnY - jPosY) !== 1) {
                    continue;
                }
                return true;
            }
        }

        return false;
    },
    getAllPosInLine(curPos){
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
        return nextArr;
    },
    getCastleNextPos(pieceArr, curPos){
        if (curPos == "00") {
            return [];
        }
        let side = pieceArr.indexOf(curPos) < 16 ? 'r' : 'b';
        let nextArr = self.getAllPosInLine(curPos);
        // let curX = parseInt(curPos[0]), curY = parseInt(curPos[1]);
        // for (let i = 0; i < 10; i++) {
        //     if (i != 0) {
        //         nextArr.push(('' + curX + i));
        //         nextArr.push(('' + i + curY));
        //     } else {
        //         nextArr.push(curX + '0');
        //     }
        // }
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
        return self.getValidNextMoveArr(pieceArr, curPos, afterArr);
        // return afterArr.map(pos => {
        //     return self.getNewArrAfterMoving(pieceArr, curPos, pos);
        // });
    },
    getCannonNextPos(pieceArr, curPos){
        if (curPos == "00") {
            return [];
        }
        let side = pieceArr.indexOf(curPos) < 16 ? 'r' : 'b';
        let nextArr = self.getAllPosInLine(curPos);
        let afterArr = nextArr.filter(item => {
            let numPieceBetween = self.boardUtil('between', pieceArr, curPos, item);
            if (numPieceBetween.length > 1) {
                return false;
            }
            if (numPieceBetween == 1 && !self.boardUtil('isExist', pieceArr, numPieceBetween[0])) {
                return false;
            }
            if (numPieceBetween.length == 0 && !self.boardUtil('isExist', pieceArr, item)) {
                return true;
            }
            let testSide = self.boardUtil('side', pieceArr, item);
            if (testSide && testSide == side) {
                return false;
            }
            return true;
        })

        return self.getValidNextMoveArr(pieceArr, curPos, afterArr);
        // return afterArr.map(pos => {
        //     return self.getNewArrAfterMoving(pieceArr, curPos, pos);
        // });
    },
    getKnightNextPos(pieceArr, curPos){
        let side = pieceArr.indexOf(curPos) < 16 ? 1 : -1;
        let cC = parseInt(curPos[0]), cR = parseInt(curPos[1]);
        let finalArr = [];

        function hasPiece(x, y) {
            return pieceArr.indexOf((cC + x) + '' + (cR + y)) > -1;
        }

        function pushIfValid(arr, x, y) {
            if (cC + x > 0 && cC + x < 10 && cR + y > -1 && cR + y < 10) {
                arr.push(cC + x + '' + (cR + y));
            }
            return arr;
        }

        if (!hasPiece(-1, 0)) {
            finalArr = pushIfValid(finalArr, -2, -1);
            finalArr = pushIfValid(finalArr, -2, 1);
        }
        if (!hasPiece(1, 0)) {
            finalArr = pushIfValid(finalArr, 2, -1);
            finalArr = pushIfValid(finalArr, 2, 1);
        }
        if (!hasPiece(0, -1)) {
            finalArr = pushIfValid(finalArr, -1, -2);
            finalArr = pushIfValid(finalArr, 1, -2);
        }
        if (!hasPiece(0, 1)) {
            finalArr = pushIfValid(finalArr, -1, 2);
            finalArr = pushIfValid(finalArr, 1, 2);
        }

        return self.getValidNextMoveArr(pieceArr, curPos, finalArr);
        // let afterArr = finalArr.filter(pos => {
        //     if (pos == '00') {
        //         return false;
        //     }
        //     let idx = pieceArr.indexOf(pos);
        //     return idx == -1 || (15 - idx) * side > 0;
        // });
        // let resultArr = afterArr.map(pos => {
        //     return self.getNewArrAfterMoving(pieceArr, curPos, pos);
        // });
        // return resultArr;
    },
    getPawnNextPos(pieceArr, curPos){
        let side = pieceArr.indexOf(curPos) > 15 ? 'b' : 'r';
        let curSide = parseInt(curPos[1]) > 4.5 ? 'b' : 'r';
        let forward = parseInt(curPos[1]) > 4.5 ? 1 : -1;
        let x = parseInt(curPos[0]), y = parseInt(curPos[1]);
        let arr = [];
        if (y + forward > -1 && y + forward < 10) {
            arr.push(x + '' + (y + forward))
        }
        if (side != curSide) {
            if (x > 1) {
                arr.push(x - 1 + '' + y)
            }
            if (x < 9) {
                arr.push(x + 1 + '' + y)
            }
        }
        let afterArr = arr.filter(pos => {
            return self.boardUtil('side', pieceArr, pos) != side;
        })
        return self.getValidNextMoveArr(pieceArr, curPos, afterArr);
        // return afterArr.map(pos => {
        //     return self.getNewArrAfterMoving(pieceArr, curPos, pos);
        // });

    },

    getMarshalNextPos(pieceArr, pos){
        let p = self.getNumPosFromStr(pos);
        let side = p.y < 3 ? 'r' : 'b';
        let piece = p.y < 3 ? 'bj' : 'rj';
        let new1 = piexeAllowPosObj[piece].filter(newPos => {
            let p1 = self.getNumPosFromStr(newPos.toString());
            // if (self.boardUtil('side', pieceArr, '' + p1.x + p1.y) == p1) {
            //     return false;
            // }
            if ((p1.x - p.x) * (p1.x - p.x) + (p1.y - p.y) * (p1.y - p.y) != 1) {
                return false;
            }
            return true;
        })
        return self.getValidNextMoveArr(pieceArr, pos, new1.map(pos=>pos.toString()));

        // let new2 = new1.map(newPos => {
        //     return self.getNewArrAfterMoving(pieceArr, pos, newPos.toString());
        // });
        // return new2;

    },
    getAdvisoryNextPos(pieceArr, pos){
        let side = pieceArr.indexOf(pos) < 16 ? 1 : -1;
        let arr = allNextAdvisoryPos[pos];
        let newPosArr = [];
        if (arr && arr.length > 0) {
            newPosArr = arr.filter(pos => {
                let idx = pieceArr.indexOf(pos);
                return idx == -1 || (15 - idx) * side > 0;
            })
        }
        return newPosArr.map(pos => {
            return self.getNewArrAfterMoving(pieceArr, curPos, pos);
        });
    },
    getBishopNextPos(pieceArr, pos){
        let newPosArr = [];
        let side = pieceArr.indexOf(pos) < 16 ? 1 : -1;
        let arr = allNextBishopPos[pos];
        if (arr && arr.length > 0) {
            newPosArr = arr.filter(pos => {
                let idx = pieceArr.indexOf(pos);
                return idx == -1 || (15 - idx) * side > 0;
            })
        }
        return newPosArr.map(pos => {
            return self.getNewArrAfterMoving(pieceArr, curPos, pos);
        });
    },
    getNumPosFromStr(txt){
        return {
            x: parseInt(txt[0]),
            y: parseInt(txt[1])
        }
    },
    getMoveName(k1, k2){
        let pieceName = '';
        let offset = k1[0] == 'b' ? 33 : 1;
        let key1 = k1.slice(offset, offset + 32);
        let key2 = k2.slice(offset, offset + 32);
        let diffKey1 = '', diffKey2 = '';
        piecePosArr.reduce((pre, next, idx) => {
            let str1 = key1.slice(pre, pre + next);
            let str2 = key2.slice(pre, pre + next);
            if (str1 != str2) {
                diffKey1 = str1;
                diffKey2 = str2;
                pieceName = piecePosName[pre / 2];
            }
            return pre + next;
        }, 0)
        console.log(key1, key2, pieceName, diffKey1, diffKey2);
        let oriPos, newPos, direction, pos1, pos2;
        if ('cpj'.indexOf[pieceName] != -1) {
            pos1 = diffKey1.slice(0, 2) == diffKey2.slice(0, 2) ? diffKey1.slice(2) : diffKey1.slice(0, 2);
            pos2 = diffKey1.slice(2) == diffKey2.slice(2) ? diffKey2.slice(0, 2) : diffKey2.slice(2);
            if (diffKey1[0] != diffKey1[2]) {//not in one col
                oriPos = pos1[0];
            } else {//in one col
                if (2 * parseInt(pos1[1]) > parseInt(diffKey1[0]) + parseInt(diffKey1[2])) {
                    oriPos = "big"
                } else {
                    oriPos = 'small';
                }
            }
            if (pos1[0] == pos2[0]) {//move vertical
                direction = pos2[1] > pos1[1] ? 1 : -1;
                newPos = parseInt(pos2[1]) - parseInt(pos1[1]);
            } else {//move hori
                direction = 0;
                newPos = pos2[0];
            }

        } else if ('msx'.indexOf[pieceName] != -1) {

        } else if (pieceName == 'b') {

            // } else if (pieceName == 'j') {

        }

        // let diffPos = [];
        // for (let i = 1; i < key1.length; i = i + 2) {
        //     let str1 = key1[i] + key1[i + 1];
        //     let str2 = key2[i] + key2[i + 1];
        //     if (str1 == '00' || str2 == '00') {
        //         continue;
        //     }
        //
        //     if (str1 != str2) {
        //         diffPos.push((i - 1) / 2);
        //         diffPos.push(str1);
        //         diffPos.push(str2);
        //     }
        // }
        // console.log(key1, '&', key2, '&', diffPos);
        // let pieceName = (diffPos[0] > 15 ? 'b' : 'r') + piecePosName[diffPos[0]];
        // console.log(pieceName, diffPos)
        // console.log(pos1, pos2, pieceName, oriPos, direction, newPos);
        return [pieceName, oriPos, direction, newPos];
    }
}