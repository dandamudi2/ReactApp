import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Statement from "../pages/getStatement";
import AccessCode from "../pages/getAcsCode";

class router extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          {/* <Route path="/redirect/build/" exact>
            <Statement />
          </Route> */}
          <Route path="/redirect/build/" exact>
            <Statement />
          </Route>
          <Route path="/redirect/accessCode" exact>
            <AccessCode />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default router;
