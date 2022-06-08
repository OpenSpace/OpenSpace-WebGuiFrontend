import PropTypes from 'prop-types';
import React, { Component } from 'react';

import styles from '../../Climate/Button.scss';
import {
 DefaultStory,
} from '../../../api/keys'

class DisplaylocalStory extends Component{

  constructor(props) {
    super(props);
  }

  render() {
    const { climateStorys, setShowLocalStory} = this.props;
    return (
            <div key = {climateStorys.id}>
                <h1>
                  {climateStorys.title}
                </h1>
                <p>
                  {climateStorys.storyinfo}
                </p>
          </div>
    );
  }
}

DisplaylocalStory.defaultProps = {
    climateStorys: {},
  };

export default DisplaylocalStory;
