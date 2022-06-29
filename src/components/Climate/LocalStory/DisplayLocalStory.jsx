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

    {  Object.keys(climateStorys.toggleboolproperties).length > 0 &&
        storyResetLayer(luaApi);
        climateStorys.toggleboolproperties.map((layer) => {
            storyGetLayer(luaApi, layer )
        });
    }
    {  Object.keys(climateStorys.pos).length > 0 &&

      luaApi.setPropertyValueSingle(
        "Scene.Earth.Renderable.Layers.ColorLayers.ESRI_World_Imagery.Enabled", true)
      storyGetLocation(luaApi, climateStorys.pos, climateStorys.date);

    }
    storyGetIdleBehavior(luaApi, orbitAtConstantLatiude, true, climateStorys.speedValue);

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
