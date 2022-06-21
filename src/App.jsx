import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import ActionsGui from './views/ActionsGui';
import BrowserGui from './views/BrowserGui';
import NotFound from './views/NotFound';
import OnScreenGui from './views/OnScreenGui';
import OnTouchGui from './views/OnTouchGui';
import RemoteGui from './views/RemoteGui';
import StreamingGui from './views/StreamingGui'; 
import HostGui from './views/HostGui';

const App = () => (
  <Router>
    <Switch>
      <Route path="/onscreen" component={OnScreenGui} />
      <Route path="/remote" component={RemoteGui} />
      <Route path="/ontouch" component={OnTouchGui} />
      <Route path="/actions" component={ActionsGui} />
      {/* Here, more GUI variations can be added. */}
      {/* <Route path="/tablet" component={TabletGui} /> */}
      <Route path="/streaming" component={StreamingGui} /> 
      <Route path="/host" component={HostGui} />
      <Route path="/" component={BrowserGui} />
      <Route component={NotFound} />
    </Switch>
  </Router>
);

export default App;
