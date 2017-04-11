(function () {
    define([], function () {
        var cate1Val, cate2Val, pageVal, mySkt, loadingPage, totalQueryResult, tbl, filterResult = {
            minViewer: null, maxViewer: null, minDur: null, maxDur: null, authArr: []
        };

        const TitleObj = {
            author: "作者",
            video_duration: "时长",
            contents: "内容",
            video_pic: "图",
            view_num: "观看人数"
        }

        function getMultiPage(countDown, newData) {
            pageVal = countDown;
            totalQueryResult = totalQueryResult.concat(newData);
            if (countDown != 0) {
                return getPage('simple');
            } else {
                totalQueryResult = totalQueryResult.filter(item => {
                    return item && item.url;
                })
                drawContent();
            }
        }

        function getPage(type) {
            if (!mySkt || loadingPage) {
                return setTimeout(function () {
                    getPage()
                }, 200);
            }
            var sendObj = {}
            cate1Val ? sendObj.cate1Id = cate1Val : '';
            cate2Val ? sendObj.cate2Id = cate2Val : '';
            pageVal ? sendObj.page = pageVal : 1;
            loadingPage = true;
            setLoading(true);
            mySkt.send('getQueryContent', sendObj, resData => {
                setLoading(false);
                console.log(resData);
                $('#totalPage').text(resData.page_count);
                $('#totalNumVideo').text(resData.count);
                if (type == 'single') {
                    totalQueryResult = resData.list;
                    var max = Math.min(resData.page_count, 20);
                    for (let i = 1; i < max; i++) {
                        let opt = $('<option>', {value: i}).text(i);
                        $('#firstPages').append(opt);
                    }
                    drawContent();
                } else {
                    getMultiPage(--pageVal, resData.list);
                }
            });
        }

        function setLoading(flag) {
            $('#loadingText').toggleClass('blink', flag).text(flag ? 'loading...' : '');
            loadingPage = false;
        }

        function filterContent(src) {
            return totalQueryResult.filter(item => {
                var valid = true;
                var viewer = parseInt(item.view_num);
                var dur = parseInt(item.video_duration.split(':')[0]);
                if (filterResult.maxViewer && viewer > filterResult.maxViewer) valid = false;
                else if (filterResult.minViewer && viewer < filterResult.minViewer) valid = false;
                else if (filterResult.maxDur && dur > filterResult.maxDur) valid = false;
                else if (filterResult.minDur && dur < filterResult.minDur) valid = false;
                return valid
            })
        }

        function drawContent() {
            console.log('totalQueryResult', totalQueryResult);
            var data = filterContent(totalQueryResult);
            if (!data) return;
            var colArr = [];
            for (var key in data[0]) {
                if (['cid1', 'cid2', 'point_id', 'video_str_duration', 'up_id'].indexOf(key) > -1) continue;
                var obj = {
                    title: TitleObj[key] || key,
                    data: key
                }
                if (key == 'url') {
                    obj.render = function (a, b, c) {
                        var link = $('<a>').attr('href', a).text('link');
                        return link.prop('outerHTML');
                    }
                } else if (key == 'video_pic') {
                    obj.render = function (a, b, c) {
                        var link = $('<img>', {width: '50px', height: '50px'}).attr('src', a);
                        return link.prop('outerHTML');
                    }
                } else if (key == 'video_pic') {
                    obj.render = function (a, b, c) {
                        var link = $('<img>', {width: '50px', height: '50px'}).attr('src', a);
                        return link.prop('outerHTML');
                    }
                }

                colArr.push(obj);
            }
            var tableOptions = {
                data: data,
                columns: colArr,
                dom: "t",
                destroy: true,
                "paging": false
            }
            console.log(tableOptions, data);
            if (tbl) {
                tbl.destroy();
            }
            tbl = $('#ContentTable').DataTable(tableOptions);
        }

        return {
            init: function (skt) {
                mySkt = skt;
                $('#douyuVideo select#cate1List').on('change', event => {
                    cate1Val = $(event.currentTarget).val();
                    getPage('single');
                })
                $('#douyuVideo select#cate2List').on('change', target => {
                    cate2Val = $(event.currentTarget).val();
                    getPage('single');
                })
                $('#douyuVideo  select#firstPages').on('change', target => {
                    var pages = $(event.currentTarget).val();
                    if (pages != 1) {
                        getMultiPage(pages);
                    } else {
                        getPage('single');
                    }
                })
                $('#resetData').on('click', function () {
                    totalQueryResult = [];
                    drawContent();
                })
                //filter result
                $('#refineQuery').on('change', 'input[type=number]', function (event) {
                    console.log($(event.currentTarget));
                    var ind = $('#refineQuery input[type=number]').index(this);
                    var val = $(event.currentTarget).val();
                    if (ind == 0) {
                        filterResult.minViewer = val;
                    } else if (ind == 1) {
                        filterResult.maxViewer = val;
                    } else if (ind == 2) {
                        filterResult.minDur = val;
                    } else if (ind == 3) {
                        filterResult.maxDur = val;
                    }
                    drawContent();
                });


                setLoading(true);
                skt.send('getVideoType', {}, resData => {
                    console.log(resData);
                    setLoading(false);
                    if (resData && resData.cate1 && resData.cate2) {
                        resData.cate1.forEach(item => {
                            var opt = $('<option>', {value: item.cate1_id}).text(item.cate1_name);
                            $('#douyuVideo select#cate1List').append(opt);
                        })
                        resData.cate2.forEach(item => {
                            var opt = $('<option>', {value: item.cate2_id}).text(item.cate2_name);
                            $('#douyuVideo select#cate2List').append(opt);
                        })
                    }
                })
            }
        };
    });
})()