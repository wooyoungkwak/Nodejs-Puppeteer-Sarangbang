const axios = require("axios");
const cheerio = require("cheerio");
const { html } = require("cheerio/lib/static");
const log = console.log;
const getHtml = async () => {
    try {
        // return await axios.get("https://home.sarangbang.com/v2/page/linead/search.html?cat=life&menu=house&submenu%5B0%5D=sell&area1=1&area2=13&keyword=");
        return await axios.get("https://home.sarangbang.com/v2/page/linead/search.html?cat=life&menu=house&submenu%5B0%5D=sell&area1=1&area2=13&area3%5B0%5D=%EC%A3%BC%EC%9B%94%EB%8F%99&keyword=");
        // axios.get 함수를 이용하여 비동기로 싸이트의 html 파일을 가져온다. 
    } catch (error) {
        console.error(error);
    }
};

// 장성
// getHtml().then(html => { 
//     let ulList = []; 
//     const $ = cheerio.load(html.data); 
//     const $learning_models = $("div.learning_model_wrap").children();

//     // $learning_models.each(function(i, elem) { 
//     //     console.log( $(this).html() );
//     //     // ulList[i] = { 
//     //     //     title: $(this).find('span.ah_k').text(), 
//     //     //     url: $(this).find('a.ah_a').attr('href') 
//     //     // }; 
//     // }); 
//     const data = ulList.filter(n => n.title); 
//     return data; 
// }).then(res => log(res));


getHtml().then(html => {
    const $ = cheerio.load(html.data);
    return $("#listWrap").parent().html();
}).then(res => {
    log(res);
});
