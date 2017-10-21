const util = require('./utility/util');
const Chess = require('./utility/chess');

var local = {
    getSolution(solObj, step, checkKey){
        console.log('total keys', Object.keys(solObj.boardList).length, solObj.winList.length);
        if (checkKey.length == 0 || solObj.winList.length > 19) {
            return solObj;
        }
        let checkNowKey = [], nextCheckKey = [];
        while (checkKey.length > 0) {

            let thisBoardKey = checkKey[0], curRound = thisBoardKey[0];
            if(thisBoardKey=='b1000600040003271000000476939004921000000180013283800005162700041'){
                console.log('f');
            }
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
                    solObj.winList.push(thisBoardKey);
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
                    // solObj.winList.push(checkNowKey[0]);
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
        let numFoundList = 0;
        for (let i = 0; i < solList.length; i++) {
            let keyArr = solList[i];
            let lastKey = keyArr.slice(-1);
            let lastKeyObj = solObj.boardList[lastKey];
            if (lastKeyObj.status && lastKeyObj.status.indexOf('rLastWin') != -1) {
                appendArr.push(keyArr);
                numFoundList++;
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
        if (change && numFoundList < 100) {
            return local.generateSolutionList(solObj, appendArr);
        } else {
            return solList;
        }

    },

    simplifySol(solObj){
        let solList = local.generateSolutionList(solObj, [[solObj.startKey]]);
        return {startKey: solObj.startKey, solList: solList};//, steps: finalObj

    },
}
var socket = {
    chessValidateBoard: function (req) {
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