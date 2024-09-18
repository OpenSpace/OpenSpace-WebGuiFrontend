import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import ActionsGui from './views/ActionsGui';
import BrowserGui from './views/BrowserGui';
import NotFound from './views/NotFound';
import OnScreenGui from './views/OnScreenGui';
import WrappedOnTouchGui from './views/OnTouchGui';
import HostGui from './components/Streaming/HostGui';
import StreamingGui from './components/Streaming/StreamingGui';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onscreen" element={<OnScreenGui />} />
        <Route path="/remote" element={<BrowserGui />} />
        <Route path="/ontouch" element={<WrappedOnTouchGui />} />
        <Route path="/actions" element={<ActionsGui />} />
        <Route path="/streaming" element={<StreamingGui />} />
        <Route path="/host" element={<HostGui />} />
        {/* Here, more GUI variations can be added. */}
        {/* <Route path="/tablet" element={TabletGui} /> */}
        <Route path="/" element={<BrowserGui />} />
        <Route element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
