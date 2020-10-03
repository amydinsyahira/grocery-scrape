import Head from 'next/head'
import getConfig from 'next/config'
import { useState } from 'react'
import { Container, Row, Card, Button, Form, Spinner, ProgressBar } from 'react-bootstrap'
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import CSVReader from 'react-csv-reader'
import { CSVLink } from 'react-csv';

const { publicRuntimeConfig } = getConfig();
const { API_PATH } = publicRuntimeConfig;

export default function Home() {
  const [isLoading, setLoading] = useState(false)
  const [nowProgress, setNowProgress] = useState(0)
  const [dataCsv, setDataCsv] = useState([])
  const [resultCsv, setResultCsv] = useState([])
  const [failedCsv, setFailedCsv] = useState([])

  const handleFileLoad = (data, fileInfo) => {
    setDataCsv(data)
    setResultCsv([])
    setFailedCsv([]);
    setNowProgress(0)
  }

  const handleSubmit = () => {
    if(_.isNil(dataCsv) || _.isEmpty(dataCsv)) return alert("Please choose csv file for scrape!");
    setLoading(true);

    (async function loopScrape(index, eachProgress, progress, dataCsv, results, failed) {
      const csv = dataCsv[index];

      progress = _.floor(_.add(_.toNumber(eachProgress), _.toNumber(progress)), 1);
      index++;

      if(_.gt(progress, 100)) progress = 100;
      try {
        if(_.isNil(csv)) {
          setResultCsv(results);
          if(_.gt(_.size(failed), 1)) setFailedCsv(failed);
          setDataCsv([]);
          setNowProgress(100);
          return setTimeout(() => setLoading(false), 3000);
        };

        if(_.isEmpty(csv[0])) {
          setNowProgress(progress);
          return loopScrape(index, eachProgress, progress, dataCsv, results, failed);
        };

        const res = await axios({
          method : 'post',
          url    : `${API_PATH}/scrape`,
          data   : { csv },
          timeout: 0
        });

        if(_.isNil(res.data.data) || _.isEmpty(res.data.data)) {
          failed.push(csv);
          setNowProgress(progress);
          return loopScrape(index, eachProgress, progress, dataCsv, results, failed);
        };

        results.push(res.data.data);
        setNowProgress(progress);
        loopScrape(index, eachProgress, progress, dataCsv, results, failed);
      } catch (err) {
        console.log("req err:", err);
        failed.push(csv);
        setNowProgress(progress);
        loopScrape(index, eachProgress, progress, dataCsv, results, failed);
      }
    })(1, _.divide(100, _.size(dataCsv)), 0, dataCsv, [JSON.parse(publicRuntimeConfig.API_HEADER_EXPORT)], [dataCsv[0]])
  }

  const marginLeft = {
    "margin-left": "10px" 
  };

  return (
    <Container className="md-container">
      <Head>
        <title>Scrape any Products from Alfacart and HappyFresh</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <h1>
          Welcome <a href="#">Scraper!</a>
        </h1>
        <p>
          This site for scrape any products from <a href="https://alfacart.com/">alfacart.com</a>, <a href="https://happyfresh.id/">happyfresh.id</a> and <a href="https://mirotakampus.com/">mirotakampus.com</a> based on urls from csv file
        </p>
        <Container>
          <Row className="justify-content-md-center">
            <Card className="sml-card">
              <Card.Body>
                <Card.Title>Import CSV file</Card.Title>
                <Card.Text>
                  <Form>
                    <div className="mb-3">
                      <small>Download this file for data format <a href='/sample-format.csv'>sample-format.csv</a></small><br /><br />
                      <CSVReader 
                        onFileLoaded={handleFileLoad} 
                        disabled={isLoading}
                      />
                    </div>
                  </Form>
                </Card.Text>
                <Button 
                  variant="primary" 
                  disabled={isLoading}
                  block 
                  onClick={() => !isLoading ? handleSubmit() : null}
                >
                  {isLoading ? 
                  <div>
                    <Spinner
                      as="span"
                      animation="grow"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    /> Please wait…
                  </div>
                  : 'Submit'}
                </Button><br />
                { isLoading && <div><ProgressBar animated now={nowProgress} label={`${nowProgress}%`} /><br /></div> }
                <div align="center">
                { !_.isEmpty(resultCsv) && 
                    <span>
                      <CSVLink 
                        data={resultCsv} 
                        className="btn btn-success"
                        filename={`wp-success-${moment().valueOf()}.csv`}
                      >
                        Success Result
                      </CSVLink> 
                    </span>
                }
                { !_.isEmpty(failedCsv) && 
                    <span style={marginLeft}>
                      <CSVLink 
                        data={failedCsv} 
                        className="btn btn-danger"
                        filename={`wp-failed-${moment().valueOf()}.csv`}
                      >
                        Failed Result
                      </CSVLink> 
                    </span>
                }
                </div>
              </Card.Body>
            </Card>
          </Row>
        </Container>
      </Container>

      <footer className="cntr-footer">
        Powered by&nbsp;
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
          Amydin S
        </a>
      </footer>
    </Container>
  )
}
