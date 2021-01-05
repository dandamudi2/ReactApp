import React, { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";
import axios from "axios";
import qs from "qs";
import "../css/statement.css";
import { clientId, redirectURL, scope, clientSecret } from "../config/config";
import { Input, Col, Row, Layout } from "antd";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
const { Header, Footer, Content } = Layout;

export default function App() {
  const [btn, setBtn] = useState(false);
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [NRIC, setNRIC] = useState("");
  const [NRICValid, setValid] = useState(false);
  const [loader, setLoader] = useState(false);
  const [records, setRecords] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [accNo, setAccNo] = useState("");
  const [totalAmt, setTotalAmt] = useState(0);
  const [pages, setPage] = useState([]);

  useEffect(() => {
    // Get authentication code
    getCode()
      .then((authcode) => {
        setCode(authcode);
      })
      .catch((error) => {});

    // Check NRIC input length
    if (NRIC.length === 12) {
      setValid(true);
    } else {
      setValid(false);
    }

    // Get the token
    if (NRICValid && code !== "" && token === "") {
      getToken(code)
        .then((token) => {
          setToken(token);
        })
        .catch((error) => {});
    }

    // Handle button on click
    if (token !== "" && btn) {
      setBtn(false);
      getStatement(token)
        .then((statement) => {
          let data = statement.detail;
          setName(statement.cifName);
          setAccNo(statement.accNum);
          setRecords(data);
          let total = 0;
          // Calculate the total amount
          data.forEach((record) => {
            total += Number(record.transAmt);
          });
          setTotalAmt(total.toFixed(2));
          setLoader(false);
          let pages = splitPage(data);
          setPage(pages);
        })
        .catch((error) => {
          // setMsg("Fail to verify EPF statement.");
        });
    }
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = today.getFullYear();
    today = dd + "/" + mm + "/" + yyyy;
    setDate(today);
  }, [btn, code, token, NRIC.length, NRICValid]);

  return (
    <div className="container">
      <Layout>
        <Header className="row header">
          <Content className="alrajhiLogo"></Content>
        </Header>
        <Content className="containerBody">
          <div className={loader ? "backdrop show" : "backdrop"}>
            <div className="loader"></div>
          </div>

          <Row className="mainContent">
            <Col className="epfLogo"></Col>
            <Col className="epfForm">
              <h2>Retrieval of EPF Statement</h2>
              <Row className="input">
                <p>ID Type</p>
                <Input.Group>
                  <Row className="inputRow">
                    <Col>
                      <Input className="fieldTitle" defaultValue="NRIC No." disabled />
                      <Input
                        className="inputField"
                        defaultValue="Document ID"
                        maxLength="12"
                        onChange={(e) =>
                          numberOnly(e).then((value) => {
                            setNRIC(value);
                          })
                        }
                        value={NRIC}
                      />
                    </Col>
                  </Row>
                </Input.Group>
              </Row>
              <button
                disabled={!NRICValid}
                onClick={() => {
                  setBtn(true);
                  setLoader(true);
                  document.body.style.height = "100%";
                  document.body.style.overflowY = "hidden";
                  // setMsg("EPF Statement Verification in Progress.");
                }}>
                SUBMIT
              </button>
            </Col>
          </Row>
        </Content>
        <Footer className="row footer2">
          <Row>
            <Col className="contactUs">
              <Row>
                <Row>Contact Us</Row>
                <Row>+603 2332 6000</Row>
              </Row>
            </Col>
          </Row>
        </Footer>
        <Footer className="row footer">
          <p className="copyRight">Copyright © 2019. Al Rajhi Banking & Investment Corporation (Malaysia) Berhad (Company No.: 719057-X). All rights reserved.</p>
        </Footer>
        <PDF records={records} pages={pages} name={name} date={date} accNo={accNo} NRIC={NRIC} totalAmt={totalAmt} />
      </Layout>
    </div>
  );
}

class PDF extends React.Component {
  componentDidUpdate() {
    if (document.getElementById("pdf0") !== null) {
      // Add the header section to the first page
      let childElement = (
        <div>
          <div className="pdfName">Name : {this.props.name}</div>
          <h2 className="pdfTitle">Statement Detail</h2>
          <div className="tableRow">
            <div className="tableRow">
              <div className="tableCell">Date </div>
              <div className="tableCell"> : {this.props.date}</div>
            </div>
            <div className="tableRow">
              <div className="tableCell">KWSP Account No </div>
              <div className="tableCell"> : {this.props.accNo}</div>
            </div>
            <div className="tableRow">
              <div className="tableCell">NRIC No </div>
              <div className="tableCell"> : {this.props.NRIC.substring(0, 6) + "-" + this.props.NRIC.substring(6, 8) + "-" + this.props.NRIC.substring(8, 12)}</div>
            </div>
          </div>
        </div>
      );
      // Add the total amount row to the last page
      let amtElement = (
        <div className="totalRow">
          <td className="totalAmt textRight" colSpan="5">
            Total (MYR)
          </td>
          <td className="totalAmt textRight">{formatNumber(this.props.totalAmt)}</td>
        </div>
      );
      // Get the last page
      let amtRow = document.getElementById("pdf" + (this.props.pages.length - 1)).lastChild.children[0].lastChild.lastChild;
      // Render the header section
      ReactDOM.render(childElement, document.getElementById("pdf0").children[2], () => {
        // Render the total amount row
        ReactDOM.render(amtElement, amtRow, () => {
          let doc = new jsPDF("p", "mm");
          let imgWidth = 210;
          let position = 0;
          // Convert each pages to image file
          for (let i = 0; i < this.props.pages.length; i++) {
            html2canvas(document.querySelector("#pdf" + i)).then((canvas) => {
              let imgHeight = (canvas.height * imgWidth) / canvas.width;
              const imgData = canvas.toDataURL("image/png");
              doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
              // Add new page
              doc.addPage();
              // If loop end
              if (i === this.props.pages.length - 1) {
                // Delete the last blank page
                doc.deletePage(this.props.pages.length + 1);
                // Save and download the file
                doc.save(this.props.accNo + ".pdf");
              }
            });
          }
        });
      });
    }
  }

  render() {
    return (
      <div>
        {this.props.pages.map((data, index) => (
          <div id={"pdf" + index} className="pdf" key={index}>
            <div className="pdfHeader">
              <div className="pdfAlrajhiLogo"></div>
            </div>
            <div className="pdfKWSPLogo"></div>
            <div id="topContainer"></div>
            <div className="statementTable">
              <table border="0" cellSpacing="0" cellPadding="0">
                <thead className="tableHeader">
                  <tr>
                    <td>Contribution Month</td>
                    <td>Effective Date</td>
                    <td>Transaction Date</td>
                    <td>Employer Contribution (MYR)</td>
                    <td>Employee Contribution (MYR)</td>
                    <td>Total (MYR)</td>
                  </tr>
                </thead>
                <tbody className="tableBody">
                  {data.map((detail, index) => (
                    <tr key={index}>
                      <td>{detail.contriMonth}</td>
                      <td>{detail.effDate}</td>
                      <td>{detail.transDate}</td>
                      <td className="textRight">{formatNumber(detail.empShareAmt)}</td>
                      <td className="textRight">{formatNumber(detail.employeeShareAmt)}</td>
                      <td className="textRight">{formatNumber(detail.transAmt)}</td>
                    </tr>
                  ))}
                  <tr></tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

// Break the entire record into different pages
function splitPage(records) {
  // Set 20 rows per page
  const recordLimit = 20;
  let pages = [];
  let splitArray = [];
  for (let i = 0; i < records.length; i++) {
    if (i % recordLimit === 0 && i !== 0) {
      splitArray.push(records[i]);
      pages.push(splitArray);
      splitArray = [];
    } else {
      splitArray.push(records[i]);
    }
    // If loop end
    if (i === records.length - 1) {
      splitArray.push(records[i]);
      pages.push(splitArray);
      // Reset array
      splitArray = [];
    }
  }
  return pages;
}

// Add the thousand separator
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

// Remove the alphabet and special characters from input
function numberOnly(event) {
  let value = event.target.value;
  return new Promise((resolve, reject) => {
    if (!Number(value)) {
      resolve(value.slice(0, -1));
    } else {
      resolve(value);
    }
  });
}

// Axios to handle API requests
function axiosHelper(config) {
  return new Promise((resolve, reject) => {
    axios(config)
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          resolve(response.data);
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

// Get authentication code from URL
function getCode() {
  const urlParams = new URLSearchParams(window.location.search);
  let authcode = urlParams.get("code");
  return new Promise((resolve, reject) => {
    if (authcode !== "" || authcode !== undefined) {
      resolve(authcode);
    } else {
      reject("Auth code not found");
    }
  });
}

// Get token from KWSP
function getToken(authcode) {
  const encodedString = new Buffer(clientId + ":" + clientSecret).toString("base64");
  let data = qs.stringify({
    grant_type: "authorization_code",
    code: authcode,
    redirect_uri: redirectURL,
    scope: scope,
  });
  let config = {
    method: "POST",
    url: "https://api-sandbox.kwsp.gov.my:443/epf/sb/authcode-sb-sec/oauth2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + encodedString,
    },
    data: data,
  };

  return new Promise((resolve, reject) => {
    axiosHelper(config)
      .then((response) => {
        resolve(response.access_token);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Get statement from KWSP
function getStatement(token) {
  let data = JSON.stringify({
    idNum: "680812131025",
    idType: "IN",
    contriMonthFrom: "2014-01-01",
    contriMonthTo: "2014-12-01",
  });
  let config = {
    method: "POST",
    url: "https://api-sandbox.kwsp.gov.my:443/epf/sb/v1.0/mock/account/miniStatement/",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      "x-ibm-client-id": clientId,
    },
    data: data,
  };

  return new Promise((resolve, reject) => {
    axiosHelper(config)
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
