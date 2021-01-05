import React from "react";
import { clientId, redirectURL, scope, kwspAcsCodeURl } from "../config/config";
function AccessCode() {
  return (
    <div className="App">
      <header className="App-header">
        <a
          className="App-link"
          href={kwspAcsCodeURl + clientId + "&redirect_uri=" + redirectURL + "&scope=" + scope}
          target="_blank"
          rel="noopener noreferrer"
        >
          KWSP
        </a>
      </header>
    </div>
  );
}

export default AccessCode;
