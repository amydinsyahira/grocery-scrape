const express = require("express");

const _ = require('lodash');
const log = require('debug')('scrape');
const workerpool = require('workerpool');
const pool = workerpool.pool();

const router = express.Router();

router.get("/", (req, res) => {
    res.redirect('/');
});

router.post("/", async (req, res) => {
    try {
        if(_.isNil(process.env.API_DOMAIN_SCRAPE) || _.isEmpty(process.env.API_DOMAIN_SCRAPE)) {
            return res.json({
                status: false,
                data  : null
            })
        }

        const _domain_scrape = JSON.parse(process.env.API_DOMAIN_SCRAPE);
        if(!_.isArray(_domain_scrape)) {
            return res.json({
                status: false,
                data  : null
            })
        }

        let contents = [
            ["ID","Type","SKU","Name","Published","Is featured?","Visibility in catalog","Short description","Description","Date sale price starts","Date sale price ends","Tax status","Tax class","In stock?","Stock","Low stock amount","Backorders allowed?","Sold individually?","Weight (kg)","Length (cm)","Width (cm)","Height (cm)","Allow customer reviews?","Purchase note","Sale price","Regular price","Categories","Tags","Shipping class","Images","Download limit","Download expiry days","Parent","Grouped products","Upsells","Cross-sells","External URL","Button text","Position"]
        ];
    
        for (let index = 1; index < _.size(req.body.csv); index++) {
            const csv = req.body.csv[index];
            if(_.isNil(csv) || _.isEmpty(csv) || _.isNil(csv[0]) || _.isEmpty(csv[0])) continue;

            const provider = _.findIndex(_domain_scrape, domain => _.includes(csv[2], domain));
            if(_.eq(-1, provider)) continue;

            const result = await pool.exec(require(`./${_domain_scrape[provider]}`), [csv]);
            if(!_.isNil(result)) {
                contents.push(result);
            }
            await pool.terminate(); // terminate all workers when done
        };
    
        res.json({
            status: true,
            data  : contents
        });
    } catch (err) {
        log(err)
        res.json({
            status: false,
            data  : null
        });
    }
});

module.exports = router;
