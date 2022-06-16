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
    const { climateStorys, setShowLocalStory, luaApi} = this.props;
    var orbitAtConstantLatiude = 1 //placment in IdleBehavior scrollbar

    storyResetLayer(luaApi);
    climateStorys.toggleboolproperties.map((layer) => {
        storyGetLayer(luaApi, layer )
    });
    
    storyGetLocation(luaApi, climateStorys.pos, climateStorys.date);
    storyGetIdleBehavior(luaApi, orbitAtConstantLatiude, false);

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
