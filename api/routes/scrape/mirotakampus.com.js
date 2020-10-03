module.exports = (body) => {
    const _ = require('lodash');
    const log = require('debug')('_mirotakampus');
    const pup = require('puppeteer');
    const { NODE_ENV } = process.env;

	return (async () => {
        if(_.isNil(body) || !_.isArray(body)) return null;

        const browser = await pup.launch({ headless: _.includes(["production", "staging"], NODE_ENV) ? true : false, 
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1366x768',
        ]});
        const page = await browser.newPage();

        await page.setViewport({ width: 1366, height: 768 });
        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");

        try {
            /* await page.setRequestInterception(true);
            page.on("request", req => {
                if(_.includes(["stylesheet", "font"], req.resourceType())) req.abort();
                else req.continue();
            }); */
    
            await page.goto(body[2], { waitUntil: "networkidle0", timeout: 0 });

            const page_exist = await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > h5"));
            log(33, page_exist);
            if(_.isNull(page_exist)) {
                await browser.close();
                return null;
            }

            const title = await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > h5").innerText);

            log(35, await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > div.col-md-12 > div > div > div")));
            let short_desc  = await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > div.col-md-12 > div > div > div").innerText);
                short_desc = _.replace(short_desc, /\n/g, ' '); //\u2028
                short_desc = _.replace(short_desc, /\r/g, ' '); //\u2029
                short_desc = _.replace(short_desc, /"/g, '\'');

            log(39, await page.evaluate(() => document.querySelector("#pro-detil")));
            let long_desc  = await page.evaluate(() => document.querySelector("#pro-detil").innerText);
                long_desc = _.replace(long_desc, /\n/g, '\\n'); //\u2028
                long_desc = _.replace(long_desc, /\r/g, '\\r'); //\u2029
                long_desc = _.replace(long_desc, /"/g, '\'');

            log(42, await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > div.row > div:nth-child(1) > span > span")));
            const regular_price_exist = await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > div.row > div:nth-child(1) > span > span"));

            let regular_price;
            if(!_.isNil(regular_price_exist)) {
                log(47, await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > div.row > div:nth-child(1) > span > span")));
                regular_price = await page.evaluate(() => document.querySelector("#content > section > div > div > div.col-md-9.pull-right > div > div > div.product > div > div.col-md-7 > div.row > div:nth-child(1) > span > span").innerText);
                
                if(_.isEmpty(regular_price)) regular_price = undefined;
                else {
                    regular_price = _.replace(regular_price, 'Rp', '');
                    regular_price = _.replace(regular_price, 'IDR', '');
                    regular_price = _.replace(regular_price, /\./g, '');
                    regular_price = _.replace(regular_price, /\,/g, '');
                    regular_price = _.replace(regular_price, /\s/g, '');
                    regular_price = _.toNumber(regular_price);
                }
            }

            const images_exist = await page.evaluate(() => document.querySelector("#lightgallery"));
            log(72, images_exist);

            let images;
            if(!_.isNil(images_exist)) {
                const total_images = await page.evaluate(() => document.querySelector("#lightgallery").childElementCount);
                for (let index = 1; index <= total_images; index++) {
                    const image_exist = await page.evaluate(num => document.querySelector(`#lightgallery > li:nth-child(${num}) > div > div > div > img`), index);
                    log(76, image_exist);
                    if(_.isNil(image_exist)) continue;
    
                    if(_.eq(index, 1)) images = await page.evaluate(num => document.querySelector(`#lightgallery > li:nth-child(${num}) > div > div > div > img`).src, index);
                    else images += ', ' + await page.evaluate(num => document.querySelector(`#lightgallery > li:nth-child(${num}) > div > div > div > img`).src, index);
                }
            }

            await browser.close();
            return [
                body[0],"simple",,title,1,0,"visible",short_desc,long_desc,,,"taxable",,1,,,0,0,0,,,,1,,undefined,regular_price,body[1],,,images,,,,,,,,,0
            ]
        } catch (err) {
            log(err)
            await browser.close();
            return null;
        }
	})()
}