const cheerio = require('cheerio');
const util = require('./util');

const douyu = {
    listPrefix: '/video/video/listData',
    actionType: ['hot', 'new', 'num'],
    para: ['cate1Id', 'cate2Id', 'page', 'action']
}


var local = {
    getDota2Video: function (content) {
        var $ = cheerio.load(content);

        var obj = JSON.parse(content);
        for (key in obj.data) {
            console.log(key);
        }
        // console.log(JSON.parse(content));
        $('a[data-cid][data-vid][data-tid]').each((i, item) => {
            // console.log(item);
            // console.log($(item).attr('data-tid'));
            if ($(item).attr('data-tid') == tid) {
                console.log($(item).attr('title'));
            }
        })

        //test:
        // this.getSite('https', 'v.douyu.com', '/video/video/listData?page=3&cate1Id=1&cate2Id=6&action=hot').then(data => {
        //     var $1 = cheerio.load(data);
        //     $($1).each((a, b) => {
        //         console.log(a, $(b));
        //     })
        // })
    },
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
            // console.log(result);
            return {cate1: result.cate1_arr, cate2: result.cate2_arr}
        })
    },

    getQueryContent: function (query) {
        return util.getSite('https', 'v.douyu.com', douyu.listPrefix, query).then(data => {
            var result = local.parseWithProp(data, 'data');
            return {
                list: result.list, count: result.count, cate1_id: result.cate1_id,
                cate2_id: result.cate2_id, page_count: result.page_count
            }
        })
    },
    getDouyuDota2Link: function (para, socket) {
        var tid = '';
        para = para || {gameName: ''};
        util.getSite('https', 'v.douyu.com', douyu.listPrefix)
            .then(result => {
                var list = local.parseWithProp(result, 'data');
                if (list['cate2_arr'] && list['cate2_arr'].length > 0) {
                    var index = -1;
                    var foundList = list['cate2_arr'].filter(item => {
                        return item['cate2_name'].toUpperCase() == para.gameName.toUpperCase();
                    })
                    if (foundList && foundList.length == 1) {
                        tid = foundList[0].cate2_id;
                        return util.getSite('https', 'v.douyu.com', douyu.listPrefix, {cate2Id: tid})
                    }
                }
                return 'not found'
            })
            .then(result => {

                var dotaPage = JSON.parse(result);
                console.log(links[0]);
                tid = links[0].split('/').pop();
                console.log(tid);
                // return util.getSite('https', 'v.douyu.com', links[0])

                para[douyu.para[0]] = 1;
                para[douyu.para[1]] = tid;

                return util.getSite('https', 'v.douyu.com', douyu.listPrefix)
            })
            .then(result => {
                return local.getDota2Video(result)
            })
            .then(cont => {
                console.log(cont);
            })
    },
}
module.exports = {func: local, socket: socket}