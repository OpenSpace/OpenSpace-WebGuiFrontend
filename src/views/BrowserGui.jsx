import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import OnScreenGui from './OnScreenGui';

class BrowserGui extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={{backgroundColor: '#101010'}}>
        <OnScreenGui/>
      </div>
    );
  }
}

BrowserGui = withRouter(BrowserGui);

export default BrowserGui;
