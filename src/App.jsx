import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import ActionsGui from './views/ActionsGui';
import BrowserGui from './views/BrowserGui';
import NotFound from './views/NotFound';
import OnScreenGui from './views/OnScreenGui';
import OnTouchGui from './views/OnTouchGui';
import RemoteGui from './views/RemoteGui';
import OnClimateGui from './views/OnClimateGui'


const App = () => (
  <Router>

    <Switch>
      <Route path="/ontouch" component={OnTouchGui} />
      //<Route path="/onscreen" component={OnScreenGui} />
      <Route path="/onscreen" component={OnClimateGui} />
      <Route path="/remote" component={RemoteGui} />

      <Route path="/actions" component={ActionsGui} />
      <Route path="/climate" component={OnClimateGui} />

      {/* Here, more GUI variations can be added. */}
      {/* <Route path="/tablet" component={TabletGui} /> */}
      //<Route path="/" component={RemoteGui} />
      <Route path="/" component={OnClimateGui} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
