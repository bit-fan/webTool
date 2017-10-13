const http = require('http');
const https = require('https');
const cheerio = require('cheerio');

var Q = require('q');


module.exports = {
    getSite: function (protocol, addr, path, paraObj) {
        var deferred = Q.defer();
        path = path || '/';
        paraObj = paraObj || {};
        var para = '?';
        for (var key in paraObj) {
            para += key + '=' + paraObj[key] + '&'
        }
        var content = '';
        var request = '';
        if (protocol == 'http') {
            request = http.get({
                'host': addr,
                'path': para == '?' ? path : path + para
            }, function (resp) {
                resp.setEncoding("utf8");
                resp.on('data', function (chunk) {
                    content += chunk;
                });
                resp.on('end', () => {
                    console.log('loaded', addr, para == '?' ? path : path + para);
                    deferred.resolve(content);
                });
            });
        } else if (protocol == 'https') {
            request = https.get({
                'host': addr,
                'path': para == '?' ? path : path + para
            }, function (resp) {
                resp.setEncoding("utf8");
                resp.on('data', function (chunk) {
                    content += chunk;
                });
                resp.on('end', () => {
                    console.log('loaded', addr, para == '?' ? path : path + para);
                    deferred.resolve(content);
                });
            });
        }
        request.on('error', function (err) {
            console.log(err);
            deferred.reject(err);
        })
        return deferred.promise
    },

    getIp: function () {
        var os = require('os');
        var ifaces = os.networkInterfaces();
        var result = [];
        Object.keys(ifaces).forEach(function (ifname) {
            var alias = 0;

            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }

                if (alias >= 1) {
                    // this single interface has multiple ipv4 addresses
                    console.log(ifname + ':' + alias, iface.address);
                    result.push([ifname, alias, iface.address])
                } else {
                    // this interface has only one ipv4 adress
                    console.log(ifname, iface.address);
                    result.push([ifname, 0, iface.address])
                }
                ++alias;
            });
        });
    },
    chunkStr(str, len){
        let newA = Array.from(str).reduce((ar, it, i) => {
            const ix = Math.floor(i / len);
            ar[ix] = ar[ix] || "";
            ar[ix] += it;
            return ar.map(i => parseInt(i));
        }, []);
        console.log(newA);
        return newA;
    }
}
