const cheerio = require('cheerio');
const util = require('./util');

const douyu = {
    listPrefix: '/video/video/listData',
    actionType: ['hot', 'new', 'num'],
    para: ['cate1Id', 'cate2Id', 'page', 'action']
}


var local = {
    parseWithProp: function (src, key) {
        if (!src)return '';
        var obj = JSON.parse(src);
        return obj && obj[key] ? obj[key] : {}
    }
}
var socket = {
    getVideoType: function () {
        return util.getSite('https', 'v.douyu.com', douyu.listPrefix).then(data => {
            var result = local.parseWithProp(data, 'data');
            return {cate1: result.cate1_arr, cate2: result.cate2_arr}
        })
    },

    getQueryContent: function (query) {
        query = query || {};
        query.action = query.action || 'new';
        return util.getSite('https', 'v.douyu.com', douyu.listPrefix, query).then(data => {
            var result = local.parseWithProp(data, 'data');
            return {
                list: result.list, count: result.count, cate1_id: result.cate1_id,
                cate2_id: result.cate2_id, page_count: result.page_count
            }
        })
    },
}
module.exports = {func: local, socket: socket}