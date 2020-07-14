const scrapeRoutes = require("./scrape");

function Router(app, handle) {
  /**
  * get index
  */
  app.get(process.env.API_PATH, (req, res) => {
      res.redirect('/');
  });

  app.use(`${process.env.API_PATH}/scrape`, scrapeRoutes);
}

module.exports = Router;
