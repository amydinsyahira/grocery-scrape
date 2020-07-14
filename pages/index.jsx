import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Container, Row, Card, Button, Form, Spinner, ProgressBar } from 'react-bootstrap'
import _ from 'lodash'
import axios from 'axios'
import moment from 'moment'
import CSVReader from 'react-csv-reader'
import { CSVLink } from 'react-csv';

export default function Home() {
  const [isLoading, setLoading] = useState(false)
  const [nowProgress, setNowProgress] = useState(0)
  const [dataCsv, setDataCsv] = useState([])
  const [resultCsv, setResultCsv] = useState([])

  useEffect(() => {
    if(nowProgress && _.eq(nowProgress, 0)) return;
    if(nowProgress && _.lt(nowProgress, 100)) {
      if(!isLoading) return;
      simulateProgress().then(() => {
        let progress = _.clone(nowProgress);
            progress = _.add(progress, _.random(1, 5));

        if(!isLoading) return;

        if(_.gte(progress, 100)) {
          setNowProgress(100);
        } else {
          setNowProgress(progress);
        }
      })
    }
  }, [nowProgress]);

  const simulateProgress = () => {
    return new Promise((resolve) => setTimeout(resolve, _.random(1000, 5000)));
  }

  const handleFileLoad = (data, fileInfo) => {
    setDataCsv(data)
    setResultCsv([])
    setNowProgress(0)
  }

  const handleSubmit = async () => {
    if(_.isNil(dataCsv) || _.isEmpty(dataCsv)) return alert("Please choose csv file for scrape!");

    setLoading(true)
    setNowProgress(_.random(5, 20))
    
    try {
      const res = await axios({
        method: 'post',
        url   : '/api/scrape',
        data  : {
          csv: dataCsv
        }, 
        timeout         : 0,
        maxContentLength: 999999
      })

      setResultCsv(res.data.data)
      setDataCsv([])
      setNowProgress(100)
      setTimeout(() => setLoading(false), 1000)
    } catch (err) {
      console.log("req err:", err)
    }
  }

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
          This site for scrape any products from <a href="https://alfacart.com/">alfacart.com</a> and <a href="https://happyfresh.id/">happyfresh.id</a> based on urls from csv file
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
                { !_.isEmpty(resultCsv) && 
                  <div align="center">
                    <CSVLink 
                      data={resultCsv} 
                      className="btn btn-success"
                      filename={`wp-${moment().valueOf()}.csv`}
                    >
                      Download Result
                    </CSVLink> 
                  </div>
                }
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
