module.exports = (body) => {
    const _ = require('lodash');
    const log = require('debug')('_happyfresh');
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

            log(33, await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > h2")));
            const title = await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > h2").innerText);

            log(36, await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div.jsx-1628157066.jsx-1671252735.unit-information")));
            let short_desc = await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div.jsx-1628157066.jsx-1671252735.unit-information").innerText);
                short_desc = _.replace(short_desc, /\n/g, ' ');
                short_desc = _.replace(short_desc, /\r/g, ' ');
                short_desc = _.replace(short_desc, /"/g, '\'');

            log(39, await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div.jsx-1628157066.jsx-1671252735.description")));
            let long_desc = await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div.jsx-1628157066.jsx-1671252735.description").innerText);
                long_desc = _.replace(long_desc, /\n/g, ' ');
                long_desc = _.replace(long_desc, /\r/g, ' ');

            log(42, await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div:nth-child(3) > span")));
            const regular_price_exist = await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div:nth-child(3) > span"));

            let regular_price;
            if(!_.isNil(regular_price_exist)) {
                log(47, await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div:nth-child(3) > span")));
                regular_price = await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div:nth-child(3) > span").innerText);

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

            log(61, await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div.jsx-1628157066.jsx-1671252735.price > span.jsx-1628157066.jsx-1671252735.display-price")));
            let sale_price = await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-8 > div > div.jsx-1628157066.jsx-1671252735.price > span.jsx-1628157066.jsx-1671252735.display-price").innerText);
                sale_price = _.replace(sale_price, 'Rp', '');
                sale_price = _.replace(sale_price, 'IDR', '');
                sale_price = _.replace(sale_price, /\./g, '');
                sale_price = _.replace(sale_price, /\,/g, '');
                sale_price = _.replace(sale_price, /\s/g, '');
                sale_price = _.toNumber(sale_price);

            log(70, await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-4 > div > div > div > div > div > div > div > div > div > div > figure > div:nth-child(2) > img")));
            const images = await page.evaluate(() => document.querySelector("#__next > div > div > div > div > div.jsx-441593703.row.mt-5 > div.jsx-2435173250.col-md-4 > div > div > div > div > div > div > div > div > div > div > figure > div:nth-child(2) > img").src);

            await browser.close();
            return [
                body[0],"simple",,title,1,0,"visible",short_desc,long_desc,,,"taxable",,1,,,0,0,0,,,,1,,_.isNil(regular_price) ? undefined : sale_price,_.isNil(regular_price) ? sale_price : regular_price,body[1],,,images,,,,,,,,,0
            ]
        } catch (err) {
            log(err)
            await browser.close();
            return null;
        }
	})()
}