const local = {
    ip: 'http://localhost',
    port: 5729
}
const acer = {
    ip: 'http://localhost',
    port: 5729
}
const production = {
    ip: 'https://webutil.herokuapp.com',
    port: 80
}

var env = {
    mode: process.env.NODE_ENV || 'local',
    config: function () {
        switch (this.mode) {
            case 'local':
                return local;
            case 'acer':
                return acer;
            case 'production':
                return production;
        }
    }
}
module.exports = env;