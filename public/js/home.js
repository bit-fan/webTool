(function () {
    require([], function () {
        // var socket = io('http://localhost:' + constPara.port);
        // console.log(socket);
        var skt = new mySocket(io, io(serverIP + ':' + serverPort));
        $('#funcCate').on('click', 'li', function (event) {
            require(['js/' + $(this).attr('file')], function (a) {
                a.init(skt);
            })
        })
    })
})();