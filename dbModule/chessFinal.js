const util = require('./utility/util');
const Chess = require('./utility/chess');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dataFile', 'chess', 'chessBoardList.txt');

var allProcess = [];
var boardResult = {};

var local = {
    startBoardthread(reqKey){
        boardResult[reqKey].startKey = reqKey;
        boardResult[reqKey].maxSolLength = 0;
        boardResult[reqKey].solList = [];
        allProcess[reqKey].on('message', data => {
            // console.log('herard data', data);
            let content = data.data;
            switch (data.type) {
                case 'boardStatus':
                    local.updateBoardStatus(reqKey, content.status);
                    break;
                case 'solutionCompleted':
                    local.updateBoardStatus(reqKey, 'getting solution list');
                    boardResult[reqKey].solObj = content;
                    allProcess[reqKey].send({type: 'generateSolutionList', data: content})
                    break;
                case 'solutionListCompleted':
                    local.updateBoardStatus(reqKey, 'getting step data');
                    content.forEach(list => {
                        boardResult[reqKey].maxSolLength = Math.max(list.length, boardResult[reqKey].maxSolLength);
                    })
                    boardResult[reqKey].solList = content;
                    allProcess[reqKey].send({type: 'getStepData', data: content})
                    break;
                case 'stepDataCompleted':
                    boardResult[reqKey].status = 'completed';
                    boardResult[reqKey].steps = content;
                    // local.updateBoardStatus(reqKey, {
                    //     status: 'completed',
                    //     startKey: reqKey,
                    //     solList: boardResult[reqKey].solList,
                    //     steps: boardResult[reqKey].steps,
                    //     maxSolLength: boardResult[reqKey].maxSolLeng
                    // });
                    allProcess[reqKey].kill();
                    // return {startKey: solObj.startKey, solList: solList, steps: steps, maxSolLength: maxSolLeng};//, fullObj: solObj};
                    break;
            }
        });
        let solObj = {
            startKey: reqKey,
            boardList: {},
            winList: [],
            maxNumSolution: 1
        };
        solObj.boardList[reqKey] = {
            posArr: Chess.getPosArrFromKey(reqKey),
            step: 0,
            from: [],
            nextListed: false,
            nextAllKey: [],
            nextWinKey: [],
            nextLoseKey: []
        };
        allProcess[reqKey].send({type: 'getSolution', solObj: solObj, boardKey: reqKey});
        // local.updateBoardStatus(reqKey, "generating solution list.");
        // local.getSolution(null, solObj, 0, [reqKey], function (solObj) {
        //     // console.log('solObj', JSON.stringify(solObj));
        //     let solList = local.generateSolutionList(solObj, [[solObj.startKey]]);
        //
        //     let maxSolLeng = 0;
        //     solList.forEach(list => {
        //         maxSolLeng = Math.max(list.length, maxSolLeng);
        //     })
        //     local.updateBoardStatus(reqKey, "Getting step data.");
        //     let steps = local.getStepsData(solList);
        //     console.log({startKey: solObj.startKey, solList: solList, steps: steps});
        //     boardResult[reqKey] = {
        //         status: 'completed',
        //         startKey: reqKey,
        //         solList: solList,
        //         steps: steps,
        //         maxSolLength: maxSolLeng
        //     };
        // });
        // return {startKey: solObj.startKey, solList: solList, steps: steps, maxSolLength: maxSolLeng};//, fullObj: solObj};

    },
    updateBoardStatus(key, val){
        boardResult[key].status = val;
    },
    getSolution(skt, solObj, step, checkKey, callback){
        let totalKey = checkKey.length;
        console.log('total keys', Object.keys(solObj.boardList).length, checkKey.length, solObj.winList.length);
        if (checkKey.length == 0) {
            return callback(solObj);
        }
        let checkNowKey = [], nextCheckKey = [];
        while (checkKey.length > 0) {
            // console.log('checkKey', checkKey);

            local.updateBoardStatus(solObj.startKey, "Solving at step " + step + " " + (checkKey.length / totalKey * 100).toFixed(1) + '%');
            let startObj = solObj.boardList[solObj.startKey];
            if (startObj.status) {
                return callback(solObj);
            }

            let thisBoardKey = checkKey[0], curRound = thisBoardKey[0];
            let thisBoardObj = solObj.boardList[thisBoardKey];
            // if (thisBoardObj.nextListed && thisBoardObj.from.length == 0) {
            //     checkKey.shift();
            //     continue;
            // }
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
                //already had result, remove unneccessary checkings
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
            checkKey.splice(0, 1); //this key done

            //check whether have immediate checkings, checknowKey is the arr of keys where  the next step is an end
            while (checkNowKey.length > 0) {
                // console.log('checkNowKey', checkNowKey);
                let startObj = solObj.boardList[solObj.startKey];
                if (startObj.status) {
                    return callback(solObj);
                }

                let thisKeyObj = solObj.boardList[checkNowKey[0]];

                // if (thisKeyObj.nextListed && thisKeyObj.from.length == 0) {
                //     thisKeyObj.nextAllKey.forEach(newKeyRemovethisfrom => {
                //         let checkingObj = solObj.boardList[newKeyRemovethisfrom];
                //         let idx = checkingObj.from.indexOf(checkNowKey[0]);
                //         if (idx != -1) {
                //             checkingObj.from.splice(idx, 1);
                //             if (checkingObj.from.length == 0) {
                //                 checkNowKey = checkNowKey.concat(checkingObj.nextAllKey);
                //             }
                //         }
                //     });
                //     checkNowKey.shift();
                //     continue;
                // }
                let thisRound = checkNowKey[0][0];
                let oppoRound = thisRound == 'r' ? 'b' : 'r';
                let newNextAllKey = [];
                let hasChange = false;
                thisKeyObj.nextAllKey.forEach(childKey => {
                    let childObj = solObj.boardList[childKey];
                    let childStatus = childObj.status;
                    if (childStatus && childStatus[0] === thisRound) {
                        //self will win at next round
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
                        //opponent will win at next round
                        if (childStatus === oppoRound + 'LastWin') {
                            thisKeyObj.nextLoseKey.push(childKey + '#' + 1);
                        } else {
                            thisKeyObj.nextLoseKey.push(childKey + '#' + (1 + childObj.minWin));
                        }
                        thisKeyObj.maxLose = thisKeyObj.maxLose || -1;
                        thisKeyObj.maxLose = Math.max(thisKeyObj.maxLose, 1 + childObj.minWin);
                        hasChange = true;
                    } else {
                        newNextAllKey.push(childKey);
                    }
                })
                thisKeyObj.nextAllKey = newNextAllKey;
                // if (thisKeyObj.nextWinKey.length >= solObj.maxNumSolution) {
                //     // solObj.winList.push(checkNowKey[0]);
                // }
                if (thisKeyObj.nextAllKey.length == 0 && thisKeyObj.nextWinKey.length == 0) {

                    if (thisKeyObj.nextLoseKey.length > 0) {
                        thisKeyObj.maxLose = thisKeyObj.nextLoseKey.map(key => {
                            let arr = key.split('#');
                            return parseInt(arr[1]);
                        }).reduce((prev, cur) => {
                            return prev > cur ? prev : cur;
                        })
                        if (!thisKeyObj.status) {
                            hasChange = true;
                        }
                        thisKeyObj.status = oppoRound + 'Win';
                    }
                }
                if (thisKeyObj.nextWinKey.length > 0) {
                    thisKeyObj.minWin = thisKeyObj.nextWinKey.reduce((prev, key) => {
                        let numWin = 1 + parseInt(key.split('#')[1]);
                        return Math.min(numWin, prev);
                    }, 99999999);
                    if (!thisKeyObj.status) {
                        hasChange = true;
                    }
                    thisKeyObj.status = thisRound + 'Win';
                }
                if (thisKeyObj.nextWinKey.length >= solObj.maxNumSolution) {
                    //remove from
                    thisKeyObj.nextAllKey.forEach(key => {
                        let fromKeyArr = solObj.boardList[key].from;
                        let removeIdx = fromKeyArr.indexOf(checkNowKey[0]);
                        if (removeIdx != -1) {
                            fromKeyArr.splice(removeIdx, 1);
                            // if (fromKeyArr.length == 0) {
                            //     checkNowKey = checkNowKey.concat(key);
                            // }
                        }
                    })
                }
                if (hasChange) {
                    checkNowKey = checkNowKey.concat(thisKeyObj.from);

                }
                checkNowKey.shift();
            }
        }
        return local.getSolution(skt, solObj, step + 1, nextCheckKey, callback)
    },
    generateSolutionList(solObj, solList){
        let appendArr = [];
        let change = false;
        let numFoundList = 0;
        for (let i = 0; i < solList.length; i++) {
            let keyArr = solList[i];
            let lastKey = keyArr.slice(-1);
            let lastKeyObj = solObj.boardList[lastKey];
            if (lastKeyObj.minWin < 2) {
                appendArr.push(keyArr);
                numFoundList++;
            }
            if (lastKeyObj.status && lastKeyObj.status.indexOf('rLastWin') != -1) {
                appendArr.push(keyArr);
                numFoundList++;
            } else if (lastKey[0][0] === 'b' && lastKeyObj.nextWinKey.length > 0) {
                console.log('no');
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
                lastKeyObj.nextLoseKey.filter(key => {
                    let num = key.split('#')[1];
                    return parseInt(num) > 1;
                }).forEach(newKey => {
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
    getStepsData(solList){
        let keytoId = {}, storedObj = {}, idx = 0;
        solList.forEach(keyList => {
            keyList.forEach(key => {
                if (!keytoId[key]) {
                    storedObj[idx] = {curBoard: key, next: []};
                    keytoId[key] = idx;
                    idx++;
                }
            })
            for (let i = 0, l = keyList.length; i < l; i++) {
                if (keyList[i + 1]) {
                    let curKey = keyList[i];
                    let nextKey = keyList[i + 1];
                    let curId = keytoId[curKey];
                    let nextId = keytoId[nextKey];

                    let isAdded = false;
                    storedObj[curId].next.forEach(obj => {
                        if (Object.keys(obj)[0] == nextId) {
                            isAdded = true;
                        }
                    })
                    if (!isAdded) {
                        let addObj = {};
                        addObj[nextId] = Chess.getMoveName(curKey, nextKey);
                        storedObj[curId].next.push(addObj);
                    }
                }
            }

        })
        return storedObj;

    }
}
var socket = {
    getBoardStatus: function (boardKey, socket) {
        let obj = boardResult[boardKey] || {};
        if (obj.status == 'completed') {
            return {
                maxSolLength: obj.maxSolLength,
                solList: obj.solList,
                startKey: obj.startKey,
                status: "completed",
                steps: obj.steps
            }
        } else {
            return obj.status;
        }
    },
    chessValidateBoard: function (req) {
        return Chess.isBoardObjValid(req);
    },
    chessBoardKeyLib: function (para) {
        switch (para.type) {
            case 'get':
                return new Promise((resolve, reject) => {
                    fs.readFile(filePath, function (err, data) {
                        console.log('err', err);
                        if (data) {
                            resolve(data.toString().split('#').filter(a => a));
                        }
                        reject('err');
                    });
                })
                break;
            case 'add':
                fs.appendFile(filePath, para.key + '#', function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
                break;

        }
    },
    chessStartBoard: function (reqKey, socket) {
        boardResult[reqKey] = boardResult[reqKey] || {
                status: 'started'
            };
        if (boardResult[reqKey].status != 'completed') {
            var testCp = util.createFork(path.join(__dirname, 'calcBoardProcess.js'), [], {
                silent: false,
                execArgv: []
            });
            if (testCp.success) {
                allProcess[reqKey] = testCp.cp;
                local.startBoardthread(reqKey, reqKey);
            }
        }

        return "working";
    },
    queryBoard: function (para) {
        let startKey = para.startKey, key = para.key;
        try {
            return {checkKey: para.key, sol: boardResult[startKey].solObj.boardList[key]};
        }
        catch (e) {
        }
    }
}
module.exports = {func: local, socket: socket}