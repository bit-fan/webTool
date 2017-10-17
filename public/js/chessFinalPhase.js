(function () {
    define([], function () {
        const imgBaseDir = '../src/img/chess/';
        var mySkt;
        var curBoardTag, curPieceFolder, curPieceExt, baseData = {}, finalBoard = {},
            mouseDownFlag = false, finalBoardKey = '';
        var dragEvtObj = {};
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
                    finalBoardKey=resData.boardKey;
                    displayInfo('validCheck', resData);
                }, failData => {
                    console.log(failData);
                    // setLoading(true, failData.code || 'Error');
                })
            })

        }

        function resetBoard() {
            $('#chessboarddiv').find('img').each(function () {
                console.log('$(this)', $(this));
                $(this).parent().empty().append('<img class="pieceSize">');
            });
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

        function initSetupBoard() {
            resetBoard();

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
            setDragEvt();
        }

        function drawBoard() {
            let width = $('#piecesListWrapper').width();
            $('#chessboarddiv').css('background-image', 'url(' + baseData.board.img + ')');
            $('#chessboarddiv').height(width * baseData.board.height / baseData.board.width);

            // testPos(baseData.board.mTop, baseData.board.mBtm, baseData.board.mLeft, baseData.board.mRight);
            // testPiece();
        }

        function submitBoard() {
            mySkt.send('chessStartBoard', finalBoardKey, resData => {
                console.log('res', resData);
                displayInfo('solution',resData);
            }, failData => {
                console.log(failData);
                // setLoading(true, failData.code || 'Error');
            })
        }

        function displayInfo(type, srcObj) {
            if (type == "validCheck") {
                $('#validCheckResult').removeClass('collapse');
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

            } else if(type=='solution'){
                

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
                $('#btnSetupBoard').on('click', () => {
                    initSetupBoard();
                });
                $('#btnResetBoard').on('click', () => {
                    resetBoard();
                })
                $('#btnSubmitBoard').on('click', () => {
                    submitBoard();
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