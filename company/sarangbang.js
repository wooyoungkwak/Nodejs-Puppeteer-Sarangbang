const cheerio = require('cheerio');

const log = console.log;

// 날짜 데이터 가져 오기 
async function getDate(date) {
    let resultDate;

    if (date.length == 0) {
        resultDate = "1970-01-01T00:00:00.000";
    } else if ( isNaN( date) ) {
        resultDate = "1970-01-01T00:00:00.000";
    } else if ( date.length == 4 ) {
        let num = Number(date);
        if ( num == 0 ) {
            resultDate = "1970-01-01T00:00:00.000";
        } else {
            resultDate = date + "-01-01T00:00:00.000";
        }
    } else {
            let temp = date.replace(".","");
            resultDate = temp.substring(0,4) + "-" + temp.substring(4,6) + "-" + temp.substring(6,8) + "T00:00:00.000";
    }

    return resultDate;
}


// 방 정보 데이터 가져오기
async function getBangInfo(page, index) {

    await page.waitForSelector('#listWrap');
    let clickUrl = `#listWrap > li:nth-child(${index}) > div > div > div:nth-child(1) > div > a`;
    await page.click(clickUrl);

    await page.waitForSelector('#tab1Conts > div > div.sec_wrap.mt-3 > table');
    let content = await page.content();
    let $ = cheerio.load(content);

    let data = {};

    let groundSelector = `#detailHead > div > div:nth-child(2) > div > div > div.info_article_feature.mt-2 > span > span:nth-child(2) > em`;   // 연면적
    let placeSelector = `#detailHead > div > div:nth-child(2) > div > div > div.info_article_feature.mt-2 > span > span:nth-child(1) > em`; // 대지
    let priceSelector = `#detailHead > div > div:nth-child(2) > div > div > div.info_article_price.text-second > span:nth-child(2) > em`; // 가격 

    let roomSelector = "#tab1Conts > div > div.sec_wrap.mt-3 > table > tbody > tr:nth-child(3) > td:nth-child(2)"; // 방         
    let bathroomSelector = `#tab1Conts > div > div.sec_wrap.mt-3 > table > tbody > tr:nth-child(3) > td:nth-child(4)`; // 욕실
    let floorSelector = `#tab1Conts > div > div.sec_wrap.mt-3 > table > tbody > tr:nth-child(2) > td`; // 층수
    let locationSelector = `#tab1Conts > div > div.sec_wrap.mt-3 > table > tbody > tr:nth-child(1) > td`;  // 위치 
    let heatingSelector = `#tab1Conts > div > div.sec_wrap.mt-3 > table > tbody > tr:nth-child(8) > td`; // 난방
    let addressSelector = `#full_addr`; // 주소
    let directionSelector = `#tab1Conts > div > div.sec_wrap.mt-3 > table > tbody > tr:nth-child(4) > td`; // 방향
    let registerDateSelector = `#tab1Conts > div > div.sec_wrap.mt-3 > table > tbody > tr:nth-child(6) > td:nth-child(4)`; // 사용승인일 (최초등록일)

    data.room       = $(roomSelector).text().replace('개','').trim();
    data.bathRoom   = $(bathroomSelector).text().replace('개','').trim();
    data.floor      = $(floorSelector).text().trim();
    data.place      = $(placeSelector).text().replace('㎡','').split(".")[0];
    data.ground     = $(groundSelector).text().replace('㎡','').split(".")[0];
    data.location   = $(locationSelector).text().trim();
    data.heating    = $(heatingSelector).text().trim();
    data.address    = $(addressSelector) === null ? "" : $(addressSelector).text();
    data.direction  = $(directionSelector).text().trim();
    data.price      = $(priceSelector).text().trim();
    data.registerDate = await getDate($(registerDateSelector).text().trim());

    return data;
}

// 방정보 리스트의 index 번호 배열 가져오기
async function getArrNum(page){
    
    await page.waitForSelector('#listWrap li');
    let listContent = await page.content();
    const $ = cheerio.load(listContent);
    let listWrap = $('#listWrap');

    let arr = [];
    listWrap.children().each( function() {
        if ( $(this).attr('class').indexOf('text-center') < 0 ) {
            arr.push( ($(this).index() + 1) );
        }
    });

    return arr;
}

async function getPageInfo(page) {

    let pageDatas =[];
    let arr =  await getArrNum(page);

    for( let i=0; i<arr.length; i++) {
        let data = await getBangInfo(page, arr[i]);
        pageDatas.push(data);
        await page.goBack();
    }

    return pageDatas;

}

// 마지막 페이지 번호 가져오기
async function getLastPage(page) {
    
    let content = await page.content();
    const $ = cheerio.load(content);

    let pagination = $('#pagination');
    
    let length = pagination.children('a').length;

    let lastPage;

    if ( length > 7 ) {
        lastPage = pagination.find('a:last-child').attr('data-page');
    } else {
        lastPage = ( length -2 );
    }
    
    return lastPage;
}

// 현재 페이지 번호 출력
async function printCurrentPage(page, selector) {
    let content = await page.content();
    const $ = cheerio.load(content);
    log( " selector = ", selector, " :: currentPage = ", $(selector).text());
}

async function run(page, num) {
    
    let sarangang_urls = [ ];
    
    sarangang_urls.push('https://home.sarangbang.com/v2/page/linead/search.html?cat=life&menu=house&submenu%5B0%5D=sell&area1=1&area2=11&keyword=');  // 단독/다가구 & 매매 & 광주 & 동구
    sarangang_urls.push('https://home.sarangbang.com/v2/page/linead/search.html?cat=life&menu=house&submenu%5B0%5D=sell&area1=1&area2=12&keyword=');  // 단독/다가구 & 매매 & 광주 & 서구
    sarangang_urls.push('https://home.sarangbang.com/v2/page/linead/search.html?cat=life&menu=house&submenu%5B0%5D=sell&area1=1&area2=13&keyword=');  // 단독/다가구 & 매매 & 광주 & 남구
    sarangang_urls.push('https://home.sarangbang.com/v2/page/linead/search.html?cat=life&menu=house&submenu%5B0%5D=sell&area1=1&area2=14&keyword=');  // 단독/다가구 & 매매 & 광주 & 북구
    sarangang_urls.push('https://home.sarangbang.com/v2/page/linead/search.html?cat=life&menu=house&submenu%5B0%5D=sell&area1=1&area2=15&keyword=');  // 단독/다가구 & 매매 & 광주 & 광산구
    
    await page.goto(sarangang_urls[num]);

    let datas =[];

    let lastPage = await getLastPage(page);
    
    log("start time - ", new Date());

    let clickSelector;

    for (let i=0; i<lastPage; i++) {
        
        if ( i > 2) {
            clickSelector = `#pagination > a:nth-child(7)`;
        } else {
            clickSelector = `#pagination > a:nth-child(${i+4})`;
        }
        
        // printCurrentPage(page, clickSelector);

        await page.waitForSelector(clickSelector);
        await page.click(clickSelector);

        let pageData = await getPageInfo(page);
        datas.push(...pageData);
        
        log( "================= complete page num = " + (i) + " ===================" );
    }

    log("end time - ", new Date());

    return datas;
}

module.exports.run = run;
module.exports.DONGGU_PAGE = 0;
module.exports.SEOGU_PAGE = 1;
module.exports.NAMGU_PAGE = 2;
module.exports.BUKGU_PAGE = 3;
module.exports.KWANGSANGU_PAGE = 4;


