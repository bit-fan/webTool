(function () {
    define([], function () {
        var cate1Val, cate2Val, cid1Obj = {}, cid2Obj = {}, pageVal, mySkt, authorArr = [],
            loadingPage, totalQueryResult, dataTbl = null, queryMode = 'normal', inited = false,
            filterPara = {
                minViewer: null,
                maxViewer: null,
                minDur: null,
                maxDur: null,
                authArr: [],
                titlePattern: null,
                colArr: []
            };

        const TitleObj = {
            author: "作者",
            video_duration: "时长",
            contents: "内容",
            video_pic: "图",
            view_num: "观看人数",
            title: "标题",
            cid1: "类别1",
            cid2: "类别2",
            ver_pic: "版本图",
            topic_title: "题目",
            authorIcon:"作者头像"
        }
        const filterCol=['point_id', 'video_str_duration', 'up_id', 'url', 'v_icon_text', 'is_first','tags', 'is_short', 'topic_id'];

        //get multiple pages
        function getMultiPage(curPageNum, newData) {
            totalQueryResult = totalQueryResult.concat(newData);
            if (curPageNum != 0) {
                return getPage('multi', curPageNum);
            } else {
                totalQueryResult = totalQueryResult.filter(item => {
                    return item && item.url;
                });
                drawContent();
            }
        }

        //get query
        function getPage(type, curPageNum) {
            if (!inited) {
                initPage()
            }
            if (!mySkt || loadingPage) {
                return setTimeout(function () {
                    getPage(type, curPageNum)
                }, 200);
            }
            var sendObj = {}
            cate1Val ? sendObj.cate1Id = cate1Val : '';
            cate2Val ? sendObj.cate2Id = cate2Val : '';
            curPageNum = curPageNum || pageVal || 1;
            sendObj.page = curPageNum;
            sendObj.action = $('#sortBy').val() || 'new';
            loadingPage = true;
            setLoading(true, '加载第' + curPageNum + '页...');
            mySkt.send('getQueryContent', sendObj, resData => {
                setLoading(false);
                console.log(resData);
                $('#totalPage').text(resData.page_count);
                $('#totalNumVideo').text(resData.count);
                if (type == 'simple') {
                    totalQueryResult = resData.list;
                    let optionNum = Math.min($('#firstPages').children().length, 200);
                    var max = Math.min(resData.page_count, 200);
                    if (optionNum != max) {
                        $('#firstPages').html('');
                        for (let i = 1; i < max; i++) {
                            let opt = $('<option>', {value: i}).text(i);
                            $('#firstPages').append(opt);
                        }
                    }
                    drawContent();
                } else {
                    getMultiPage(curPageNum - 1, resData.list);
                }
            }, failData => {
                console.log(failData);
                setLoading(true, failData.code || 'Error');
            });
        }

        //update laoding text
        function setLoading(flag, text) {
            text = text || 'loading...';
            $('#loadingText').toggleClass('blink', flag).text(flag ? text : '');
            loadingPage = false;
        }

        //filter table content
        function filterContent(src) {
            $('select#author').html('');
            var temp = {};
            totalQueryResult = totalQueryResult || [];
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
                if (filterPara.maxViewer && viewer > filterPara.maxViewer) valid = false;
                else if (filterPara.minViewer && viewer < filterPara.minViewer) valid = false;
                else if (filterPara.maxDur && dur > filterPara.maxDur) valid = false;
                else if (filterPara.minDur && dur < filterPara.minDur) valid = false;
                else if (filterPara.minDur && dur < filterPara.minDur) valid = false;
                else if (authorArr.length > 0 && authorArr.indexOf(item.author) == -1) valid = false;
                else if (filterPara.titlePattern && !filterPara.titlePattern.test(item.title)) valid = false;
                return valid
                // }).sort((a, b) => {
                //     return a.point_id - b.point_id;
            })
        }

        //clearTable
        function redrawTable(data) {
            if (!dataTbl)return;
            dataTbl.clear();
            if (data) {
                data.forEach(function (rowData) {
                    dataTbl.row.add(rowData);
                });
            }
            dataTbl.draw();
            $('#ContentTable').resize();
        }

        //draw table
        function drawContent() {
            console.log('totalQueryResult', totalQueryResult);
            var data = filterContent(totalQueryResult);
            console.log(data.length);
            console.log('queryMode', queryMode);
            if (queryMode != 'normal') {
                $('label#numDisplayResult').text('结果为:' + ((data.length == 0) ? '无' : (data.length == 1 ? '1个' : '有')));
                redrawTable([]);
                return;
            }
            $('label#numDisplayResult').text('结果数量为:' + data.length);
            if (filterPara.colArr.length == 0) {
                let ind = 0;
                for (var key in data[0]) {
                    ind++;
                    if (filterCol.indexOf(key) > -1) continue;
                    var obj = {
                        title: TitleObj[key] || key,
                        data: key,
                        sClass: 'contentTdWidth'
                    }
                    if (key == 'video_pic') {
                        obj.render = function (a, b, c) {
                            var img = $('<img>', {
                                width: '60px',
                                height: '60px'
                            }).addClass('text-center').attr('src', a);
                            var link = $('<a>').attr('href', c.url).attr('target', "_blank").append(img);
                            return link.prop('outerHTML');
                        }
                        obj.ord = 5.5;
                    } else if (key == 'cid1') {
                        obj.render = function (a, b, c) {
                            return cid1Obj && cid1Obj[a] ? cid1Obj[a] : a;
                        }
                        obj.ord = 0;
                    } else if (key == 'cid2') {
                        obj.render = function (a, b, c) {
                            return cid2Obj && cid2Obj[a] ? cid2Obj[a] : a;
                        }
                        obj.ord = 1;
                    } else if (key == 'ver_pic') {
                        obj.render = function (a, b, c) {
                            var img = $('<img>', {
                                width: '60px',
                                height: '60px'
                            }).addClass('text-center').attr('src', a);
                            return img.prop('outerHTML');
                        }
                        obj.ord = 7.5
                    } else if (key == 'authorIcon') {
                        obj.render = function (a, b, c) {
                            var img = $('<img>', {
                                width: '60px',
                                height: '60px'
                            }).addClass('text-center').attr('src', a);
                            return img.prop('outerHTML');
                        }
                        obj.ord = 8.5;
                    } else {
                        obj.ord = ind + 1;
                    }
                    filterPara.colArr.push(obj);
                }
                filterPara.colArr = filterPara.colArr.sort((a, b) => {
                    return a.ord - b.ord;
                })
            }
            if (dataTbl) {
                redrawTable(data);
            } else {
                var tableOptions = {
                    data: data,
                    columns: filterPara.colArr,
                    dom: "t",
                    destroy: true,
                    "paging": false
                }
                console.log(tableOptions, data);
                $('#ContentTable').empty();
                dataTbl = $('#ContentTable').DataTable(tableOptions);
            }
        }

        function initPage() {
            setLoading(true);
            mySkt.send('getVideoType', {}, resData => {
                console.log(resData);
                setLoading(false);
                if (resData && resData.cate1 && resData.cate2) {
                    resData.cate1.forEach(item => {
                        cid1Obj[item.cate1_id] = item.cate1_name;
                        var opt = $('<option>', {value: item.cate1_id}).text(item.cate1_name);
                        $('#douyuVideo select#cate1List').append(opt);
                    })
                    resData.cate2.forEach(item => {
                        cid2Obj[item.cate2_id] = item.cate2_name;
                        var opt = $('<option>', {value: item.cate2_id}).text(item.cate2_name);
                        $('#douyuVideo select#cate2List').append(opt);
                    })
                    inited = true;
                }
            }, failData => {
                console.log(failData);
                setLoading(true, failData.code || 'Error');
            })
        }

        return {
            init: function (skt) {
                mySkt = skt;
                $("input:radio[name ='queryMode']").on('change', event => {
                    queryMode = $("input:radio[name ='queryMode']:checked").val();
                    drawContent();
                    return true;
                })
                $('#douyuVideo select#cate1List').on('change', event => {
                    cate1Val = $(event.currentTarget).val();
                    totalQueryResult = [];
                    // getMultiPage(pageVal, []);
                    getPage('simple', pageVal);
                })
                $('#douyuVideo select#cate2List').on('change', target => {
                    cate2Val = $(event.currentTarget).val();
                    totalQueryResult = [];
                    // getMultiPage(pageVal, []);
                    getPage('simple', pageVal);
                })
                $('#douyuVideo  select#firstPages').on('change', target => {
                    var a = $(event.currentTarget).val();
                    pageVal = parseInt(a);
                    totalQueryResult = [];
                    getMultiPage(pageVal, []);
                })
                $('#queryNow').on('click', () => {
                    totalQueryResult = [];
                    getMultiPage(pageVal, []);
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
                        $('#authorList .inlineBlk-group').append($('<a>', {style: 'margin-right:5px'}).text(auth));
                        drawContent();
                    }
                })
                $('#resetData').on('click', function () {
                    totalQueryResult = [];
                    drawContent();
                })
                $('#queryText input').on('blur', target => {
                    var text = $(event.target).val();
                    filterPara.titlePattern = new RegExp(text.split(' ').join('.*'), 'i');
                    drawContent();
                })
                //filter result
                $('#refineQuery').on('change', 'input[type=number]', function (event) {
                    console.log($(event.currentTarget));
                    var ind = $('#refineQuery input[type=number]').index(this);
                    var val = $(event.currentTarget).val();
                    if (ind == 0) {
                        filterPara.minViewer = val;
                    } else if (ind == 1) {
                        filterPara.maxViewer = val;
                    } else if (ind == 2) {
                        filterPara.minDur = val;
                    } else if (ind == 3) {
                        filterPara.maxDur = val;
                    }
                    drawContent();
                });

                initPage();
                //get basic settings

            }
        };
    });
})()