import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import OnScreenGui from './OnScreenGui';

class BrowserGui extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{backgroundColor: '#050505'}}>
        <OnScreenGui showFlightController />
      </div>
    );
  }
}

BrowserGui = withRouter(BrowserGui);

export default BrowserGui;
