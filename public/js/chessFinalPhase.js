(function () {
    define([], function () {
        const imgBaseDir = '../src/img/chess/';
        baseData = {
            bb: {img: imgBaseDir + "bb.jpg", maxCount: 5},
            bc: {img: imgBaseDir + "bc.jpg", maxCount: 2},
            bj: {img: imgBaseDir + "bj.jpg", maxCount: 1},
            bm: {img: imgBaseDir + "bm.jpg", maxCount: 2},
            bp: {img: imgBaseDir + "bp.jpg", maxCount: 2},
            bs: {img: imgBaseDir + "bs.jpg", maxCount: 2},
            bx: {img: imgBaseDir + "bx.jpg", maxCount: 2},

            rb: {img: imgBaseDir + "rb.jpg", maxCount: 5},
            rc: {img: imgBaseDir + "rc.jpg", maxCount: 2},
            rj: {img: imgBaseDir + "rj.jpg", maxCount: 1},
            rm: {img: imgBaseDir + "rm.jpg", maxCount: 2},
            rp: {img: imgBaseDir + "rp.jpg", maxCount: 2},
            rs: {img: imgBaseDir + "rs.jpg", maxCount: 2},
            rx: {img: imgBaseDir + "rx.jpg", maxCount: 2},
            boardArr: [
                {
                    img: imgBaseDir + "board0.jpg",
                    height: 951,
                    width: 925,
                    mTop:3,
                    mBtm:3,
                    mLeft:7,
                    mRight:7,
                }, {
                    img: imgBaseDir + "board1.jpg",
                    height: 416,
                    width: 375,
                    mTop:7,
                    mBtm:7,
                    mLeft:7,
                    mRight:7,
                }
            ]
        }
        var curBoardIdx = 1;

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
                        width: width / 9-1,
                        height: width / 9-1,
                    });
                    nowDiv.append(pieceDiv);
                })
            })
            $('#piecesList').html('').append(row1).append(row2);
            drawBoard();

        }
        function drawBoard(){
            let width=$('#piecesList').width();
            $('#chessboarddiv').css('background-image', 'url(' + baseData.boardArr[curBoardIdx].img + ')');
            $('#chessboarddiv').height(width*baseData.boardArr[curBoardIdx].height/baseData.boardArr[curBoardIdx].width);
            baseData.boardArr[curBoardIdx].mTop
            
            testPos(baseData.boardArr[curBoardIdx].mTop,baseData.boardArr[curBoardIdx].mBtm,baseData.boardArr[curBoardIdx].mLeft,baseData.boardArr[curBoardIdx].mRight);
        }
        function testPos(mTop,mBtm,mLeft,mRight){
            alert(mTop+' '+mBtm+' '+mLeft+' '+mRight);
            $('.testImg').remove();
            let wStep=(100-mLeft-mRight)/8;
            let hStep=(100-mTop-mBtm)/9;
            for(let w=0;w<9;w++){
                for(let h=0;h<10;h++){
                    let temp=$('<div>',{
                        class:"testImg",
                    }).css('position','absolute')
                        .css('top',mTop+hStep*h+'%')
                        .css('left',mLeft+wStep*w+'%');
                    $('#chessboarddiv').append(temp);
                }

            }
        }

        return {

        init: function (skt) {
            $('select#boardType').on('change', target => {
                curBoardIdx = parseInt($(event.currentTarget).val());
                drawBoard();
            });
            $('#confirm').on('click',function(){
                testPos(parseInt($('#top').val()),parseInt($('#btm').val()),parseInt($('#left').val()),parseInt($('#right').val()));
            })

            initSetupPage();
                // initPage();
                //get basic settings

            }
        };
    })
})()