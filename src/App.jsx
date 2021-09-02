import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import OnScreenGui from './views/OnScreenGui';
import RemoteGui from './views/RemoteGui';
import BrowserGui from './views/BrowserGui';
import OnTouchGui from './views/OnTouchGui';
import ActionsGui from './views/ActionsGui';
import NotFound from './views/NotFound';

const App = () => (
  <Router>
    <Switch>
      <Route path="/onscreen" component={OnScreenGui} />
      <Route path="/remote" component={RemoteGui} />
      <Route path="/ontouch" component={OnTouchGui} />
      <Route path="/actions" component={ActionsGui} />
      {/* Here, more GUI variations can be added. */}
      {/* <Route path="/tablet" component={TabletGui} /> */}
      <Route path="/" component={BrowserGui} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
