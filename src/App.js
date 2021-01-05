import React from "react";
import "./App.css";
import Router from "./router/route";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://api-sandbox.kwsp.gov.my:443/epf/sb/authcode-sb-sec/oauth2/authorize?response_type=code&client_id=e965a7d5488343ac8d9dbc40fe98fc7a&redirect_uri=https://facdeals.com&scope=api:read_miniStatement"
            target="_blank"
            rel="noopener noreferrer">
            Learn React
          </a>
        </header>
      </div>
    </Router>
  );
}

export default App;
