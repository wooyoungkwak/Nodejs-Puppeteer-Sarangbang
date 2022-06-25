const { testElement } = require('domutils');
const puppeteer = require('puppeteer');
const sarangbang = require("./company/sarangbang");
const comUtil = require("./util/comUtil");
const fileUtil = require("./util/fileUtil");

const log = console.log;

async function write(){
    let browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1080
    });

    let datas;

    let fileNames = [
        "./db/donggu.json",
        "./db/seogu.json",
        "./db/namgu.json",
        "./db/bukgu.json",
        "./db/kwangsangu.json"
    ]

    let pageNum = sarangbang.DONGGU_PAGE;

    datas = await sarangbang.run(page, pageNum);

    page.waitForTimeout(1000)
        .then( () =>{
            if (!debugMode) fileUtil.writeJsonFile(fileNames[pageNum], datas);
            browser.close();
        });

}

async function send(pageNum){
    let datas;

    let fileNames = [
        "./db/donggu.json",
        "./db/seogu.json",
        "./db/namgu.json",
        "./db/bukgu.json",
        "./db/kwangsangu.json"
    ]

    // let pageNum = sarangbang.DONGGU_PAGE;

    datas = fileUtil.readJsonFile(fileNames[pageNum]);

    let url = "http://localhost:8080/api/banginfo";

    comUtil.postSend(url, datas);

}

async function validate(pageNum){

    let result = false;

    const $ = require("jquery");
    let datas;

    let fileNames = [
        "./db/donggu.json",
        "./db/seogu.json",
        "./db/namgu.json",
        "./db/bukgu.json",
        "./db/kwangsangu.json"
    ]

    // let pageNum = sarangbang.NAMGU_PAGE;

    datas = fileUtil.readJsonFile(fileNames[pageNum]);

    for ( let i=0; i< datas.length; i++) {
        if ( isNaN(datas[i].room) ) {
            log("index = ", i, " room = ", datas[i].room, " price = ", datas[i].price);
            result = true;
        }

        if ( isNaN(datas[i].bathRoom) ) {
            log("index = ", i, " bathRoom = ", datas[i].bathRoom, " price = ", datas[i].price);
            result = true;
        }
    }

    return result;
}

async function run() {

    // 파일 쓰기 
    // write(); 

    // 페이지 번호
    let pageNum = sarangbang.KWANGSANGU_PAGE;

    // 유효성 체크
    let result = await validate(pageNum);
    
    // JSON 파일 읽어서 API 에 전송
    if (!result) {
        await send(pageNum);
        log("send complete .... ");
    }

}

run();
