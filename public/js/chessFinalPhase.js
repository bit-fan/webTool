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
            if(!pieceFolder || !pieceExt || !boardTag){
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
                board: $.extend({}, boardObj[boardTag])
            }
            baseData.board.img = imgBaseDir + "board/" + baseData.board.img;
            console.log(baseData);
            if (callback) {
                callback();
            }
        }

        function initSetupPage() {
            let row1 = $('<div>').attr('id', 'piecerow1');
            let row2 = $('<div>').attr('id', 'piecerow2');
            let width = $('#piecesList').width();

            let pieceArray = ['c', 'm', 'p', 'b', 's', 'x'];
            ['r', 'b'].forEach(color => {
                let nowDiv = color === "r" ? row1 : row2;
                ['c', 'm', 'p', 'b', 's', 'x'].forEach(piece => {
                    let pieceDiv = $("<img>", {
                        src: baseData[color + piece].img,
                        class:"pieceSize"
                    });
                    nowDiv.append(pieceDiv);
                })
            })
            $('#piecesList').html('').append(row1).append(row2);
            drawBoard();

        }

        function drawBoard() {
            let width = $('#piecesList').width();
            $('#chessboarddiv').css('background-image', 'url(' + baseData.board.img + ')');
            $('#chessboarddiv').height(width * baseData.board.height / baseData.board.width);

            testPos(baseData.board.mTop, baseData.board.mBtm, baseData.board.mLeft, baseData.board.mRight);
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
        }
        // function tempDrag(){
        //     const dragDOM = document.getElementById('drag');
        //     const body = document.body;
        //
        //     const mouseDown = Rx.Observable.fromEvent(dragDOM, 'mousedown');
        //     const mouseUp = Rx.Observable.fromEvent(body, 'mouseup');
        //     const mouseMove = Rx.Observable.fromEvent(body, 'mousemove');
        //
        //     mouseDown
        //         .map(event => mouseMove.takeUntil(mouseUp))
        //         .concatAll()
        //         .map(event => ({ x: event.clientX, y: event.clientY }))
        //         .subscribe(pos => {
        //             dragDOM.style.left = pos.x + 'px';
        //             dragDOM.style.top = pos.y + 'px';
        //         })
        // }

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