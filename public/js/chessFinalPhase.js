(function () {
    define([], function () {
        const imgBaseDir = '../src/img/chess/';
        var curBoardTag, curPieceFolder, curPieceExt, baseData = {};
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

        function addDragEvt(domQuery, startEvt, nextFunc, finalFunc,errFunc) {

            const mouseDown = Rx.Observable.create(function (o) {
                $('body').on('mousedown', domQuery, function (ev) {
                    ev.preventDefault();
                    o.onNext(ev);
                })
            });

            const mouseUp = Rx.Observable.create(function (o) {
                $('body').on('mouseup', function (ev) {
                    ev.preventDefault();
                    console.log('mouseup');
                    o.onNext(ev);
                    finalFunc(ev);
                })
            });

            const body = document.body;
            // const mouseUp = Rx.Observable.fromEvent(body, 'mouseup');
            const mouseMove = Rx.Observable.fromEvent(body, 'mousemove');

            mouseDown
                .map(event => {
                    startEvt(event);
                    return mouseMove.takeUntil(mouseUp)
                })
                .concatAll()
                .map(event => {
                    // console.log('event', event);
                    // return {x: event.clientX, y: event.clientY}
                    return event;
                })
                .subscribe(evt => {
                    // console.log(dragDOM);
                    // dragDOM[0].style.left = pos.x + 'px';
                    // dragDOM[0].style.top = pos.y + 'px';
                    nextFunc(evt)
                }, err => {
                    errFunc(err);
                }, () => {
                    console.log('done');
                })
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

            let avalPieceObj = {
                bb: [],
                bj: [],
                bs: [],
                bx: [],

                rb: [],
                rj: [],
                rs: [],
                rx: [],
            };
            for (let row = 0; row < 10; row++) {
                for (let col = 0; col < 9; col++) {
                    let avalPiece = [];
                    let label = col + 1 + '' + (row + 1);

                    //红兵
                    if (row < 6 || (row === 6 && col % 2 === 0)) {
                        avalPiece.push('rb');
                        avalPieceObj['rb'].push(label);
                    }
                    //黑兵
                    if (row > 3 || (row === 3 && col % 2 === 0)) {
                        avalPiece.push('bb');
                        avalPieceObj['bb'].push(label);
                    }
                    //红士
                    let testRS = (row - 8) * (row - 8) + (col - 4) * (col - 4);
                    if (testRS === 0 || testRS === 2) {
                        avalPiece.push('rs');
                        avalPieceObj['rs'].push(label);
                    }
                    if (testRS < 2.1) {
                        avalPiece.push('rj');
                        avalPieceObj['rj'].push(label);
                    }
                    //红象
                    let testRX1 = (row - 7) * (row - 7) + (col - 2) * (col - 2);
                    let testRX2 = (row - 7) * (row - 7) + (col - 6) * (col - 6);
                    if (testRX1 === 4 || testRX2 === 4) {
                        avalPiece.push('rx');
                        avalPieceObj['rx'].push(label);
                    }
                    //黑士
                    let testBS = (row - 1) * (row - 1) + (col - 4) * (col - 4);
                    if (testBS === 0 || testBS === 2) {
                        avalPiece.push('bs');
                        avalPieceObj['bs'].push(label);
                    }
                    if (testBS < 2.1) {
                        avalPiece.push('bj');
                        avalPieceObj['bj'].push(label);
                    }
                    //黑象
                    let testBX1 = (row - 2) * (row - 2) + (col - 2) * (col - 2);
                    let testBX2 = (row - 2) * (row - 2) + (col - 6) * (col - 6);
                    if (testBX1 === 4 || testBX2 === 4) {
                        avalPiece.push('bx');
                        avalPieceObj['bx'].push(label);
                    }

                    baseData.boardMatrix[(col + 1) + '' + (row + 1)] = {
                        col: col + 1,
                        row: row + 1,
                        left: baseData.board.mLeft + col * colUnit,
                        top: baseData.board.mTop + row * rowUnit,
                        availPieceArr: avalPiece,

                    }

                }
            }
            baseData.availPieceByPiece = avalPieceObj;
            console.log(baseData);
            if (callback) {
                callback();
            }
        }

        function initSetupBoard() {
            let row1 = $('<div>').attr('id', 'piecerow1');
            let row2 = $('<div>').attr('id', 'piecerow2');
            let width = $('#piecesListWrapper').width();
            let finalBoard={};

            ['r', 'b'].forEach(color => {
                let nowDiv = color === "r" ? row1 : row2;
                ['c', 'm', 'p', 'b', 's', 'x', 'j'].forEach(piece => {
                    let pieceDiv = $("<img>", {
                        src: baseData[color + piece].img,
                        class: "pieceSize pickPiece"
                    }).attr('pieceName', color + piece);
                    nowDiv.append(pieceDiv);
                })
            })
            $('#piecesList').html('').append(row1).append(row2);


            $.each(baseData.boardMatrix, (k, v) => {
                if (v.availPieceArr.length > 0) {
                    console.log('v.col, v.row, v.availPieceArr', v.col, v.row, v.availPieceArr);
                    let img = $('<img>', {
                        width: 50,
                        height: 50
                    }).addClass('.pieceSize availPiece' + v.col + v.row);
                    let newDiv = $('<div>')
                        .attr('col', v.col)
                        .attr('row', v.row)
                        .addClass("pieceSize pieceImg piececandidate")
                        .css('top', v.top + '%')
                        .css('left', v.left + '%').append(img);
                    $('#chessboarddiv').append(newDiv);
                    // changePiece('.test' + v.col + v.row, v.col, v.row, v.availPieceArr, 0);
                }
            })
            let piece = null,thisPieceDom=null,targetPos=null;
            addDragEvt('.pickPiece', function (evt) {
                thisPieceDom=$(evt.target);
                piece = $(evt.target).attr('pieceName');
                $('#chessboarddiv .blink').removeClass('blink');
                if (baseData.availPieceByPiece[piece]) {
                    baseData.availPieceByPiece[piece].forEach(label => {
                        $('#chessboarddiv .availPiece' + label).prop('src', baseData[piece].img).addClass('blink');
                    })
                } else {
                    //blink all
                }
                console.log('click', evt)
            }, function (evt) {
                console.log('move', evt);
                let a=document.elementFromPoint(evt.clientX-25, evt.clientY-25)
                let className=evt.target.className;
                console.log(className,a);
                $(thisPieceDom).offset({top:evt.clientY-25,left:evt.clientX-25});
            },function(ev){
                console.log('final',ev);
            }, function (evt) {
                console.log('err', evt)
            });

        }

        function drawBoard() {
            let width = $('#piecesListWrapper').width();
            $('#chessboarddiv').css('background-image', 'url(' + baseData.board.img + ')');
            $('#chessboarddiv').height(width * baseData.board.height / baseData.board.width);

            // testPos(baseData.board.mTop, baseData.board.mBtm, baseData.board.mLeft, baseData.board.mRight);
            // testPiece();
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
                $('#confirm').on('click', function () {
                    testPos(parseInt($('#top').val()), parseInt($('#btm').val()), parseInt($('#left').val()), parseInt($('#right').val()));
                })
                $('#pieceType').trigger('change');
                $('#boardType').trigger('change');

                // initPage();
                //get basic settings

            }
        };
    })
})()