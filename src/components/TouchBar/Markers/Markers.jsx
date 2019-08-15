import React, { Component } from 'react';
import { connect } from 'react-redux';
import MarkerInfo from './MarkerInfo';
import { subscribeToProperty, unsubscribeToProperty } from '../../../api/Actions/index';

class Markers extends Component {
  constructor(props) {
    super(props);
  }

  // Check if the point [x,y] is outside the circle with the center [centerX,centerY] and radius r
  static outsideCircle(centerX, centerY, r, x, y) {
    const squareDist = ((x - centerX) ** 2) + ((y - centerY) ** 2);
    return (squareDist > r ** 2);
  }

  componentDidMount(){
    //start listening for relevant properties
    if(!this.props.focusNodes)
      return;

    this.props.focusNodes.map(node => {
      this.props.startListening(`Scene.${node}.ScreenSpacePosition`);
      this.props.startListening(`Scene.${node}.ScreenSizeRadius`);
      this.props.startListening(`Scene.${node}.ScreenVisibility`);
      this.props.startListening(`Scene.${node}.DistanceFromCamToNode`);
    })
  }

  componentWillUnMount(){

    if(!this.props.focusNodes)
      return;
    //stop listening for relevant properties
    this.props.focusNodes.map(node => {
      this.props.stopListening(`Scene.${node}.ScreenSpacePosition`);
      this.props.stopListening(`Scene.${node}.ScreenSizeRadius`);
      this.props.stopListening(`Scene.${node}.ScreenVisibility`);
      this.props.stopListening(`Scene.${node}.DistanceFromCamToNode`);
    })
  }

  createInfoMarkers(){

    const markers = []

    for (const [index, node] of this.props.markerNodes.entries()) {

      if (!node.visibility) {
        continue;
      }

      markers.push(
        <MarkerInfo
          key = {node.name}
          identifier={node.name}
          position={node.screenSpacePos}
          size={node.size}
          showInfoIcon={true}
          nodeInfo={this.props.infoNodeDummy}
          showLabel={true}
          offset={node.screenSpaceRadius}
        />
      )
    }
    return markers;
  }

  // Determines whether this marker is visible by checking occlusion between
  // all nodes that are currently visible on the screen
  static updateVisibility(markerNodes){

    for (let index = 0; index < markerNodes.length; index++) {
      let node = markerNodes[index];

      //if this node is not on screen, we continue
      if(!node.visibility){
        continue;
      }
      const nodeCenterX = node.screenSpacePos[0];
      const nodeCenterY = node.screenSpacePos[1];
      const occlusionMarginFactor = 1.3;
        
      for (let compareIndex = 0; compareIndex < markerNodes.length; compareIndex++) {

        let compareNode = markerNodes[compareIndex];
        //if the other node is not visible we continue
        if(!compareNode.visibility){
          continue;
        }
        
        const compareNodeCenterX = compareNode.screenSpacePos[0];
        const compareNodeCenterY = compareNode.screenSpacePos[1];

        // check if this marker position is occluded by the comparing node
        let thisMarkerOutsideCircle = Markers.outsideCircle(compareNodeCenterX, compareNodeCenterY,
                  compareNode.screenSpaceRadius * occlusionMarginFactor, nodeCenterX, nodeCenterY + node.screenSpaceRadius);

        let compareIsInfront = (node.distanceFromCamera > compareNode.distanceFromCamera);

        if(!thisMarkerOutsideCircle && compareIsInfront){
          node.visibility = false;
        }
      }
    }

    markerNodes.map(markerNode =>{
      //if the marker is not occluded, calculate its size
      if(markerNode.visibility){
        markerNode.size = Markers.determineSize(markerNode.screenSpaceRadius);
      }
    })
  }

  //Determines size of the marker
  static determineSize(nodeRadius){

    let size = nodeRadius * 0.1;
    const max_marker_size = 3;
    const min_marker_size = 1.5;

    if (size >= max_marker_size)
      size = max_marker_size;
    if (size <= min_marker_size)
      size = min_marker_size;

    return size;
  }

  render() {

    if(!this.props.focusNodes)
    {
      return null;
    }

    return(
      <div className='Markers'>
        {this.createInfoMarkers()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {

  let markerNodes = [];

  let focusNodes = undefined;
  let infoNodeDummy = {name: '', info: 'dummyInfo'};

  //terminate if there are no focus nodes to track
  if(!state.storyTree.story.focusbuttons){
    return {focusNodes};
  }

  focusNodes = state.storyTree.story.focusbuttons;

  focusNodes.map(node => {

    let nodeProperties = {
      name: node,
      visibility: state.propertyTree.properties[`Scene.${node}.ScreenVisibility`].value,
      screenSpacePos: state.propertyTree.properties[`Scene.${node}.ScreenSpacePosition`].value,
      screenSpaceRadius: state.propertyTree.properties[`Scene.${node}.ScreenSizeRadius`].value,
      distanceFromCamera: state.propertyTree.properties[`Scene.${node}.DistanceFromCamToNode`].value,
      size: 0
    };

    markerNodes.push(nodeProperties);
  })

  Markers.updateVisibility(markerNodes);

  return {
    focusNodes,
    markerNodes,
    infoNodeDummy
  }
};

const mapDispatchToProps = dispatch => ({
  startListening: (uri) => {
    dispatch(subscribeToProperty(uri));
  },
  stopListening: (uri) => {
    dispatch(unsubscribeToProperty(uri));
  },
});

Markers = connect(
  mapStateToProps,
  mapDispatchToProps
)(Markers);

export default Markers;
