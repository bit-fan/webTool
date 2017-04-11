(function () {
    define([], function () {
        var cate1Val, cate2Val, pageVal, mySkt, authorArr = [],
            loadingPage, totalQueryResult, tbl, titlePattern, colArr = [],
            filterResult = {
                minViewer: null, maxViewer: null, minDur: null, maxDur: null, authArr: []
            };

        const TitleObj = {
            author: "作者",
            video_duration: "时长",
            contents: "内容",
            video_pic: "图",
            view_num: "观看人数",
            title: "标题"
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
            var pageText = pageVal || '1';
            setLoading(true, '加载第' + pageText + '页...');
            mySkt.send('getQueryContent', sendObj, resData => {
                setLoading(false);
                console.log(resData);
                $('#totalPage').text(resData.page_count);
                $('#totalNumVideo').text(resData.count);
                if (type == 'single') {
                    totalQueryResult = resData.list;
                    var max = Math.min(resData.page_count, 200);
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

        function setLoading(flag, text) {
            text = text || 'loading...';
            $('#loadingText').toggleClass('blink', flag).text(flag ? text : '');
            loadingPage = false;
        }

        function filterContent(src) {
            $('select#author').html('');
            var temp = {};
            totalQueryResult.forEach(item => {
                temp[item.author] ? temp[item.author]++ : temp[item.author] = 1;
            });
            $('select#author').append($('<option>').text('全部'));
            var optionArr = [];
            for (var key in temp) {
                var t = $('<option>', {value: key}).text(key + '(' + temp[key] + ')');
                optionArr.push([t, temp[key]]);
            }
            optionArr.sort((a, b) => {
                return b[1] - a[1];
            }).forEach(item => {
                $('select#author').append(item[0]);
            })

            return totalQueryResult.filter(item => {
                var valid = true;
                var viewer = parseInt(item.view_num);
                var dur = parseInt(item.video_duration.split(':')[0]);
                if (filterResult.maxViewer && viewer > filterResult.maxViewer) valid = false;
                else if (filterResult.minViewer && viewer < filterResult.minViewer) valid = false;
                else if (filterResult.maxDur && dur > filterResult.maxDur) valid = false;
                else if (filterResult.minDur && dur < filterResult.minDur) valid = false;
                else if (filterResult.minDur && dur < filterResult.minDur) valid = false;
                else if (authorArr.length > 0 && authorArr.indexOf(item.author) == -1) valid = false;
                else if (titlePattern && !titlePattern.test(item.title)) valid = false;
                return valid
            }).sort((a, b) => {
                return a.point_id - b.point_id;
            })
        }

        function drawContent() {
            console.log('totalQueryResult', totalQueryResult);
            var data = filterContent(totalQueryResult);
            $('label#numDisplayResult').text('结果数量为:' + data.length);
            if (colArr.length == 0) {
                for (var key in data[0]) {
                    if (['cid1', 'cid2', 'point_id', 'video_str_duration', 'up_id'].indexOf(key) > -1) continue;
                    var obj = {
                        title: TitleObj[key] || key,
                        data: key
                    }
                    if (key == 'url') {
                        obj.render = function (a, b, c) {
                            var link = $('<a>').attr('href', a).text('链接');
                            return link.prop('outerHTML');
                        }
                        obj.sClass = 'width50'
                    } else if (key == 'video_pic') {
                        obj.render = function (a, b, c) {
                            var link = $('<img>', {width: '50px', height: '50px'}).attr('src', a);
                            return link.prop('outerHTML');
                        }
                    }
                    colArr.push(obj);
                }
            }
            var tableOptions = {
                data: data,
                columns: colArr,
                dom: "t",
                destroy: true,
                "paging": false
            }
            console.log(tableOptions, data);
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
                $('#queryNow').on('click', () => {
                    getPage('single');
                    return true;
                })
                $('#authorList').on('click', 'a', target => {
                    var auth = $(event.target).text();
                    var ind = authorArr.indexOf(auth);
                    if (ind != -1) {
                        authorArr.splice(ind, 1);
                        $(event.target).remove();
                        console.log('authorArr', authorArr);
                    }
                    drawContent();

                })
                $('select#author').on('change', target => {
                    var auth = $(event.target).val();
                    if (auth == '全部')return;
                    if (auth && authorArr.indexOf(auth) == -1) {
                        authorArr.push(auth);
                        console.log('authorArr', authorArr);
                        $('#authorList').append($('<a>', {style: 'margin-right:5px'}).text(auth));
                        drawContent();
                    }
                })
                $('#resetData').on('click', function () {
                    totalQueryResult = [];
                    drawContent();
                })
                $('#queryText input').on('blur', target => {
                    var text = $(event.target).val();
                    titlePattern = new RegExp(text.split(' ').join('.*'));
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