// ==UserScript==
// @name         拒绝点击外链再次确认
// @namespace    noAConfirm
// @version      1.0.0
// @description  去掉知乎、简书中点击外链再次确认
// @author       yescpu@gmail.com
// @match        *://www.zhihu.com/*
// @match        *://www.jianshu.com/*
// @match        *://zhuanlan.zhihu.com/*
// @grant        unsafeWindow
// @run-at 		 document-end
// ==/UserScript==
(function () {
    'use strict';

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function replaceA(element, targetHost, realUrlParamsName) {
        if (targetHost == element.host) {
            var cleanUrl = getParameterByName(realUrlParamsName, element.href);
            console.log("cleanUrl", cleanUrl);
            element.href = cleanUrl;
            return true
        }
        return false
    }

    function processZhihu(mainContain) {
        let linkCardList = mainContain.getElementsByTagName("a")
        for (var i = 0; i < linkCardList.length; i++) {
            replaceA(linkCardList[i], "link.zhihu.com", "target");
        }
    }


    function observeDynamicContentZhihu(mainContain) {
        var config = { childList: true, subtree: true };
        var callback = function (mutationsList, observer) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    processZhihu(mainContain)
                }
            }
        };
        new MutationObserver(callback).observe(mainContain, config);
    }


    function process(host) {
        switch (host) {
            case "zhuanlan.zhihu.com": {
                var collection = document.getElementsByClassName("Post-content")
                if (collection.length > 0) {
                    let mainContain = collection[0];
                    processZhihu(mainContain)
                    //for load comment
                    observeDynamicContentZhihu(mainContain)
                }
                break
            }
            case "www.zhihu.com":{
                var rule = ["Topstory", "Question-main", "SearchMain"];
                var mainContain;
                for(let i in rule){
                    let collection = document.getElementsByClassName(rule[i]);
                    if (collection.length > 0) {
                        mainContain = collection[0];
                        break
                    }
                }
                if (mainContain == undefined) {
                    return
                }
                processZhihu(mainContain)
                observeDynamicContentZhihu(mainContain)
                break
            }
            case "www.jianshu.com":
                var allA = document.getElementsByTagName("article")[0].getElementsByTagName("a");
                for (let i = 0; i < allA.length; i++) {
                    if(!replaceA(allA[i], "link.jianshu.com", "t")){
                        replaceA(allA[i], "links.jianshu.com", "to")
                    }
                }
                break
        }
    }

    process(window.location.host);

})();
