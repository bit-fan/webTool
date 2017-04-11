(function () {
    var isNode = (typeof module !== 'undefined' && module.exports);

    var rootObj = {
        port: 5729
    };


    if (isNode) {
        module.exports = rootObj;
    } else {
        define([], function () {
            return rootObj;
        });
    }
})();