import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setPropertyValue, subscribeToProperty, unsubscribeToProperty } from '../../../../api/Actions';
import { NavigationAnchorKey, ScaleKey, ValuePlaceholder } from '../../../../api/keys';
import { UpdateDeltaTimeNow } from '../../../../utils/timeHelpers';
import DateController from './../presentational/DateController';
import ScaleController from './../presentational/ScaleController';
import SightsController from './../presentational/SightsController';
import TimePlayerController from './../presentational/TimePlayerController';
import ToggleBoolButtons from './../presentational/ToggleBoolButtons';


class Controllers extends Component {
  constructor(props) {
    super(props);

    this.onChangeSight = this.onChangeSight.bind(this);
    this.onChangeScale = this.onChangeScale.bind(this);
  }

  componentDidMount() {
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
        { (story && story.timecontroller) &&
          <TimePlayerController />
        }
        {(story && story.datecontroller) &&
          <DateController
            dateList={story.datecontroller}
            onChangeSight={this.onChangeSight}
          />
        }
        {(story && story.sightscontroller) &&
          <SightsController
            sightsList={story.sightscontroller}
            onChangeSight={this.onChangeSight}
          />
        }
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
