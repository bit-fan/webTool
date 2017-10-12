const douyu = require('./douyuVideo');
const chessFinal = require('./chessFinal');
const Q = require('q');

var funcKeyMapping = {};

function addMapping(src) {
    if (!src) return;
    for (var key in src) {
        funcKeyMapping[key] = src[key];
    }
}
addMapping(douyu.socket);
addMapping(chessFinal.socket);

function addSocket(socket, key) {
    socket.on(key, function (reqData) {
        return Q.resolve(funcKeyMapping[key].call(this, reqData, socket)).then(
            resData => {
                socket.emit('_' + key, {
                    status: 200, data: resData
                });
            },
            failData => {
                socket.emit('_' + key, {
                    status: 400, data: failData
                });
            }
        );
    })
}
var func = {
    addListener: function (socket) {
        for (var key in funcKeyMapping) {
            addSocket(socket, key);
        }
    }
}
module.exports = func;