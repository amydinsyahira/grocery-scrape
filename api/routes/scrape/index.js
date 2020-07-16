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

        const csv = req.body.csv;
        if(_.isNil(csv) || _.isEmpty(csv) || _.isNil(csv[0]) || _.isEmpty(csv[0])) {
            return res.json({
                status: false,
                data  : null
            })
        }

        const provider = _.findIndex(_domain_scrape, domain => _.includes(csv[2], domain));
        if(_.eq(-1, provider)) {
            return res.json({
                status: false,
                data  : null
            })
        }

        const result = await pool.exec(require(`./${_domain_scrape[provider]}`), [csv]);
        await pool.terminate(); // terminate all workers when done

        if(_.isNil(result)) {
            res.json({
                status: false,
                data  : null
            })
        } else {
            res.json({
                status: true,
                data  : result
            })
        }
    } catch (err) {
        log(err)
        res.json({
            status: false,
            data  : null
        });
    }
});

module.exports = router;
