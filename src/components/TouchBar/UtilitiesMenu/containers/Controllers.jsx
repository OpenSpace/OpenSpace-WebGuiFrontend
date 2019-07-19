import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { NavigationAnchorKey, ValuePlaceholder, ScaleKey } from '../../../../api/keys';
import { setPropertyValue, subscribeToProperty, unsubscribeToProperty } from '../../../../api/Actions';
import DateController from './../presentational/DateController';
import TimePlayerController from './../presentational/TimePlayerController';
import SightsController from './../presentational/SightsController';
import ScaleController from './../presentational/ScaleController';
import ToggleBoolButtons from './../presentational/ToggleBoolButtons';
import { UpdateDeltaTimeNow } from '../../../../utils/timeHelpers';

class Controllers extends Component {
  constructor(props) {
    super(props);

    this.onChangeSight = this.onChangeSight.bind(this);
    this.onChangeScale = this.onChangeScale.bind(this);
  }

  componentDidMount(){

    if (this.props.scaleNodes.length !== 0) {
      this.props.scaleNodes.forEach(scaleNode =>
        this.props.startListening(scaleNode.description.Identifier),
      );
    }
  }

  componentWillUnmount() {
    if (this.props.scaleNodes.length !== 0) {
      this.props.scaleNodes.forEach(scaleNode =>
        this.props.stopListening(scaleNode.description.Identifier),
      );
    }
  }

  onChangeSight(selected) {

    UpdateDeltaTimeNow(this.props.luaApi, 1);
    // Check if the sight is on the current anchor, otherwise change anchor node
    if (this.props.originNode !== selected.planet) {
      this.props.changePropertyValue(this.props.originNode.description.Identifier, selected.planet);
    }

    this.props.luaApi.globebrowsing.goToGeo(
      selected.location.latitude,
      selected.location.longitude,
      selected.location.altitude
    );
  }

  onChangeScale() {
    const scale = this.props.story.scalenodes.scale;
    const currentScale = this.props.scaleNodes[0].value;

    if(Number(currentScale) !== Number(scale)){
      this.props.story.scalenodes.nodes.forEach((node, i) => {
        this.props.changePropertyValue(this.props.scaleNodes[i].description.Identifier, scale);
        this.props.scaleNodes[i].value = scale;
      });   
    } else {
        this.props.story.scalenodes.nodes.forEach((node, i) => {
          this.props.changePropertyValue(this.props.scaleNodes[i].description.Identifier, 1);
          this.props.scaleNodes[i].value = 1;
      }); 
    }

  }

  render() {
    const { story } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        { (story && story.timecontroller !== false) &&
          <TimePlayerController />
        }
        {(story && story.datecontroller !== false) &&
        <DateController
          dateList={story.datecontroller}
          onChangeSight={this.onChangeSight}
        />}
        {(story && story.sightscontroller !== false) &&
        <SightsController
          sightsList={story.sightscontroller}
          onChangeSight={this.onChangeSight}
        />}
        {(story && story.scalenodes) &&
          <ScaleController
            info={story.scalenodes.info}
            scale={(Number(this.props.scaleNodes[0].value) !== Number(story.scalenodes.scale))
              ? 1 : Number(story.scalenodes.scale)}
            onChangeScale={this.onChangeScale}
          />
        }
        {(story && story.toggleboolproperties) &&
        <ToggleBoolButtons/>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let originNode = [];
  const story = state.storyTree.story;
  const scaleNodes = [];
  
  if (state.propertyTree !== undefined) {
    originNode = state.propertyTree.properties[NavigationAnchorKey];

    if (story.scalenodes) {
      story.scalenodes.nodes.forEach(node => {
        const scaleNode =
          state.propertyTree.properties[ScaleKey.replace(ValuePlaceholder, `${node}`)];
        if (scaleNode) {
          scaleNodes.push(scaleNode);
        }
      });
    }
  }

  return {
    originNode,
    story,
    scaleNodes,
    luaApi: state.luaApi
  };
};

const mapDispatchToProps = dispatch => ({
  changePropertyValue: (uri, value) => {
    dispatch(setPropertyValue(uri, value));
  },
  startListening: (uri) => {
    dispatch(subscribeToProperty(uri));
  },
  stopListening: (uri) => {
    dispatch(unsubscribeToProperty(uri));
  },
});

Controllers = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Controllers);

Controllers.propTypes = {
  originNode: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
    value: PropTypes.string,
    listeners: PropTypes.number,
  })),
  changePropertyValue: PropTypes.func,
  startListening: PropTypes.func,
  stopListening: PropTypes.func,
  scaleNodes: PropTypes.objectOf(PropTypes.shape({
    value: PropTypes.string,
    description: PropTypes.string,
  })),
  story: PropTypes.objectOf(PropTypes.shape({})),
};

Controllers.defaultProps = {
  originNode: [],
  scaleNodes: {},
  story: {},
  changePropertyValue: () => {},
  startListening: () => {},
  stopListening: () => {},
};

export default Controllers;
