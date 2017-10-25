(function () {
    define([], function () {
        const imgBaseDir = '../src/img/chess/';
        var mySkt;
        var curBoardTag, curPieceFolder, curPieceExt, baseData = {}, finalBoard = {},
            mouseDownFlag = false, finalBoardKey = '';
        var MoveStepSpeed = 100, solutionObj = {}, dragEvtObj = {};

        const boardObj = {
            board0: {
                img: "board0.jpg",
                height: 951,
                width: 925,
                mTop: 3,
                mBtm: 3,
                mLeft: 7,
                mRight: 7,
            },
            board1: {
                img: "board1.jpg",
                height: 416,
                width: 375,
                mTop: 7,
                mBtm: 7,
                mLeft: 7,
                mRight: 7,
            }
        }

        function initDrag() {
            $('body').on('mousedown', function (evt) {
                console.log('down', evt);
                let type = $(evt.target).attr('dragType');
                if (type) {
                    evt.preventDefault();
                    dragEvtObj.downFlag = type;
                    if (dragEvtObj[type] && dragEvtObj[type].start) {
                        dragEvtObj[type].start(evt);
                    }
                }
            })
            Rx.Observable.fromEvent(document, "mouseup").subscribe(e => {
                if (dragEvtObj.downFlag && dragEvtObj[dragEvtObj.downFlag] && dragEvtObj[dragEvtObj.downFlag].final) {
                    dragEvtObj[dragEvtObj.downFlag].final(e);
                }
                dragEvtObj.downFlag = null;
            });

            Rx.Observable
                .fromEvent(document, "mousemove").debounce(10)
                .filter(e => dragEvtObj.downFlag)
                .subscribe(evt => {
                    if (dragEvtObj[dragEvtObj.downFlag].next) {
                        dragEvtObj[dragEvtObj.downFlag].next(evt)
                    }
                });
        }

        function setDragHandler(key, type, func) {
            if (type != 'start' && type != 'next' && type != 'final') {
                return;
            }
            dragEvtObj[key] = dragEvtObj[key] || {};
            dragEvtObj[key][type] = func;
        }

        function setBaseData(pieceFolder, pieceExt, boardTag, callback) {
            pieceFolder = pieceFolder || curPieceFolder;
            pieceExt = pieceExt || curPieceExt;
            boardTag = boardTag || curBoardTag;
            if (!pieceFolder || !pieceExt || !boardTag) {
                return;
            }
            let piecePath = imgBaseDir + 'piece/' + pieceFolder + '/';
            baseData = {
                bb: {img: piecePath + "bb." + pieceExt, maxCount: 5},
                bc: {img: piecePath + "bc." + pieceExt, maxCount: 2},
                bj: {img: piecePath + "bj." + pieceExt, maxCount: 1},
                bm: {img: piecePath + "bm." + pieceExt, maxCount: 2},
                bp: {img: piecePath + "bp." + pieceExt, maxCount: 2},
                bs: {img: piecePath + "bs." + pieceExt, maxCount: 2},
                bx: {img: piecePath + "bx." + pieceExt, maxCount: 2},

                rb: {img: piecePath + "rb." + pieceExt, maxCount: 5},
                rc: {img: piecePath + "rc." + pieceExt, maxCount: 2},
                rj: {img: piecePath + "rj." + pieceExt, maxCount: 1},
                rm: {img: piecePath + "rm." + pieceExt, maxCount: 2},
                rp: {img: piecePath + "rp." + pieceExt, maxCount: 2},
                rs: {img: piecePath + "rs." + pieceExt, maxCount: 2},
                rx: {img: piecePath + "rx." + pieceExt, maxCount: 2},
                board: $.extend({}, boardObj[boardTag]),
                boardMatrix: {}
            }
            baseData.board.img = imgBaseDir + "board/" + baseData.board.img;
            let colUnit = (100 - baseData.board.mLeft - baseData.board.mRight) / 8;
            let rowUnit = (100 - baseData.board.mTop - baseData.board.mBtm) / 9;


            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 9; col++) {
                    // let avalPiece = [];
                    // let label = col + 1 + '' + (row + 1);
                    //
                    // //红兵
                    // if (row < 6 || (row === 6 && col % 2 === 0)) {
                    //     avalPiece.push('rb');
                    //     avalPieceObj['rb'].push(label);
                    // }
                    // //黑兵
                    // if (row > 3 || (row === 3 && col % 2 === 0)) {
                    //     avalPiece.push('bb');
                    //     avalPieceObj['bb'].push(label);
                    // }
                    // //红士
                    // let testRS = (row - 8) * (row - 8) + (col - 4) * (col - 4);
                    // if (testRS === 0 || testRS === 2) {
                    //     avalPiece.push('rs');
                    //     avalPieceObj['rs'].push(label);
                    // }
                    // if (testRS < 2.1) {
                    //     avalPiece.push('rj');
                    //     avalPieceObj['rj'].push(label);
                    // }
                    // //红象
                    // let testRX1 = (row - 7) * (row - 7) + (col - 2) * (col - 2);
                    // let testRX2 = (row - 7) * (row - 7) + (col - 6) * (col - 6);
                    // if (testRX1 === 4 || testRX2 === 4) {
                    //     avalPiece.push('rx');
                    //     avalPieceObj['rx'].push(label);
                    // }
                    // //黑士
                    // let testBS = (row - 1) * (row - 1) + (col - 4) * (col - 4);
                    // if (testBS === 0 || testBS === 2) {
                    //     avalPiece.push('bs');
                    //     avalPieceObj['bs'].push(label);
                    // }
                    // if (testBS < 2.1) {
                    //     avalPiece.push('bj');
                    //     avalPieceObj['bj'].push(label);
                    // }
                    // //黑象
                    // let testBX1 = (row - 2) * (row - 2) + (col - 2) * (col - 2);
                    // let testBX2 = (row - 2) * (row - 2) + (col - 6) * (col - 6);
                    // if (testBX1 === 4 || testBX2 === 4) {
                    //     avalPiece.push('bx');
                    //     avalPieceObj['bx'].push(label);
                    // }

                    baseData.boardMatrix[(col + 1) + '' + (row)] = {
                        col: col + 1,
                        row: row,
                        left: baseData.board.mLeft + col * colUnit,
                        top: baseData.board.mTop + row * rowUnit,
                        // availPieceArr: avalPiece,
                    }

                }
            }
            // baseData.availPieceByPiece = avalPieceObj;
            console.log(baseData);
            if (callback) {
                callback();
            }
        }

        function getPieceImgStr(piece) {
            return baseData[piece].img;
        }

        function setDragEvt() {
            let rect1 = $('.boardPos10').get(0).getBoundingClientRect();
            let rect2 = $('.boardPos99').get(0).getBoundingClientRect();
            let unitX = (rect2.right - rect1.left) / 9;
            let unitY = (rect2.bottom - rect1.top) / 10;
            let hoverX = 0, hoverY = -1;

            let piece = null, thisPieceDom = null, oriDom = null, pickType = null;

            setDragHandler('setupPiece', 'start', function (evt) {
                if ($(evt.target).closest("#piecesList").length > 0) {
                    pickType = 'add';
                } else if ($(evt.target).closest("#chessboarddiv").length > 0) {
                    pickType = 'move';
                    oriDom = evt.target;
                }
                thisPieceDom = $(evt.target).clone();
                $('#chessboarddiv').append(thisPieceDom);
                piece = $(evt.target).attr('pieceName');
                // $('#chessboarddiv .blink').removeClass('blink');
                // if (baseData.availPieceByPiece[piece]) {
                //     baseData.availPieceByPiece[piece].forEach(label => {
                //         if (finalBoard[label]) {
                //
                //         } else {
                //             $('#chessboarddiv .availPiece' + label)
                //                 .attr('src', baseData[piece].img)
                //                 .addClass('blink');
                //         }
                //     })
                // } else {
                //     //blink all
                // }
                // console.log('click', evt)
            })
            setDragHandler('setupPiece', 'next', function (evt) {
                $(thisPieceDom).offset({top: evt.clientY - 25, left: evt.clientX - 25});

                //get rect if any

                if (evt.clientX > rect1.left && evt.clientX < rect2.right) {
                    hoverX = parseInt((evt.clientX - rect1.left) / unitX) + 1;
                } else {
                    hoverX = 0
                }
                if (evt.clientY > rect1.top && evt.clientY < rect2.bottom) {
                    hoverY = parseInt((evt.clientY - rect1.top) / unitY);
                } else {
                    hoverY = -1
                }
                // console.log(hoverX, hoverY);
                $('#chessboarddiv .fadeback').removeClass('fadeback');
                if (hoverX && hoverY > -1) {
                    $('#chessboarddiv .boardPos' + hoverX + hoverY).addClass('fadeback');
                }
            });
            setDragHandler('setupPiece', 'final', function (ev) {
                if (hoverX && hoverY > -1 && !finalBoard[hoverX + '' + hoverY]) {
                    if (pickType == 'add') {
                        let availableCount = parseInt($('#pickPiece' + piece).text());
                        if (availableCount > 0) {
                            finalBoard[hoverX + '' + hoverY] = piece;
                            $('#pickPiece' + piece).text(availableCount - 1);
                        }
                    } else if (pickType == 'move') {
                        $(oriDom).removeAttr('src').removeClass('pickPiece');
                        let srcX = $(oriDom).parent().attr('col');
                        let srcY = $(oriDom).parent().attr('row');
                        delete finalBoard[srcX + '' + srcY];
                        finalBoard[hoverX + '' + hoverY] = piece;
                    }
                    $("#chessboarddiv .boardPos" + hoverX + hoverY).find('img')
                        .attr('dragtype', 'setupPiece')
                        .attr('src', getPieceImgStr(piece))
                        .attr('pieceName', piece)
                        .addClass('pickPiece');
                }
                // $("#chessboarddiv .piececandidate").each(function () {
                //     let x = $(this).attr('col');
                //     let y = $(this).attr('row');
                //     let isSet = finalBoard[x + '' + y] || null;
                //     console.log('set', isSet);
                //     if (isSet) {
                //         $(this).find('img').removeClass('fadeback').removeClass('blink').attr('src', baseData[isSet].img)
                //     }
                //     else {
                //         $(this).find('img').removeClass('fadeback').removeClass('blink').removeAttr('src');
                //     }
                // })
                $('#chessboarddiv .fadeback').removeClass('fadeback');
                $(thisPieceDom).remove();
                console.log('final', finalBoard);
                mySkt.send('chessValidateBoard', finalBoard, resData => {
                    console.log('res', resData);
                    finalBoardKey = resData.boardKey;
                    displayInfo('validCheck', resData);
                }, failData => {
                    console.log(failData);
                    // setLoading(true, failData.code || 'Error');
                })
            })

        }

        function resetSetupBoard() {
            finalBoard = {};
            let row1 = $('<div>').attr('id', 'piecerow1');
            let row2 = $('<div>').attr('id', 'piecerow2');

            ['r', 'b'].forEach(color => {
                let nowDiv = color === "r" ? row1 : row2;
                ['c', 'm', 'p', 'b', 's', 'x', 'j'].forEach(piece => {
                    let pieceDiv = $("<img>", {
                        src: getPieceImgStr(color + piece),
                        class: "pieceSize pickPiece"
                    }).attr('pieceName', color + piece).attr('dragType', 'setupPiece');
                    let pickPieceCout = $("<span>", {
                        id: "pickPiece" + color + piece
                    }).text(baseData[color + piece].maxCount);
                    nowDiv.append(pieceDiv).append(pickPieceCout);
                })
            })
            $('#piecesList').html('').append(row1).append(row2);
        }

        function initBoardPiecePos() {
            $('#chessboarddiv').find('img').each(function () {
                console.log('$(this)', $(this));
                $(this).parent().empty().append('<img class="pieceSize">');
            });

            $.each(baseData.boardMatrix, (k, v) => {
                console.log('v.col, v.row, v.availPieceArr', v.col, v.row, v.availPieceArr);
                let img = $('<img>').addClass('pieceSize');
                let newDiv = $('<div>')
                    .attr('col', v.col)
                    .attr('row', v.row)
                    .addClass("pieceSize pieceImg boardPos" + v.col + v.row)
                    .css('top', v.top + '%')
                    .css('left', v.left + '%').append(img);
                $('#chessboarddiv').append(newDiv);
                // changePiece('.test' + v.col + v.row, v.col, v.row, v.availPieceArr, 0);

            })
        }

        function initSetupBoard() {
            resetSetupBoard();
            initBoardPiecePos();
            setDragEvt();
        }

        function drawBoard() {
            let width = $('#piecesListWrapper').width();
            $('#chessboarddiv').css('background-image', 'url(' + baseData.board.img + ')');
            $('#chessboarddiv').height(width * baseData.board.height / baseData.board.width);
            initBoardPiecePos();


            // testPos(baseData.board.mTop, baseData.board.mBtm, baseData.board.mLeft, baseData.board.mRight);
            // testPiece();
        }

        function submitBoard() {
            mySkt.send('chessStartBoard', finalBoardKey, resData => {
                console.log('res', resData);
                console.log('res', JSON.stringify(resData));
                displayInfo('solution', resData);
            }, failData => {
                console.log(failData);
                // setLoading(true, failData.code || 'Error');
            })
        }

        function displayInfo(type, srcObj) {
            if (type == "validCheck") {
                $('#validCheckResult').removeClass('collapse');
                $('#solutionDiv').addClass('collapse');
                $('#boardValidText').html(srcObj.isValid ? "合法" : "非法");
                $('#boardDuplicateValidText').html(srcObj.error.duplicatePos.length);
                $('#boardPosValidText').html(srcObj.error.invalidPos.length);
                $('#boardPieceNameValidText').html(srcObj.error.invalidPiece.length);
                if (srcObj.error.invalidQty.length > 0) {
                    $('#boardPieceQtyValidText').html('');
                    srcObj.error.invalidQty.forEach(name => {
                        $('#boardPieceQtyValidText').append($('<img>', {
                            src: getPieceImgStr(name),
                            class: 'pieceSize'
                        }));
                    })
                } else {
                    $('#boardPieceQtyValidText').html('0');
                }

            } else if (type == 'solution') {
                $('#validCheckResult').addClass('collapse');
                $('#solutionDiv').removeClass('collapse');
                // $('#solutionDiv').html('');
                let nowKey = srcObj.startKey;
                solutionObj = initSolutionDiv(srcObj);
                // nowKey = null;
                // let curObj = srcObj.steps[0];
                // while (curObj.next.length > 0) {
                //     let length = Object.keys(curObj.next).length;
                //     let nextNameObj = curObj.next[length - 1];
                //     let nameArr = nextNameObj[Object.keys(nextNameObj)[0]];
                //     let newDiv = $('#moveStepDiv').clone().removeClass('collapse');
                //     const pieceNameObj = {
                //         c: "车",
                //         m: "马",
                //         p: "炮",
                //         b: "兵",
                //         s: "士",
                //         x: "相",
                //         j: "将",
                //     }
                //     const dirObj = {
                //         fwd: '进',
                //         bwd: '退',
                //         hor: '平'
                //     }
                //
                //     $(newDiv).find('.pieceText').text(pieceNameObj[nameArr[0]]);
                //     $(newDiv).find('.afterPieceName').text(nameArr[1]);
                //     $(newDiv).find('.direction').text(dirObj[nameArr[2]]);
                //     $(newDiv).find('.moveQty').text(nameArr[3]);
                //     $('#solutionDiv').append(newDiv);
                //     curObj = srcObj.steps[Object.keys(nextNameObj)[0]];
                //     // let stepObj = srcObj.steps[nowKey].nextSteps[0];
                //     // if (!stepObj) {
                //     //     break;
                //     // }
                //     // let coef = nowKey[0] == 'b' ? 1 : -1;
                //     // let newDiv = $('#moveStepDiv').clone().removeClass('collapse');
                //     // let preName = '';
                //     // if (stepObj.name[1] == 'big') {
                //     //     preName = coef;
                //     // } else if (stepObj.name[1] == 'small') {
                //     //     preName = -coef;
                //     // } else {
                //     //     preName = '';
                //     // }
                //     // switch (preName) {
                //     //     case 1:
                //     //         $(newDiv).find('.prePieceName').text('qian');
                //     //         break;
                //     //     case -1:
                //     //         $(newDiv).find('.prePieceName').text('hou');
                //     //         break;
                //     //     case '':
                //     //         $(newDiv).find('.prePieceName').text('');
                //     //         break;
                //     // }
                //     // $(newDiv).find('.prePieceName').text();
                //     // $(newDiv).find('img').attr('src', getPieceImgStr(nowKey[0] + stepObj.name[0]));
                //     // switch (stepObj.name[2] * coef) {
                //     //     case 0:
                //     //         $(newDiv).find('.direction').text('ping');
                //     //         break;
                //     //     case 1:
                //     //         $(newDiv).find('.direction').text('jin');
                //     //         break;
                //     //     case -1:
                //     //         $(newDiv).find('.direction').text('tui');
                //     //         break;
                //     // }
                //     // $(newDiv).find('.moveQty').text(stepObj.name[3]);
                //     // $('#solutionDiv').append(newDiv);
                //     // // if (stepObj.nextSteps && stepObj.nextSteps[0]) {
                //     // nowKey = stepObj.key
                //     // // } else {
                //     // //     nowKey = '';
                //     // // }
                // }
                // label.prePieceName
                // img.smallPieceSize
                // label.afterPieceName
                // label.direction
                // label.moveQty

            }
        }

        function testPos(mTop, mBtm, mLeft, mRight) {
            $('.testImg').remove();
            let wStep = (100 - mLeft - mRight) / 8;
            let hStep = (100 - mTop - mBtm) / 9;
            for (let w = 0; w < 9; w++) {
                for (let h = 0; h < 10; h++) {
                    let temp = $('<div>', {
                        class: "testImg pieceSize",
                    }).css('position', 'absolute')
                        .css('top', mTop + hStep * h + '%')
                        .css('left', mLeft + wStep * w + '%');
                    $('#chessboarddiv').append(temp);
                }

            }
            tempDrag();
        }

        function testPiece() {
            $('.testImg').remove();
            function changePiece(className, col, row, arr, idx) {
                console.log('col,row,arr,idx', className, col, row, arr, idx, baseData[arr[idx]].img);
                $(className).prop('src', baseData[arr[idx]].img);
                setTimeout(function () {
                    changePiece(className, col, row, arr, (idx + 1) % arr.length)
                }, 7000);
            }

            $.each(baseData.boardMatrix, (k, v) => {
                if (v.availPieceArr.length > 0) {
                    console.log('v.col, v.row, v.availPieceArr', v.col, v.row, v.availPieceArr);
                    let className = "pieceSize testImg";// test" + v.col + v.row;
                    let img = $('<img>', {
                        width: 50,
                        height: 50
                    }).addClass('.pieceSize test' + v.col + v.row);
                    let newDiv = $('<div>')
                        .addClass("pieceSize testImg")
                        .css('top', v.top + '%')
                        .css('left', v.left + '%').append(img);
                    $('#chessboarddiv').append(newDiv);
                    changePiece('.test' + v.col + v.row, v.col, v.row, v.availPieceArr, 0);
                }
            })
        }

        function tempDrag() {
            const dragDOM = document.getElementsByClassName('testImg');
            const body = document.body;

            const mouseDown = Rx.Observable.fromEvent(dragDOM, 'mousedown');
            const mouseUp = Rx.Observable.fromEvent(body, 'mouseup');
            const mouseMove = Rx.Observable.fromEvent(body, 'mousemove');

            mouseDown
                .map(event => mouseMove.takeUntil(mouseUp))
                .concatAll()
                .map(event => {
                    // console.log('event', event);
                    return {x: event.clientX, y: event.clientY}
                })
                .subscribe(pos => {
                    console.log(dragDOM);
                    dragDOM[0].style.left = pos.x + 'px';
                    dragDOM[0].style.top = pos.y + 'px';
                })
        }

        function animateStep(turnId, isStart = true, callback) {
            $('[turn=' + solutionObj.curHighlightStep + ']').removeClass('selected');
            solutionObj.prevHighlightStep = solutionObj.curHighlightStep;
            solutionObj.curHighlightStep = turnId;
            $('[turn=' + turnId + ']').addClass('selected');
            let turnObj = solutionObj.stepArr[turnId];
            let boardKey = turnObj.board;

            if (isStart) {
                return drawBoardKey(boardKey, () => {
                    let moveObj = turnObj.nextArr[turnObj.nextChoice];

                    animatePieceMove(moveObj[Object.keys(moveObj)[0]], callback);
                });
            } else {
                let moveObj = turnObj.nextArr[turnObj.nextChoice];
                animatePieceMove(moveObj[Object.keys(moveObj)[0]], callback);
            }
        }

        $('#infoDiv').on('click', '.stepText', function (evt) {
            const turnId = $(this).attr('turn');
            animateStep(turnId);
        })
        $('#infoDiv').on('click', '.playFuncRow', function (evt) {
            console.log('func', this, evt);
            const id = $(evt.target).attr('id');
            let isPause = false;
            switch (id) {
                // case 'animatePreStep':
                //     animateStep(solutionObj.curHighlightStep)
                //     break;
                case 'animatePlayStep':
                    let turn = 0;
                    animateStep(0, true);
                    let ani = function () {
                        setTimeout(() => {
                            if (!isPause && solutionObj.stepArr[turn].nextArr.length > 0) {
                                animateStep(turn++, false, ani());
                            }
                        }, 1000);
                    }
                    ani();
                    break;
                case 'animatePauseStep':
                    isPause = !isPause;
                    break;
                // case 'animateNextStep':
                //     break;
            }
        })
        function initSolutionDiv(srcObj) {
            let $div = $('#solutionDiv');
            let solutionObj = {
                prevHighlightStep: 0,
                curHighlightStep: 0,
                stepArr: [{
                    board: srcObj.steps[0].curBoard,
                    nextArr: srcObj.steps[0].next,
                    nextChoice: 0
                }],
                stepObj: srcObj.steps,
                maxStep: 10
            }
            let $stepTable = $div.find('#stepTable');
            $stepTable.html('');
            let tdTemplate = $('#sampleStepDiv');

            for (let i = 0; i < srcObj.maxSolLength / 2; i++) {
                let newTr = $('<tr>');
                newTr.append('<td>' + (i + 1) + '</td>');
                newTr.append($('<td>')
                    .html($('<a>', {
                            class: 'stepText rStep'
                        }).attr('turn', parseInt(i * 2))
                    )
                );
                newTr.append($('<td>')
                    .html($('<a>', {
                            class: 'stepText bStep'
                        }).attr('turn', parseInt(i * 2 + 1))
                    )
                );
                // newTr.append($('<td>', {
                //     class: 'step bStep'
                // }).attr('turn', parseInt(i * 2 + 1)));

                $stepTable.append(newTr);
            }
            $stepTable.append($stepTable);

            drawFromSolStep(solutionObj, 0);
            return solutionObj;
        }

        const pieceNameObj = {
            c: "车",
            m: "马",
            p: "炮",
            b: "兵",
            s: "士",
            x: "相",
            j: "将",
        }
        const directionObj = {
            fwd: '进',
            bwd: '退',
            hor: '平'
        }

        function generateMoveName(moveObj) {
            let pieceName = pieceNameObj[moveObj.pieceName];
            let dire = directionObj[moveObj.direction];
            return pieceName + moveObj.oriPos + dire + moveObj.newPos;
        }

        function drawFromSolStep(solObj, step) {
            if (solObj.stepArr.length <= step) {
                return;
            }
            let curObj = solObj.stepArr[step];
            // drawBoardKey(curObj.board);
            if (!curObj.nextArr) {
                return
            }
            let nextStep = curObj.nextArr[curObj.nextChoice];
            let nextStepId = Object.keys(nextStep)[0];
            let moveObj = nextStep[nextStepId];
            let moveName = generateMoveName(moveObj) + (curObj.nextArr.length > 1 ? '*' : '');
            $('table#stepTable').find('[turn=' + step + ']').text(moveName);
            solObj.stepArr[step + 1] = {
                board: solObj.stepObj[nextStepId].curBoard,
                nextArr: solObj.stepObj[nextStepId].next,
                nextChoice: 0
            }
            return setTimeout(function () {
                drawFromSolStep(solObj, step + 1)
            }, MoveStepSpeed)

        }

        function drawBoardKey(boardKey, callback) {
            $('#chessboarddiv .pieceSize').attr('src', null);
            const pieceStr = boardKey.slice(1);
            'ccmmppbbbbbssxxj'.split('').forEach((k, idx) => {
                [0, 32].forEach(offset => {
                    let pos = pieceStr.slice(idx * 2 + offset, idx * 2 + 2 + offset);
                    if (pos != '00') {
                        let key = offset == 0 ? ('r' + k) : ('b' + k);
                        $('.boardPos' + pos).find('img').attr('src', getPieceImgStr(key));
                    }
                })

            })
            return callback && callback();
        }

        function animatePieceMove(dataObj, callback) {
            let $img = $('.boardPos' + dataObj.pos1);
            let $to = $('.boardPos' + dataObj.pos2);
            let oriTop = $img.css('top');
            let oriLeft = $img.css('left');

            $img.animate({
                top: $to.css('top'),
                left: $to.css('left'),
                'z-index': 1000
            }, 200, function () {
                // Animation complete.
                $to.find('img').attr('src', $img.find('img').attr('src'));
                $img.css('top', oriTop).css('left', oriLeft);
                $img.find('img').attr('src', null).css('z-index', 1);
                callback && callback();
            });
        }

        return {

            init: function (skt) {
                mySkt = skt;
                $('select#boardType').on('change', target => {
                    console.log('board change');
                    curBoardTag = $('select#boardType').val();
                    setBaseData(null, null, curBoardTag, function () {
                        drawBoard();
                    })
                });
                $('select#pieceType').on('change', target => {
                    let tag = $('select#pieceType').val().split('.');
                    curPieceFolder = tag[0];
                    curPieceExt = tag[1];
                    console.log('piece change');
                    setBaseData(curPieceFolder, curPieceExt, null, function () {
                        drawBoard();
                    })
                });
                $('#boardFuncList').on('click', function (event) {
                    let id = $(event.target).attr('id');
                    switch (id) {
                        case 'btnSetupBoard':
                            initSetupBoard();
                            break;
                        case 'btnResetBoard':
                            resetSetupBoard();
                            break;
                        case 'btnSubmitBoard':
                            submitBoard();
                            break;
                        case 'getTemp':

                            //let resData = JSON.parse('{"startKey":"r3161440036560000000000000000005998007377410048570000005160527050","solList":[["r3161440036560000000000000000005998007377410048570000005160527050","b3061440036560000000000000000005998007377410048570000005160527050","r3061440036560000000000000000005998007377400048570000005160527050","b4061440036560000000000000000005998007377000048570000005160527050","r0061440036560000000000000000005998007377000048570000005160527040","b0060440036560000000000000000005998007377000048570000005100527040","r0000440036560000000000000000005998007377000048570000006000527040","b0000440046560000000000000000005998007377000048570000006000527040"],["r3161440036560000000000000000005998007377410048570000005160527050","b3061440036560000000000000000005998007377410048570000005160527050","r3061440036560000000000000000005998007377400048570000005160527050","b4061440036560000000000000000005998007377000048570000005160527050","r0061440036560000000000000000005998007377000048570000005160527040","b0060440036560000000000000000005998007377000048570000005100527040","r0060440036560000000000000000005998007377000048570000005100527041","b0060440046560000000000000000005998007377000048570000005100527041","r0060440046560000000000000000005998007377000048570000004200527041","b0060250046560000000000000000005998007377000048570000004200527041","r0060250046560000000000000000005998007377000048570000005100527041","b0060330046560000000000000000005998007377000048570000005100527041","r0060330046560000000000000000005998007377000048570000005100527042","b0060450046560000000000000000005998007377000048570000005100527042"]],"steps":{"0":{"curBoard":"r3161440036560000000000000000005998007377410048570000005160527050","next":[{"1":{"pieceName":"c","oriPos":7,"direction":"fwd","newPos":1,"pos1":"31","pos2":"30"}}]},"1":{"curBoard":"b3061440036560000000000000000005998007377410048570000005160527050","next":[{"2":{"pieceName":"p","oriPos":"4","direction":"bwd","newPos":1,"pos1":"41","pos2":"40"}}]},"2":{"curBoard":"r3061440036560000000000000000005998007377400048570000005160527050","next":[{"3":{"pieceName":"c","oriPos":7,"direction":"hor","newPos":6,"pos1":"30","pos2":"40"}}]},"3":{"curBoard":"b4061440036560000000000000000005998007377000048570000005160527050","next":[{"4":{"pieceName":"j","oriPos":"5","direction":"hor","newPos":"4","pos1":"50","pos2":"40"}}]},"4":{"curBoard":"r0061440036560000000000000000005998007377000048570000005160527040","next":[{"5":{"pieceName":"c","oriPos":4,"direction":"fwd","newPos":1,"pos1":"61","pos2":"60"}}]},"5":{"curBoard":"b0060440036560000000000000000005998007377000048570000005100527040","next":[{"6":{"pieceName":"s","oriPos":"5","direction":"bwd","newPos":"6","pos1":"51","pos2":"60"}},{"9":{"pieceName":"j","oriPos":"4","direction":"fwd","newPos":1,"pos1":"40","pos2":"41"}}]},"6":{"curBoard":"r0000440036560000000000000000005998007377000048570000006000527040","next":[{"7":{"pieceName":"p","oriPos":7,"direction":"hor","newPos":6,"pos1":"36","pos2":"46"}}]},"7":{"curBoard":"b0000440046560000000000000000005998007377000048570000006000527040","next":[]},"8":{"curBoard":"r3161440036560000000000000000005998007377410048570000005160527050","next":[{"1":{"pieceName":"c","oriPos":7,"direction":"fwd","newPos":1,"pos1":"31","pos2":"30"}}]},"9":{"curBoard":"r0060440036560000000000000000005998007377000048570000005100527041","next":[{"10":{"pieceName":"p","oriPos":7,"direction":"hor","newPos":6,"pos1":"36","pos2":"46"}}]},"10":{"curBoard":"b0060440046560000000000000000005998007377000048570000005100527041","next":[{"11":{"pieceName":"s","oriPos":"5","direction":"fwd","newPos":"4","pos1":"51","pos2":"42"}}]},"11":{"curBoard":"r0060440046560000000000000000005998007377000048570000004200527041","next":[{"12":{"pieceName":"m","oriPos":6,"direction":"bwd","newPos":8,"pos1":"44","pos2":"25"}}]},"12":{"curBoard":"b0060250046560000000000000000005998007377000048570000004200527041","next":[{"13":{"pieceName":"s","oriPos":"4","direction":"bwd","newPos":"5","pos1":"42","pos2":"51"}}]},"13":{"curBoard":"r0060250046560000000000000000005998007377000048570000005100527041","next":[{"14":{"pieceName":"m","oriPos":8,"direction":"fwd","newPos":7,"pos1":"25","pos2":"33"}}]},"14":{"curBoard":"b0060330046560000000000000000005998007377000048570000005100527041","next":[{"15":{"pieceName":"j","oriPos":"4","direction":"fwd","newPos":1,"pos1":"41","pos2":"42"}}]},"15":{"curBoard":"r0060330046560000000000000000005998007377000048570000005100527042","next":[{"16":{"pieceName":"m","oriPos":7,"direction":"bwd","newPos":6,"pos1":"33","pos2":"45"}}]},"16":{"curBoard":"b0060450046560000000000000000005998007377000048570000005100527042","next":[]}},"maxSolLength":14}');
                            let resData = JSON.parse('{"startKey":"r2355000000004400000000000000005968807700000000000000005162000041","solList":[["r2355000000004400000000000000005968807700000000000000005162000041","b4355000000004400000000000000005968807700000000000000005162000041","r4355000000004400000000000000005968807700000000000000004262000041","b4255000000004400000000000000005968807700000000000000000062000041","r0055000000004400000000000000005968807700000000000000000062000042","b0055000000004300000000000000005968807700000000000000000062000042","r0055000000004300000000000000005968807700000000000000000062000041","b0055000000004200000000000000005968807700000000000000000062000041","r0055000000000000000000000000005968807700000000000000000062000042","b0045000000000000000000000000005968807700000000000000000062000042"],["r2355000000004400000000000000005968807700000000000000005162000041","b4355000000004400000000000000005968807700000000000000005162000041","r4355000000004400000000000000005968807700000000000000004262000041","b4255000000004400000000000000005968807700000000000000000062000041","r0055000000004400000000000000005968807700000000000000000062000042","b0055000000004300000000000000005968807700000000000000000062000042","r0055000000004300000000000000005968807700000000000000000062000041","b0055000000004200000000000000005968807700000000000000000062000041","r0055000000004200000000000000005968807700000000000000000062000040","b0055000000004100000000000000005968807700000000000000000062000040","r0055000000000000000000000000005968807700000000000000000062000041","b0045000000000000000000000000005968807700000000000000000062000041"]],"steps":{"0":{"curBoard":"r2355000000004400000000000000005968807700000000000000005162000041","next":[{"1":{"pieceName":"c","oriPos":8,"direction":"hor","newPos":6,"pos1":"23","pos2":"43"}}]},"1":{"curBoard":"b4355000000004400000000000000005968807700000000000000005162000041","next":[{"2":{"pieceName":"s","oriPos":"5","direction":"fwd","newPos":"4","pos1":"51","pos2":"42"}}]},"2":{"curBoard":"r4355000000004400000000000000005968807700000000000000004262000041","next":[{"3":{"pieceName":"c","oriPos":6,"direction":"fwd","newPos":1,"pos1":"43","pos2":"42"}}]},"3":{"curBoard":"b4255000000004400000000000000005968807700000000000000000062000041","next":[{"4":{"pieceName":"j","oriPos":"4","direction":"fwd","newPos":1,"pos1":"41","pos2":"42"}}]},"4":{"curBoard":"r0055000000004400000000000000005968807700000000000000000062000042","next":[{"5":{"pieceName":"b","direction":"fwd","newPos":1,"pos1":"44","pos2":"43"}}]},"5":{"curBoard":"b0055000000004300000000000000005968807700000000000000000062000042","next":[{"6":{"pieceName":"j","oriPos":"4","direction":"bwd","newPos":1,"pos1":"42","pos2":"41"}}]},"6":{"curBoard":"r0055000000004300000000000000005968807700000000000000000062000041","next":[{"7":{"pieceName":"b","direction":"fwd","newPos":1,"pos1":"43","pos2":"42"}}]},"7":{"curBoard":"b0055000000004200000000000000005968807700000000000000000062000041","next":[{"8":{"pieceName":"j","oriPos":"4","direction":"fwd","newPos":1,"pos1":"41","pos2":"42"}},{"11":{"pieceName":"j","oriPos":"4","direction":"bwd","newPos":1,"pos1":"41","pos2":"40"}}]},"8":{"curBoard":"r0055000000000000000000000000005968807700000000000000000062000042","next":[{"9":{"pieceName":"c","oriPos":5,"direction":"hor","newPos":6,"pos1":"55","pos2":"45"}}]},"9":{"curBoard":"b0045000000000000000000000000005968807700000000000000000062000042","next":[]},"10":{"curBoard":"r2355000000004400000000000000005968807700000000000000005162000041","next":[{"1":{"pieceName":"c","oriPos":8,"direction":"hor","newPos":6,"pos1":"23","pos2":"43"}}]},"11":{"curBoard":"r0055000000004200000000000000005968807700000000000000000062000040","next":[{"12":{"pieceName":"b","direction":"fwd","newPos":1,"pos1":"42","pos2":"41"}}]},"12":{"curBoard":"b0055000000004100000000000000005968807700000000000000000062000040","next":[{"13":{"pieceName":"j","oriPos":"4","direction":"fwd","newPos":1,"pos1":"40","pos2":"41"}}]},"13":{"curBoard":"r0055000000000000000000000000005968807700000000000000000062000041","next":[{"14":{"pieceName":"c","oriPos":5,"direction":"hor","newPos":6,"pos1":"55","pos2":"45"}}]},"14":{"curBoard":"b0045000000000000000000000000005968807700000000000000000062000041","next":[]}},"maxSolLength":12}');
                            // displayInfo('solution', resData);
                            solutionObj = initSolutionDiv(resData);
                            break;

                    }
                    return true;
                })

                // submitBoard
                $('#confirm').on('click', function () {
                    testPos(parseInt($('#top').val()), parseInt($('#btm').val()), parseInt($('#left').val()), parseInt($('#right').val()));
                })
                $('#pieceType').trigger('change');
                $('#boardType').trigger('change');
                initDrag();
                // initPage();
                //get basic settings

            }
        };
    })
})()