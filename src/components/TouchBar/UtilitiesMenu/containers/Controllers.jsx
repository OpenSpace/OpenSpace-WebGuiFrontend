import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setPropertyValue, subscribeToProperty, unsubscribeToProperty } from '../../../../api/Actions';
import { NavigationAnchorKey, ScaleKey, ValuePlaceholder } from '../../../../api/keys';
import { UpdateDeltaTimeNow } from '../../../../utils/timeHelpers';
import DateController from '../presentational/DateController';
import ScaleController from '../presentational/ScaleController';
import SightsController from '../presentational/SightsController';
import TimePlayerController from '../presentational/TimePlayerController';
import ToggleBoolButtons from '../presentational/ToggleBoolButtons';

class Controllers extends Component {
  constructor(props) {
    super(props);

    this.onChangeSight = this.onChangeSight.bind(this);
    this.onChangeScale = this.onChangeScale.bind(this);
  }

  componentDidMount() {
    const { scaleNodes, startListening } = this.props;
    if (scaleNodes.length !== 0) {
      scaleNodes.forEach((n) => startListening(n.description.Identifier));
    }
  }

  componentWillUnmount() {
    const { scaleNodes, stopListening } = this.props;
    if (scaleNodes.length !== 0) {
      scaleNodes.forEach((n) => stopListening(n.description.Identifier));
    }
  }

  onChangeSight(selected) {
    const { changePropertyValue, luaApi, originNode } = this.props;

    UpdateDeltaTimeNow(luaApi, 1);
    // Check if the sight is on the current anchor, otherwise change anchor node
    if (originNode !== selected.planet) {
      changePropertyValue(originNode.description.Identifier, selected.planet);
    }

    luaApi.globebrowsing.goToGeo(
      selected.location.latitude,
      selected.location.longitude,
      selected.location.altitude
    );
  }

  onChangeScale() {
    const { changePropertyValue, scaleNodes, story } = this.props;

    const { scale } = story.scalenodes;
    const currentScale = scaleNodes[0].value;

    if (Number(currentScale) !== Number(scale)) {
      story.scalenodes.nodes.forEach((node, i) => {
        changePropertyValue(scaleNodes[i].description.Identifier, scale);
        scaleNodes[i].value = scale;
      });
    } else {
      story.scalenodes.nodes.forEach((node, i) => {
        changePropertyValue(scaleNodes[i].description.Identifier, 1);
        scaleNodes[i].value = 1;
      });
    }
  }

  render() {
    const { story, scaleNodes } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        { (story && story.timecontroller) && (
          <TimePlayerController />
        )}
        {(story && story.datecontroller) && (
          <DateController
            dateList={story.datecontroller}
            onChangeSight={this.onChangeSight}
          />
        )}
        {(story && story.sightscontroller) && (
          <SightsController
            sightsList={story.sightscontroller}
            onChangeSight={this.onChangeSight}
          />
        )}
        {(story && story.scalenodes) && (
          <ScaleController
            info={story.scalenodes.info}
            scale={(Number(scaleNodes[0].value) !== Number(story.scalenodes.scale)) ?
              1 : Number(story.scalenodes.scale)}
            onChangeScale={this.onChangeScale}
          />
        )}
        {(story && story.toggleboolproperties) && (
          <ToggleBoolButtons />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let originNode = [];
  const { story } = state.storyTree;
  const scaleNodes = [];

  originNode = state.propertyTree.properties[NavigationAnchorKey];

  if (story.scalenodes) {
    story.scalenodes.nodes.forEach((node) => {
      const key = ScaleKey.replace(ValuePlaceholder, `${node}`);
      const scaleNode = state.propertyTree.properties[key];
      if (scaleNode) {
        scaleNodes.push(scaleNode);
      }
    });
  }

  return {
    originNode,
    story,
    scaleNodes,
    luaApi: state.luaApi
  };
};

const mapDispatchToProps = (dispatch) => ({
  changePropertyValue: (uri, value) => {
    dispatch(setPropertyValue(uri, value));
  },
  startListening: (uri) => {
    dispatch(subscribeToProperty(uri));
  },
  stopListening: (uri) => {
    dispatch(unsubscribeToProperty(uri));
  }
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
    listeners: PropTypes.number
  })),
  changePropertyValue: PropTypes.func,
  startListening: PropTypes.func,
  stopListening: PropTypes.func,
  scaleNodes: PropTypes.objectOf(PropTypes.shape({
    value: PropTypes.string,
    description: PropTypes.string
  })),
  story: PropTypes.objectOf(PropTypes.shape({}))
};

Controllers.defaultProps = {
  originNode: [],
  scaleNodes: {},
  story: {},
  changePropertyValue: () => {},
  startListening: () => {},
  stopListening: () => {}
};

export default Controllers;
