import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import OnScreenGui from './views/OnScreenGui';
import BrowserGui from './views/BrowserGui';
import OnTouchGui from './views/OnTouchGui';
import NotFound from './views/NotFound';

const App = () => (
  <Router>
    <Switch>
      <Route path="/onscreen" component={OnScreenGui} />
      <Route path="/ontouch" component={OnTouchGui} />
      {/* Here, more GUI variations can be added. */}
      {/* <Route path="/tablet" component={TabletGui} /> */}
      <Route path="/" component={BrowserGui} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
