import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import ActionsGui from './views/ActionsGui';
import BrowserGui from './views/BrowserGui';
import NotFound from './views/NotFound';
import OnScreenGui from './views/OnScreenGui';
import OnTouchGui from './views/OnTouchGui';
import RemoteGui from './views/RemoteGui';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onscreen" element={<OnScreenGui />} />
        <Route path="/remote" element={<RemoteGui />} />
        <Route path="/ontouch" element={<OnTouchGui />} />
        <Route path="/actions" element={<ActionsGui />} />
        {/* Here, more GUI variations can be added. */}
        {/* <Route path="/tablet" element={TabletGui} /> */}
        <Route path="/" element={<BrowserGui />} />
        <Route element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
