import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import ActionsGui from './views/ActionsGui';
import BrowserGui from './views/BrowserGui';
import NotFound from './views/NotFound';
import OnScreenGui from './views/OnScreenGui';
import WrappedOnTouchGui from './views/OnTouchGui';
import RemoteGui from './views/RemoteGui';
import StreamingGui from './views/StreamingGui'; 
import HostGui from './views/HostGui';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onscreen" element={<OnScreenGui />} />
        <Route path="/remote" element={<RemoteGui />} />
        <Route path="/ontouch" element={<WrappedOnTouchGui />} />
        <Route path="/actions" element={<ActionsGui />} />
        {/* Here, more GUI variations can be added. */}
        {/* <Route path="/tablet" element={TabletGui} /> */}
        <Route path="/streaming" component={<StreamingGui />} /> 
        <Route path="/host" component={<HostGui />} />
        <Route path="/" element={<BrowserGui />} />
        <Route element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
