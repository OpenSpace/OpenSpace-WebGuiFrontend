import React, { Component } from 'react';
import { connect } from 'react-redux';
import MarkerInfo from './MarkerInfo';

import propertyDispatcher from '../../../api/propertyDispatcher';

class Marker extends Component{

  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.props.positionDispatcher.subscribe();
    this.props.offsetDispatcher.subscribe();
    this.props.visibilityDispatcher.subscribe();
  }

  componentWillUnMount(){
    this.props.positionDispatcher.unsubscribe();
    this.props.offsetDispatcher.unsubscribe();
    this.props.visibilityDispatcher.unsubscribe();
  }

  render() {
    if (!this.props.screenVisibility) {
      return null;
    }
    return (
      <MarkerInfo
        identifier={this.props.nodeIdentifier}
        position={this.props.screenSpacePos.value}
        size={this.props.size}
        showInfoIcon={this.props.showInfoIcon}
        nodeInfo={this.props.infoNode}
        showLabel={this.props.showLabel}
        offset={this.props.screenSpaceOffset}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const screenVisibility = state.propertyTree.properties[`Scene.${ownProps.nodeIdentifier}.ScreenVisibility`].value;

  if (!screenVisibility) {
    return {
      screenVisibility,
    };
  }
  
  const screenSpacePos = state.propertyTree.properties[`Scene.${ownProps.nodeIdentifier}.ScreenSpacePosition`];
  const screenSpaceOffset = Number(state.propertyTree.properties[`Scene.${ownProps.nodeIdentifier}.ScreenSizeRadius`].value);
  
  let infoNode = {name: '', info: ''};
  let infoNodes = false;

  if (state.storyTree.info.infonodes) {
    infoNodes = state.storyTree.info.infonodes;
    infoNode = infoNodes.find(infoNode => infoNode.name === ownProps.nodeIdentifier);
  }

  const hasHideInfoIcons = ownProps.nodeIdentifier.includes(state.storyTree.story.hideinfoicons);
  const showInfoIcon = (!hasHideInfoIcons && infoNodes && screenSpaceOffset > 25);
  const showLabel = (screenSpaceOffset > 8 );

  const max_size = 3;
  const min_size = 1.5;
  const size_factor = 0.1;
  let size = screenSpaceOffset * size_factor;
  if (size > max_size) {
    size = max_size;
  } else if (size < min_size) {
    size = min_size;
  }

  return {
    screenVisibility,
    screenSpacePos,
    screenSpaceOffset,
    size,
    infoNode,
    showLabel,
    showInfoIcon
  };
};


MarkerInfo.defaultProps = {
  screenVisibility : false,
  showInfoIcon: false,
  showLabel : false,
  screenSpacePos : [-1,-1],
  screenSpaceOffset : 0,
  size : 0,
  infoNode : {name: '', info: ''}
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  positionDispatcher : propertyDispatcher(dispatch, `Scene.${ownProps.nodeIdentifier}.ScreenSpacePosition`),
  offsetDispatcher : propertyDispatcher(dispatch, `Scene.${ownProps.nodeIdentifier}.ScreenSizeRadius`),
  visibilityDispatcher : propertyDispatcher(dispatch, `Scene.${ownProps.nodeIdentifier}.ScreenVisibility`),
});

Marker = connect(
  mapStateToProps,
  mapDispatchToProps
)(Marker);

export default Marker;
