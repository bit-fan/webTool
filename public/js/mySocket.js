function mySocket(io, http) {
    this.io = io;
    this.socket = io.connect()//http);
}
mySocket.prototype.send = function (key, data, success, fail) {
    data = data || {};
    this.socket.emit(key, data);
    this.socket.once('_' + key, function (a) {
        console.log('heard', '_' + key, a);
        if (a.status == 200) {
            success ? success.call(this, a.data) : '';
        } else {
            fail ? fail.call(this, a.data) : '';
        }
    })
}
mySocket.prototype.on = function (key, func) {
    this.socket.off(key);
    this.socket.on(key, function (a) {
        func.call(this, a);
    })
}