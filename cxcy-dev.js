// ==UserScript==
// @name         ByeBye CXCY
// @namespace    https://www.xiaosm.cn/
// @version      1.1-a
// @description  创新创业就业自助刷课,答题小助手（原创-原作者！！！）
// @author       Young
// @match        *://*.hunbys.com/*
// @grant        GM.xmlHttpRequest
// @connect      query.zhoupb.com
// @connect      do.71kpay.com
// @connect      wkdnb.cn
// @connect      user.fm210.cn
// @connect      app.51xuexiaoyi.com
// @require      https://code.jquery.com/jquery-2.1.1.min.js
// @compatible	 Chrome
// @compatible	 Firefox
// @compatible	 Edge
// @compatible	 Safari
// @compatible	 Opera
// @compatible	 UC
// @license      Apache-2.0
// ==/UserScript==


/**
 * 如果你有好的建议或意见，可以通过邮箱和 QQ群 联系作者
 *   young@xiaosm.cn
 *   扣扣群 949248712
 * 
 * @name BeyBey_CXCY
 * @description 作者永久保留此程序的版权，转载请勿删除版权和这段注释
 * @author Young
 * @license Apache
 * @copyright Copyright (c) 2019-2020 WWW.XIAOSM.CN All Rights Reserved.
 */

(function () {
    'use strict';
    "love life"
})();


var config = {};
var API = null;

// Your code here...
$(function () {
    if (window.localStorage.getItem("config") == null) {
        let config = {
            // 获取答案的接口地址 默认接口 默认接口 1，接口 2 是调用的他人接口需要门槛
            api: { order: 0, hash: Utils.hash(apis[0].name) },
            // 接口需要的 token 令牌
            token: "",
            // 答题速度，单位毫秒 默认 5000
            timer: 5000
        }
        window.localStorage.setItem("config", JSON.stringify(config));
    }
    config = JSON.parse(window.localStorage.getItem("config"));
    // 这段判断代码会在将来的版本删除，仅做更新使用
    if (typeof (config.api) != "object") {
        config.api = { order: 0, hash: Utils.hash(apis[0].name) };
        window.localStorage.setItem("config", JSON.stringify(config));
    }
    // end
    let apiIndex = 0;
    apis.forEach(el => {
        if (config.api.hash == "") return 0;
        if (config.api.hash == Utils.hash(el.name)) {
            apiIndex = el.order;
        }
    })
    API = apis[apiIndex];


    // 初始化程序
    let uri = document.location.pathname;
    // alert(uri);
    if (uri.indexOf("student-learn") >= 0) {
        alert("已开始自动刷课、答题啦.\n如果没有效果请重新刷新页面\n如果弹出\n😊😊😊");
        /* 渲染盒子 */
        drawBox.learn();
        __init();
    } else if (uri.indexOf("student-exam") >= 0) {
        alert("已开始自动答题啦.\n如果页面空白请请刷新\n答题完需要手动提交噢\n😊😊😊");
        let examStr = null;
        /* 渲染盒子 */
        drawBox.exam();
        let timer = setInterval(() => {
            exId = $("#exId").val();
            // 获取题目
            examStr = $("#newExam").val();
            // 获取答题卡,这是一个 jquery的数组
            myAnswerCards = $("#answerCard").find("p");
            if (examStr.length > 50 || myAnswerCards.length > 0) {
                clearInterval(timer);
                /* 额外渲染盒子 */
                drawBox.search();
                ___init(examStr);
            }
        }, 1500);
    } else if (uri.indexOf("student-detail") >= 0) {
        // alert("已开始自动采集答案了.\n答案采集成功会弹窗提醒\n答案未采集完成请勿刷新页面哦\n😊😊😊");
        drawBox.answer();
    }
});


// 获取以前观看的课时
var course_num = window.localStorage.getItem("course_num") == null ? 0 : parseInt(window.localStorage.getItem("course_num"));
// 获取以前的答题
var question_num = window.localStorage.getItem("question_num") == null ? 0 : parseInt(window.localStorage.getItem("question_num"));
// API
var UPLOAD = "https://query.zhoupb.com/api/question/save";
var apis = [
    {
        "name": "官方接口1 (自建题库，优先使用)",
        "order": 0,
        "desc": "<b style='color:red'>此接口为我们自建题库，在其他接口服务器出现错误时请使用官方接口，我们将会逐渐完善题库"
            + "<a href='https://jq.qq.com/?_wv=1027&k=EGjVOE4Q' target='_blank' style='margin-left:10px'>点我加群反馈</a></b></br>"
            + "为完善我们的题库请在答完题后点[击习题解析->选择已做的试题->点击采集答案按钮]，答案一经收录即可保证正确率90%以上</br>"
            + "",
        "type": "POST",
        "url": (op) => {
            return "https://query.zhoupb.com/api/question/query";
        },
        "isToken": false,
        "data": (op) => {
            return JSON.stringify({ question: op.title, type: op.type });
            // return JSON.stringify({question: op.title, type: op.type, pId: "cy_"});
        },
        "headers": () => {
            return { "content-type": "application/json;charset=UTF-8" };
        },
        "code": function (res, op, id) {
            // 提取答案
            // let text = GB2312UnicodeConverter.ToGB2312(res.response);
            // 转 json 数据
            let data = JSON.parse(res.response);
            let ans = data.answerText;

            return { ans: ans, total: data.question + "<br>" + ans, flag: 2 };

        }
    },
    {
        "name": "接口2 (暂不可用)",
        "order": 1,
        "desc": "",
        "type": "GET",
        "url": (op) => {
            return "https://wkdnb.cn/wkdn.php?tm=" + op.title;
        },
        "data": (op) => { },
        "headers": () => { },
        "code": function (res, op, id = 110) {
            let data = JSON.parse(res.response);
            let ans = data.answer;
            console.log(data);

            let total = data.problem + "<br>" + ans;
            // 保存题目
            if (data.success == "res") {
                // 答题
                return { ans: ans, total: total, flag: 1 };
            } else {
                // 答题
                return { ans: ans, total: total, flag: 0 };
            }
        },
    },
    {
        "name": "接口3",
        "order": 2,
        "desc": "",
        "type": "POST",
        "url": (op) => {
            return "http://tiku.71kpay.com/wk/cx.php";
        },
        "data": (op) => {
            let data = new FormData();
            data.append("username", op.title);
            return data;
        },
        "headers": () => {
            return {
                "Cookie": "UM_distinctid=171964210505f2-0fc7db71828ffc-21570e49-144000-1719642105192a; CNZZDATA1278802751=1709735612-1587361631-%7C1587361631",
                "Referer": "http://tiku.71kpay.com/?tdsourcetag=s_pctim_aiomsg"
            };
        },
        "code": function (res, op, id) {
            // 提取答案
            let text = Utils.ToGB2312(res.response);
            let ans = text.substring(text.lastIndexOf("<br>") + 4, text.length - 1).trim();
            // 答题
            return { ans: ans, flag: 1, total: text };
        }
    },
    {
        "name": "接口4 (此接口需要token--已废弃)",
        "order": 3,
        // "desc": "<b style='color:red'>第一次使用此接口请先去获取token <a href='http://user.fm210.cn/' target='_blank'>点我申请</a></b>",
        "desc": "<b style='color:red'>暂不可用 <a href='https://www.xiaosm.cn/' target='_blank'>小树苗博客</a></b>",
        "type": "POST",
        "url": (op) => {
            return "https://user.fm210.cn/api/wk?token=" + config.token + "&question=" + op.title;
        },
        "isToken": true,
        "data": (op) => { },
        "headers": () => { },
        "code": function (res, op, id) {
            // 提取答案
            // let text = GB2312UnicodeConverter.ToGB2312(res.response);
            // 转 json 数据
            let data = JSON.parse(res.response);
            let ans = data.da;
            let total = data.tm + "<br>" + ans;
            if (data.code != 200) {
                // 渲染答案卡
                return { ans: "token错误，请在js文件中修改token", total: total, flag: 0 };
            }
            return { ans: ans, total: total, flag: 1 };
        }
    },
    {
        "name": "接口5 (学小易题库接口，不推荐长期使用)",
        "order": 4,
        "desc": "<b style='color:red'>此接口为学小易接口</b>",
        "type": "POST",
        "url": (op) => {
            return "https://app.51xuexiaoyi.com/api/v1/searchQuestion";
        },
        "isToken": true,
        "data": (op) => {
            return JSON.stringify({ keyword: op.title });
        },
        "headers": () => {
            return {
                "content-type": "application/json;charset=UTF-8",
                "token": "5u7cgJj1IL3w40rqrGfBtGuenq6U9PebhmdWyHhGTKtWhnKL3XHRQiOMedAM"
            };
        },
        "code": function (res, op, id) {
            // 转 json 数据
            let data = JSON.parse(res.response);
            // 提取答案
            let ans = data.code == 200 ? data.data : data.msg;
            // console.log(json);

            // 不自动答题，用户自动填写
            return { ans: ans, flag: 0, arr: data.data };

        }
    }
]


/**
 * 初始化刷课程序
 */
function __init() {
    var course = $("#course")[0];
    var question = $("#question")[0];

    /* 鼠标离开页面也继续播放视频 */
    $("#hostBody")[0].addEventListener("mouseout", function () {
        video.play()
    });

    /* 获取题目 */
    var topics, topics;
    course.innerText = course_num;
    question.innerText = question_num;
    var currentTime, duration;
    setInterval(() => {
        currentTime = video.currentTime;
        duration = video.duration;
        console.log(currentTime, duration)
        /* 自动下一集 */
        if (currentTime >= duration) {
            $('.video').find('.black999')[1].click();
            course_num++;
            console.warn("刷课完成,已完成" + course_num + "节");
            course.innerText = course_num;
            window.localStorage.setItem("course_num", course_num);
        }
        topics = $('.options');
        if (topics.length == 0) {
            console.log("题目还没有出来哦!")
            return;
        }
        for (let i = 0; i < topics.length; i++) {
            let saveData = {
                "type": 1,
                // 获取题目标题
                "question": $(topics[i]).prev().find("label").eq(1).text(),
                // 获取答案
                "answerText": $(topics[i]).next().text().substring(4, 5),
                "pId": "cy_" + $(topics[i]).attr("cwid")
            }
            // console.log(val)
            /* 获取选项 */
            var ops = $(topics[i]).find('.radio');
            // 点击选项
            selectAnswer(saveData.answerText, ops);
            // 上传题目
            saveTopic(saveData);
        }

        /* 提交答案 */
        $('.layui-layer-btn0')[0].click();
        video.play();
        question_num++;
        console.warn("答题完成,已答题" + question_num + "次");
        question.innerText = question_num;
        window.localStorage.setItem("question_num", question_num);
    }, 10000);
}


var examJson = null;
var myAnswerCards = null; // 答题卡
var exId = null; // 章节id
/**
 * 初始化课后作业程序
 */
function ___init(examStr) {
    // 获取题目
    examJson = JSON.parse(examStr);
    console.log(examJson);
    // 遍历题目组
    let count = 0, len = 0;
    let timerM = isNaN(config.timer) || config.timer < 5000 ? 5000 : config.timer;
    examJson.forEach(el => {
        // console.log(el);
        // 遍历当前类型的题目
        el["txarr"].forEach(op => {
            setTimeout(() => {
                console.log(
                    "%c%s",
                    "color:#98c966;background:#000;padding: 2px 3px;border-radius:3px;font-size:12px",
                    op.order + "--" + op.title
                );
                // 搜索答案
                searchAnswer(op);
                    /* len += 1;
                    if (count >= len) {
                        alert("本次答题已完成，请核对答案后手动提交！");
                    }
                    // */ if (count > 4) return;
            }, count++ * timerM);
        });
    });
}

/**
 * 答案采集
 * @param {*} examArr 
 */
function ____init(examArr) {
    $(".answer-card-btn").click();
    let timer = null, answerCard = null;
    timer = setInterval(() => {
        if (answerCard == null) {
            answerCard = $(".answer-card>.cnt>p");
        } else {
            clearInterval(timer);
            let topic = "", ans = "";
            // 五个ol 单选 多选 判断 填空 简答
            console.log(answerCard);
            let index = 0;
            examArr.each((type, el) => {
                $(el).find("li[class='t']>p").each((j, el1) => {
                    // el1是p标签，内容是题目
                    let data = {
                        question: el1.innerText,
                        answerText: "暂无答案",
                        pId: "cy_" + Utils.hash(el1.innerText) + "#abcdefg",
                        type: type + 1
                    }
                    let ans = $(answerCard[index]).find("span:nth(1)").text();
                    if ((type + 1) == 4) {
                        // 填空题题特殊处理
                        // 填空题格式 ["资源约束","价值创造"]
                        ans = JSON.parse(ans).join("#");
                    }
                    data.answerText = ans;
                    // console.log(data);
                    setTimeout(() => {
                        saveTopic(data);
                    }, 500 * index++);
                });
            });
            setTimeout(() => {
                $("#ansActionBtn").text("点我采集答案");
                $("#ansActionContent").html("本次采集题目和答案共" + (index - 1) + "条，感谢你对我们题库的贡献！")
            }, 500 * index);

        }
    }, 300);
}

function sleep(ms) {
    let start = new Date().getTime();
    let end = start + ms;

    while (start < end) {
        // 嘻嘻嘻
        start = new Date().getTime();
    }
}

/**
 * 
 * @param {*} op 
 */
function searchAnswer(op, flag = true) {
    // 获取答案
    GM.xmlHttpRequest({
        method: API.type,
        url: API.url(op),
        data: API.data(op),
        headers: API.headers(),
        onload: function (res) {
            // let data = JSON.parse(res);
            console.log(res);
            if (res.status == 200) {
                /* console.log(
                    "%c%s",
                    "color:#98c966;background:#000;padding: 2px 3px;border-radius:5px;font-size:12px",
                    op.order + "--" + res.response
                ); */
                let result = API.code(res, op, exId);
                // 渲染答案卡
                addAnsCard(op, result, exId);
                // 答题 0 是失败，没有答案或无需自动答题
                if (result.flag > 0 && flag) {
                    resolveTopic(op, result.ans);
                }
                // 保存题目 flag 为 0 和 2 均不保存
                // console.log(res)
                if (res.response.length > -1 && result.flag % 2 == 1) {
                    let saveData = {
                        "type": op.type,
                        "question": op.title,
                        "answerText": result.ans,
                        "pId": "cy_" + (exId + op.trueOrder)
                    }
                    // console.log(saveData);
                    saveTopic(saveData);
                }

            } else {
                let result = API.code(res, op, exId);
                console.log(res);
                // 请求出错也需要 渲染答案卡
                if (result == null || typeof (result.ans) == "undefined" || result.ans.length == 0) {
                    result.ans = "<span style='color:red'>服务器错误</span>";
                }
                // 渲染答案卡
                addAnsCard(op, result, exId);
            }
        },
        onerror: function (res) {
            console.error(res);

        }
    });
}

/**
 * 保存答案
 * @param {Object} data
 * @param {Dom} el
 */
function saveTopic(data, el = null) {
    GM.xmlHttpRequest({
        method: "POST",
        url: UPLOAD,
        data: JSON.stringify(data),
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        onload: function (res) {
            // let data = JSON.parse(res);
            // console.log(res);
            if (res.status == 200) {
                if (el != null) {
                    $(el).text("收录成功");
                }
                data.savaCode = '收录成功'
                console.log(data);

            }
        }
    });
}

/**
 * 用户提交题目
 * @param {Dom}} el
 */
function userSaveTopic(el) {
    // console.log(el);

    let answer = prompt("请输入你的答案来帮助更多人\n注意多选题和填空题请使用分隔符或空格隔开噢\n(分隔符有：, - _ # $)");
    if (answer.trim().length == 0) return;
    if ($(el).attr("type") <= 2 || $(el).attr("type") == 4) {
        answer = answer.toUpperCase();
        answer = answer.replace(/[#-\,\$\s(_)(\uff0c)(\u2014)(\u3001)]+/g, ",");
    }
    let data = {
        "type": $(el).attr("type"),
        "question": $(el).attr("value").substring(2),
        "answerText": answer,
        "pId": "cy_" + $(el).attr("pid")
    }
    console.log(data);
    saveTopic(data, el);
}

/**
 * 学小易题目保存
 * @param {Array} topics 
 */
function xxySavaTopic(topics) {
    return;
    if (topics.length == 0) return;
    /**
     * 最长子序列，解决题目相似问题
     * @param {String} str1 
     * @param {String} str2 
     */
    function lcs(str1, str2) {
        let m = str1.length, n = str2.length;
        let dp = Array.from(new Array(m + 1), () => new Array(n + 1).fill(0));
        // 进行状态转移
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] == str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }

            }
        }
        return dp[m][n];
    }

    let arr = topics;
    // let hash = arr[0].question.replace()
    arr.forEach(el => {
        // 去除所有非汉字字符
        el.question = el.question.replace(/[^\u4e00-\u9fa5]+/g, "");

    });
    let i = 0, len = topics.length;
    let timer = setInterval(() => {
        if (i >= len) {
            clearInterval(timer);
            return;
        }
        // console.log(topics[i]);

        saveTopic(topics[i++])
    }, 200);
}

/**
 * 获取答案
 *
 */
function getAnswer() {

}

/**
 * 答题
 * 
 * @param {*} topic
 * @param {*} answer
 */
//  \u3001[、] \u2014[—] \u003b[;] \u0001[]
var reg = new RegExp("[#-\,\$\s(_)(\u0001)(\u003b)(\u2014)(\u3001)]+");
function resolveTopic(topic, answer) {
    let arr = [];
    // 获取答题卡上对应的选项
    let options = null;
    let type = topic.type;
    let trueOrder = parseInt(topic.order);
    // 1 单选、2 多选、3 判断、4 填空、5 简答
    if (topic.type == "1" || topic.type == "3") {
        arr = answer.split(reg);
        options = $(myAnswerCards[trueOrder - 1]).find(".radioAndValue");
        arr.forEach(val => {
            selectAnswer(val, options, topic);
        });
    } else if (type == 2) {
        arr = answer.split(reg);
        options = $(myAnswerCards[trueOrder - 1]).find(".checkboxAndValue");
        arr.forEach(val => {
            selectAnswer(val, options);
        });
    } else if (type == 4) {
        arr = answer.split(reg);
        options = $(myAnswerCards[trueOrder - 1]).find(".cardText");
        // console.log(arr);
        arr.forEach((val, index) => {
            $(options[index]).val(val);
        });
    } else if (type == 5) {
        options = $(myAnswerCards[trueOrder - 1]).find(".cardTextArea");
        $(options).val(answer);
        $(options).myEvent("blur")

    }
}


/**
 * 可点击题目的 选择答案
 * @param {String} val 答案 文本答案 || ABCDEF选项
 * @param {Array} options 选项 组
 * @param {Array} topic 题目
 */
function selectAnswer(val, options, topic) {
    val = val.trim();
    let c = val.charCodeAt() >= 97 ? val.charCodeAt() - 97 : val.charCodeAt() - 65;
    if (c >= 0 && c <= 9) {
        $(options[c]).trigger("click");
    } else if (val.length > 3) {
        // 答案过长说明找到的结果不是选择题答案 或 是答案的文本而非ABCD
        console.log(val);
    } else {
        // 判断题
        if (/[1(对)(正确)√]/.test(val)) {
            $(options[0]).trigger("click")
        } else if (/[0(否)(错)(错误)×]/.test(val)) {
            $(options[1]).trigger("click");
        }
    }
}

/**
 * 渲染答案卡的表格
 * @param {Object}} op 题目对象
 * @param {*} answer
 */
var topicName = 1;
function addAnsCard(op, answer, id) {
    let flag = 0;
    let xxyTopicsData = [];
    // 如果答案是数组形式拥有多条结果，这个判断针对学小易
    if (answer.ans != null && typeof (answer.ans) == "object") {
        let arr = answer.ans;
        let saveData = {}, question;
        answer.ans = "<button class='xxyAnsBtn' name='topic" + id + "' value='<ul style=&apos;white-space:break-spaces&apos;>";
        arr.forEach(el => {
            // console.log(el);
            answer.ans += "<li>" + el.q + "<br><span style=&apos;color:red&apos;>答案：" + el.a + "</span></li><br>";

            question = (el.q).substring((el.q).indexOf("】") + 1).trim();
            // 保存答案
            saveData = {
                "type": (function (q) {
                    if (q.indexOf("单选题" >= 0)) {
                        return 1;
                    } else if (q.indexOf("多选题" >= 0)) {
                        return 2;
                    } else if (q.indexOf("判断题" >= 0)) {
                        return 3;
                    } else if (q.indexOf("填空题" >= 0)) {
                        return 4;
                    } else if (q.indexOf("简答题" >= 0)) {
                        return 5;
                    }
                })(question),
                // 截取题目，【单选题】创业的功能不包括(), 只保留主体
                "question": question,
                "answerText": el.a,
                "pId": "xxy_" + Utils.hash(question)
            }
            // console.log(el.q);
            // console.log(question);
            // console.log(Utils.hash(question));

            // console.log(saveData);
            xxyTopicsData.push(saveData);
        })
        answer.ans += "<ul>'>点我查看答案</button>";
    } else if (typeof (answer.ans) == "undefined") {
        answer.ans = "<span style='color:red'>服务器错误</span>";
    } else {
        if (answer.ans.trim().length == 0 || (answer.ans.indexOf("500") >= 0 || answer.ans.indexOf("400") >= 0) &&
            answer.ans.indexOf("nginx") >= 0) {
            answer.ans = "<span style='color:red'>暂无答案</span>";
            flag++;
        }
    }
    let table = $("#ans_tbody");
    let html = "<tr><td>" + op.order + "</td>" +
        "<td style='padding:7px'>" + op.title + "</td>" +
        "<td style='padding:7px;padding-bottom:20px;position:relative'>" + answer.ans;
    // 没有答案
    if (flag > 0) {
        html += "<button style='border:1px #999 solid;font-size:12px;padding: 0 2px;position:absolute;top:1px;right:1px' " +
            " class='addAnsBtn' value='" + op.order + op.title + "' name='" + topicName + "'" +
            " type='" + op.type + "' pid='" + (id + op.trueOrder) + "'>提交</button>";
        // userSaveTopic();
    } else {
        // 所有有答案的生成查看答案
        html += "<button style='border:1px #999 solid;font-size:12px;padding: 0 2px;position:absolute;bottom:1px;right:1px' " +
            " class='showAnsBtn' value='<p>" + answer.total + "</p>' name='" + topicName + "'" +
            " type='" + op.type + "' pid='" + (id + op.trueOrder) + "'>查看</button>";
    }
    "</td></tr>";
    table.append(html);
    $(table).find("button[class='addAnsBtn']").bind("click", function () { userSaveTopic(this) });
    $(table).find("button[class='xxyAnsBtn']").bind("click", function () {
        // $(drawBox.showDom).hide();
        $("#alertBox2").html(this.value);
        $("#alertBox").show();
    });
    $(table).find("button[class='showAnsBtn']").bind("click", function () {
        // $(drawBox.showDom).hide();
        $("#alertBox2").html(this.value);
        $("#alertBox").show();
    });
    topicName++;
    xxySavaTopic(xxyTopicsData);
}


/* 渲染窗口 */
var drawBox = {
    learn: function () {
        var outBox = document.createElement("div");
        outBox.id = "outBox";
        outBox.classList.add("outBox");

        $(".content01").append(outBox);

        var innerBox =
            "<div id='innerBox' style='position:relative;max-height:700px;'>" +
            "<div>已完成视频次数：<span id='course'>0</span></div>" +
            "<div>已完成答题次数：<span id='question'>0</span></div>" +
            "<div style='margin:5px 0;border-top:1px solid #e5e5e5''></div>" +
            "<div style='font-size:12px;'>" +
            "<p>正在自动观看视频和答题,你可以将浏览器放置后台播放\n如果播放没有反应请刷新页面\n" +
            "如有需求请在<b><a href='https://greasyfork.org/zh-CN/scripts/392807-beybey-cxcy' target='_blank' alt='点击打开Greasy Fork'>Greasy</a></b>上进行反馈" +
            "</p>" +
            "</div>" +
            "<div style='position:absolute;top:10px;right:20px'>" +
            "<button id='clear_count_btn' style='background:#ff6666;border:none;padding:2px 3px;border-radius:5px;font-size:13px;cursor:pointer'>清空视频和答题次数<button>" +
            "</div>" +
            "</div>";

        $(".outBox").append(innerBox);

        $(".outBox").css({
            "background": "#96b97d",
            "width": "320px",
            "padding": "10px",
            "white-space": "pre-line",
            "box-sizing": "border-box",
            "position": "absolute",
            "top": "10px",
            "right": "160px",
            "z-index": "999",
        });

        // 给清空按钮添加点击事件
        $("#clear_count_btn")[0].addEventListener("click", () => {
            clearCount();
        });
    },
    exam: function () {
        let outBox = document.createElement("div");
        outBox.id = "outBox";
        outBox.classList.add("outBox");
        outBox.innerHTML =
            "<button style='background:#ff6666;border:none;padding:2px 3px;border-radius:5px;font-size:16px;cursor:pointer' id='ans_card'>点我查看题目答案</button>" +
            "<span style='margin-left:10px'>去习题解析页面点击采集按钮可以提高答案正确率噢<span>";
        $(".marking-box").append(outBox);

        let configBtn = document.createElement("button");
        configBtn.innerText = "配置";
        $(outBox).append(configBtn);
        $(".marking-box").append(outBox);

        $(configBtn).css({
            "color": "#FFF",
            "background": "#16643c",
            "font-size": "12px",
            "padding": "1px 2px",
            "border": "1px solid #999",
            "cursor": "pointer",
            "position": "absolute",
            "top": "1px",
            "right": "1px"
        });

        let innerBox =
            "<div id='innerBox' style='margin-top:10px;position:relative;display:none;max-height:550px;overflow-y:auto;'>" +
            "<table id='ans_table' style='text-align:center;width:100%;font-size:14px' border='1'>" +
            "<thead style=''><tr><td width='10%'>题号</td><td width='55%' style='padding:7px'>题目</td><td width='' style='padding:7px'>答案</td></tr></thead>"
            + "<tbody id='ans_tbody'></tbody>" +
            "</table>" +
            "</div>";

        $(".outBox").append(innerBox);

        $(".outBox").css({
            "opacity": ".85",
            "background": "#96b97d",
            "width": "520px",
            "padding": "10px",
            "white-space": "pre-line",
            "box-sizing": "border-box",
            "position": "fixed",
            "top": "70px",
            "left": "100px",
            "z-index": "998",
            "text-align": "center"
        });

        // 展示隐藏答案卡
        $("#ans_card").bind("click", () => {
            $("#innerBox").toggle();
        });

        this.alertBox();

        $(configBtn).bind("click", () => {
            this.configBox();
            $("#alertBox").show();
        });
    },
    search: function () {
        let t = "";
        let types = ["单选", "多选", "判断", "填空", "简答"];
        for (let i = 0; i < 5; i++) {
            t += "<option value='" + (i + 1) + "'>" + types[i] + "</option>";
        }
        let o = "";
        myAnswerCards.each(i => {
            o += "<option value='" + (i + 1) + "'>第" + (i + 1) + "题</option>";
        })
        let tfoot = $("<tfoot>", {
            html: "<tr><th>题号</th><th width='55%' colspan='2' style='padding:7px'>请输入题目且选择题号，题号和答题卡对应</th></tr>"
                + "<tr><td><select id='ansOrder' style='cursor:pointer'>" + o + "</select></td>"
                + "<td colspan='2' style='padding:7px'>"
                + "<textarea id='ansText' placeholder='请输入题目且选择题号，否则需要手动填写答案' rows='3' style='resize:none;opacity:1;width:100%'></textarea>"
                + "<button id='ansSearchBtn'>搜索</button></td>"
        });
        $("#ans_table").append(tfoot);

        console.log(myAnswerCards);

        $("#ansSearchBtn0").click(function () {
            let op = {
                title: $("#ansText").val(),
                order: 1
            }
        });
        $("#ansSearchBtn").click(() => {
            let op = {
                title: $("#ansText").val().trim(),
                order: $("#ansOrder").val(),
                trueOrder: $("#ansOrder").val(),
                type: -1
            }
            if (op.title == "") {
                alert("题目不可以为空！");
                return;
            }
            if ($(myAnswerCards[op.order]).attr("class") == "blankSubjectPanel") {
                // 填空
                op.type = 4;
            } else {
                let len = $(myAnswerCards[op.order]).find("span.radioAndValue").length;
                if (len == 4) {
                    // 单选
                    op.type = 1;
                } else if (len == 2) {
                    // 判断
                    op.type = 3;
                } else {
                    len = $(myAnswerCards[op.order]).find("span.checkboxAndValue").length;
                    if (len == 4) {
                        // 多选
                        op.type = 2;
                    } else if ($(myAnswerCards[op.order]).find(".cardTextArea").length > 0) {
                        // 简答
                        op.type = 5;
                    } else {
                        op.type = -1;
                    }
                }
            }
            console.log(op);
            searchAnswer(op);
        });
    },
    answer: function () {
        let outBox = $("<div>", {
            class: "outBox"
        }).append($("<button>", {
            id: "ansActionBtn",
            text: "点我采集答案",
            style: "background:#ff6666;border:none;padding:2px 3px;border-radius:5px;font-size:13px;cursor:pointer"
        })).append($("<div>", {
            id: "ansActionContent",
        }));

        $(".content01").append(outBox);

        $(".outBox").css({
            "background": "#96b97d",
            "width": "320px",
            "padding": "10px",
            "white-space": "pre-line",
            "box-sizing": "border-box",
            "position": "absolute",
            "top": "100px",
            "right": "260px",
            "z-index": "999",
        });


        // bind event
        $("#ansActionBtn").click(function () {
            let examArr = $("#examination>.left>ol");
            if (examArr.length == 0) {
                alert("请打开习题解析页面并选择习题才可采集");
                return;
            }
            this.innerText = "正在采集答案中。。。";
            ____init(examArr);
        })
    },
    // 渲染弹出框
    alertBox: function () {
        let alertBox =
            '<div id="alertBox" style="display:none">' +
            '<div style="position:fixed;width: 100%;height: 100%;background: #000;opacity: .5;top:0;right:0;z-index:999"></div>' +
            '<div id="alertBox1" style="">' +
            '<div id="alertBox2" style="margin-top:10px;min-height:200px;max-height:350px;overflow-y:auto"></div>' +
            '</div>' +
            '</div>';
        $("body").append(alertBox);

        let closeBtn = "<b id='closeBtn' style='font-size:35px;color:red;position:absolute;top:0;right:0;cursor:pointer'>×</b>"
        $("#alertBox1").append(closeBtn);
        $("#alertBox1").css({
            "box-shadow": "5px 5px 10px",
            "padding": "20px 5px 20px 15px",
            "z-index": "999",
            "position": "fixed",
            "top": "calc(50% - 200px)",
            "left": "calc(50% - 250px)",
            "background": "#FFF",
            "width": "500px",
        });

        $("#closeBtn").bind("click", () => {
            $("#alertBox").hide();
        });
    },
    configBoxDom: null,
    configBox: function () {
        let html =
            '<div id="configBox" style="display:grid">接口：<select name="input_api" style=""><option>test</option></select><br>' +
            'token: <textarea rows="3" placeholder="如果接口没有注明需要 token 可以无需填写" name="input_token" style="resize:none"></textarea><br>' +
            '答题延迟：<input placeholder="单位毫秒(ms)，不可低于5000" value="5000" type="number" name="input_timer" style=""><br>' +
            '<button id="saveBtn" style="position: absolute;bottom:20px;right:20px">保存</button>' +
            '</div>';
        $("#alertBox2").html(html);
        // 添加接口描述内容
        let desc = document.createElement("div");
        desc.id = "apiDesc";
        desc.innerHTML = apis[config.api.order].desc;
        $(desc).css("margin", "-10px 50px 5px 5px");
        $("#alertBox2").append(desc);

        // 获取配置页的选择框，进行添加元素
        $("select[name='input_api']").html(() => {
            let html = "";
            apis.forEach(el => {
                html += "<option value='" + el.order + Utils.hash(el.name) + "'>" + el.name + "</option>"
            })
            return html;
        });
        // 获取默认的配置
        $("select[name='input_api']").val(config.api.order + config.api.hash);
        $("textarea[name='input_token']").val(config.token);
        $("input[name='input_timer']").val(config.timer);

        if (this.configBoxDom != "needless") {
            // 接口选择改变事件
            $("select[name='input_api']").bind("change", function () {
                $("#apiDesc").html(apis[Number(this.value.charAt())].desc);
            })
            // 给配置按钮添加点击事件
            $("#saveBtn").bind("click", () => {
                config = {
                    api: {
                        order: $("select[name='input_api']").val().charAt(),
                        hash: $("select[name='input_api']").val().substring(1)
                    },
                    token: $("textarea[name='input_token']").val(),
                    timer: isNaN($("input[name='input_timer']").val()) < 5000 ? 5000 : $("input[name='input_timer']").val()
                }
                window.localStorage.setItem("config", JSON.stringify(config));
                API = apis[config.api.order];
                alert("保存成功");
                $("#alertBox").hide();
            });
            // this.configBoxDom = $("#configBox");
        }
    }
}

function clearCount() {
    var flag = confirm("确定需要清空视频和答题次数吗\n此操作一经确认将无法撤回😁😁😁");
    if (flag) {
        window.localStorage.removeItem("course_num");
        window.localStorage.removeItem("question_num");
        course_num = 0, question_num = 0;
        $("#course").text(course_num);
        $("#question").text(question_num);
    }
}

var Utils = {
    ToUnicode: function (str) {
        return escape(str).toLocaleLowerCase().replace(/%u/gi, '\\u');
    },
    ToGB2312: function (str) {
        return unescape(str.replace(/\\u/gi, '%u'));
    },
    I64BIT_TABLE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split(''),
    hash: function (str) {
        let hash = 5381;
        let i = str.length - 1;

        if (typeof str == 'string') {
            for (; i > -1; i--) {
                hash += (hash << 5) + str.charCodeAt(i);
            }
        } else {
            for (; i > -1; i--) {
                hash += (hash << 5) + str[i];
            }
        }
        let value = hash & 0x7FFFFFFF;

        let retValue = '';
        do {
            retValue += this.I64BIT_TABLE[value & 0x3F];
        } while (value >>= 6);

        return retValue;
    }
}

$.fn.extend({
    myEvent: function (name) {
        let e = new CustomEvent(name);
        if (this[0].dispatchEvent) {
            this[0].dispatchEvent(e);
        } else {
            this[0].fireEvent(e);
        }
        delete e;
    }
});

