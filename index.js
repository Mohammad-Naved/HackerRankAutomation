//minimist,pupeeter

const minimist=require("minimist");
const puppeteer=require("puppeteer");
const fs=require('fs')
const args=minimist(process.argv);
let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

(async () => {
    const browser = await puppeteer.launch( 
        {
            headless: false,
            args:[
            '--start-maximized' // you can also use '--start-fullscreen'
                ],
                 defaultViewport: null,
         });

    const page = await browser.newPage();
    await page.goto(args.url);
    await page.waitForTimeout(2000)
    await page.click("a[href='https://www.hackerrank.com/access-account/']")
    await page.waitForTimeout(1000)
    await page.click("a[href='https://www.hackerrank.com/login']")
    await page.waitForTimeout(1000)
    // await page.waitForSelector("input[placeholder='Your username or email']");
    await page.type("input[placeholder='Your username or email']",configJSO.userId,{delay:20});
    await page.type("input[placeholder='Your password']",configJSO.password,{delay:20});
    await page.click("button[data-analytics='LoginPassword']")
    await page.waitForTimeout(1000)
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']")
    await page.waitForTimeout(1000)
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']")
    await page.waitForTimeout(2000);

    await page.waitForSelector("a[data-attr1='Last']");
    let numberOfPage=await page.$eval("a[data-attr1='Last']",(alast)=>{
        let countOfPages=parseInt(alast.getAttribute("data-page"));
        return countOfPages;
    })
    
    for(let i=0;i<numberOfPage-1;i++){
        await page.waitForSelector("a.backbone.block-center");
        let contestUrls = await page.$$eval("a.backbone.block-center", function(atags){
            let urls = [];
    
            for(let i = 0; i < atags.length; i++){
                let url = atags[i].getAttribute('href');
                urls.push(url);
            }
    
            return urls;
        });
        for (let i = 0; i < contestUrls.length; i++) {
            let cpage = await browser.newPage();
    
            await saveModerator(args.url + contestUrls[i], cpage, configJSO.moderators);
    
            await cpage.close();
        }

        await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");
    
    }

    await page.waitForTimeout(4000);
    await browser.close();
  })();

  
  async function saveModerator(url, cpage, moderators) {
      await cpage.bringToFront();
      await cpage.goto(url);
  
      await cpage.waitForTimeout(3000);
  
      // click on moderators tab
      await cpage.waitForSelector("li[data-tab='moderators']");
      await cpage.click("li[data-tab='moderators']");
  
      // type in moderator
      await cpage.waitForSelector("input#moderator");
      await cpage.type("input#moderator", moderators, { delay: 20 });
      await cpage.waitForTimeout(3000)
      await cpage.keyboard.press("Enter");
  }