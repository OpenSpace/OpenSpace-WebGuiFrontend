import PropTypes from 'prop-types';
import React, { Component } from 'react';

import styles from '../../Climate/Button.scss';
import {
 DefaultStory,
} from '../../../api/keys'
import {
  storyGetLayer, storyGetLocation, storyGetIdleBehavior, storyResetLayer
} from '../../../utils/storyHelpers';

class DisplaylocalStory extends Component{

  constructor(props) {
    super(props);
  }

  render() {
    const {luaApi, json } = this.props;
    //storyResetLayer(luaApi);
    const { climateStorys, setShowLocalStory} = this.props;
    console.log(climateStorys.title)
    console.table(climateStorys.toggleboolproperties);
   climateStorys.toggleboolproperties.map((layer) => {
      console.table(layer);
        storyGetLayer(luaApi, layer )
    });
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
