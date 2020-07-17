module.exports = (body) => {
    const _ = require('lodash');
    const log = require('debug')('_alfacart');
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

            log(33, await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > h3")));
            const title = await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > h3").innerText);

            log(36, await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(1) > div.col-sm-9.pl-0 > div")));
            const short_desc = await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(1) > div.col-sm-9.pl-0 > div").innerHTML);

            log(39, await page.evaluate(() => document.querySelector("#deskripsi")));
            const long_desc = await page.evaluate(() => document.querySelector("#deskripsi").innerText);

            log(42, await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(3) > div.col-sm-9.pl-0 > p.fprice")));
            const regular_price_exist = await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(3) > div.col-sm-9.pl-0 > p.fprice"));

            let regular_price;
            if(!_.isNil(regular_price_exist)) {
                log(47, await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(3) > div.col-sm-9.pl-0 > p.fprice")));
                regular_price = await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(3) > div.col-sm-9.pl-0 > p.fprice").innerText);
                
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

            log(61, await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(3) > div.col-sm-9.pl-0 > p.tprice")));
            let sale_price = await page.evaluate(() => document.querySelector("#__layout > div > div:nth-child(2) > main > div > div:nth-child(2) > div.col-sm-9 > div > div > div:nth-child(5) > div.col-sm-7.pl-60 > div:nth-child(3) > div.col-sm-9.pl-0 > p.tprice").innerText);
                sale_price = _.replace(sale_price, 'Rp', '');
                sale_price = _.replace(sale_price, 'IDR', '');
                sale_price = _.replace(sale_price, /\./g, '');
                sale_price = _.replace(sale_price, /\,/g, '');
                sale_price = _.replace(sale_price, /\s/g, '');
                sale_price = _.toNumber(sale_price);

            await page.click("#slick0 > div > div > div > div > div > div > img");

            log(72, await page.evaluate(() => document.querySelector("#blueimp-gallery > div")));
            const total_images = await page.evaluate(() => document.querySelector("#blueimp-gallery > div").childElementCount);
            let images;
            for (let index = 1; index <= total_images; index++) {
                log(76, await page.evaluate(num => document.querySelector(`#blueimp-gallery > div > div:nth-child(${num}) > img`), index));
                if(_.eq(index, 1)) images = await page.evaluate(num => document.querySelector(`#blueimp-gallery > div > div:nth-child(${num}) > img`).src, index);
                else images += ', ' + await page.evaluate(num => document.querySelector(`#blueimp-gallery > div > div:nth-child(${num}) > img`).src, index);
            };

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