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
                    let avalPiece = [];
                    //红兵
                    if (row < 6 || (row === 6 && col % 2 === 0)) {
                        avalPiece.push('rb');
                    }
                    //黑兵
                    if (row > 3 || (row === 3 && col % 2 === 0)) {
                        avalPiece.push('bb');
                    }
                    //红士
                    let testRS = (row - 8) * (row - 8) + (col - 4) * (col - 4);
                    if (testRS === 0 || testRS === 2) {
                        avalPiece.push('rs');
                    }
                    if (testRS < 2.1) {
                        avalPiece.push('rj');
                    }
                    //红象
                    let testRX1 = (row - 7) * (row - 7) + (col - 2) * (col - 2);
                    let testRX2 = (row - 7) * (row - 7) + (col - 6) * (col - 6);
                    if (testRX1 === 4 || testRX2 === 4) {
                        avalPiece.push('rx');
                    }
                    //黑士
                    let testBS = (row - 1) * (row - 1) + (col - 4) * (col - 4);
                    if (testBS === 0 || testBS === 2) {
                        avalPiece.push('bs');
                    }
                    if (testBS < 2.1) {
                        avalPiece.push('bj');
                    }
                    //黑象
                    let testBX1 = (row - 2) * (row - 2) + (col - 2) * (col - 2);
                    let testBX2 = (row - 2) * (row - 2) + (col - 6) * (col - 6);
                    if (testBX1 === 4 || testBX2 === 4) {
                        avalPiece.push('bx');
                    }

                    baseData.boardMatrix[(col + 1) + '' + (row + 1)] = {
                        col: col + 1,
                        row: row + 1,
                        left: baseData.board.mLeft + col * colUnit,
                        top: baseData.board.mTop + row * rowUnit,
                        availPieceArr: avalPiece
                    }
                }
            }
            console.log(baseData);
            if (callback) {
                callback();
            }
        }

        function initSetupPage() {
            let row1 = $('<div>').attr('id', 'piecerow1');
            let row2 = $('<div>').attr('id', 'piecerow2');
            let width = $('#piecesListWrapper').width();

            ['r', 'b'].forEach(color => {
                let nowDiv = color === "r" ? row1 : row2;
                ['c', 'm', 'p', 'b', 's', 'x'].forEach(piece => {
                    let pieceDiv = $("<img>", {
                        src: baseData[color + piece].img,
                        class: "pieceSize pickPiece"
                    });
                    nowDiv.append(pieceDiv);
                })
            })
            $('#piecesList').html('').append(row1).append(row2);
            drawBoard();

        }

        function drawBoard() {
            let width = $('#piecesListWrapper').width();
            $('#chessboarddiv').css('background-image', 'url(' + baseData.board.img + ')');
            $('#chessboarddiv').height(width * baseData.board.height / baseData.board.width);

            // testPos(baseData.board.mTop, baseData.board.mBtm, baseData.board.mLeft, baseData.board.mRight);
            testPiece();
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
                console.log('col,row,arr,idx', className,col, row, arr, idx,baseData[arr[idx]].img);
                $(className).prop('src', baseData[arr[idx]].img);
                setTimeout(function () {
                    changePiece(className, col, row, arr, (idx + 1) % arr.length)
                }, 7000);
            }

            $.each(baseData.boardMatrix, (k, v) => {
                if (v.availPieceArr.length > 0) {
                    console.log('v.col, v.row, v.availPieceArr', v.col, v.row, v.availPieceArr);
                    let className = "pieceSize testImg";// test" + v.col + v.row;
                    let img=$('<img>',{
                        width:50,
                        height:50
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
                        initSetupPage();
                    })
                });
                $('select#pieceType').on('change', target => {
                    let tag = $('select#pieceType').val().split('.');
                    curPieceFolder = tag[0];
                    curPieceExt = tag[1];
                    console.log('piece change');
                    setBaseData(curPieceFolder, curPieceExt, null, function () {
                        initSetupPage();
                    })
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