import PropTypes from 'prop-types';
import React, { Component } from 'react';

import styles from './LocalStory.scss';
import {
 DefaultStory,
} from '../../../api/keys'


class DisplaylocalStory extends Component{

  constructor(props) {
    super(props);


  }



  render() {
    const { climateStorys, setShowLocalStory} = this.props;
    console.log('DisplaylocalStory')
    return (

        <div className = {styles.TellStory}>
          <div className = "flex">
            <div key = {climateStorys.id}>
                <h1>
                  {climateStorys.title}
                </h1>
                <p>
                  {climateStorys.storyinfo}
                </p>

              </div>
            </div>
          </div>
    );
  }
}


DisplaylocalStory.defaultProps = {
    climateStorys: {},

  };

export default DisplaylocalStory;
