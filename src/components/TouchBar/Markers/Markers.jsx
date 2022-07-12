import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setPropertyValue, subscribeToProperty, unsubscribeToProperty } from '../../../api/Actions/index';
import MarkerInfo from './MarkerInfo';

class Markers extends Component {
  constructor(props) {
    super(props);
  }

  // Check if the point [x,y] is outside the circle with the center [centerX,centerY] and radius r
  static outsideCircle(centerX, centerY, r, x, y) {
    const squareDist = ((x - centerX) ** 2) + ((y - centerY) ** 2);
    return (squareDist > r ** 2);
  }

  componentDidMount() {
    if (!this.props.trackingNodes) { return; }

    this.props.trackingNodes.map((node) => {
      this.props.changePropertyValue(`Scene.${node}.ComputeScreenSpaceData`, true);
      this.props.startListening(`Scene.${node}.ScreenSpacePosition`);
      this.props.startListening(`Scene.${node}.ScreenSizeRadius`);
      this.props.startListening(`Scene.${node}.ScreenVisibility`);
      this.props.startListening(`Scene.${node}.DistanceFromCamToNode`);
    });
  }

  componentWillUnMount() {
    if (!this.props.trackingNodes) { return; }

    this.props.trackingNodes.map((node) => {
      this.props.changePropertyValue(`Scene.${node}.ComputeScreenSpaceData`, false);
      this.props.stopListening(`Scene.${node}.ScreenSpacePosition`);
      this.props.stopListening(`Scene.${node}.ScreenSizeRadius`);
      this.props.stopListening(`Scene.${node}.ScreenVisibility`);
      this.props.stopListening(`Scene.${node}.DistanceFromCamToNode`);
    });
  }

  createInfoMarkers() {
    const markers = [];

    for (const [index, node] of this.props.markerNodes.entries()) {
      if (!node.visibility) {
        continue;
      }

      markers.push(
        <MarkerInfo
          key={node.name}
          identifier={node.name}
          position={node.screenSpacePos}
          size={node.size}
          showInfoIcon={node.showInfoIcon}
          infoText={node.infoText}
          showLabel={node.showLabel}
          offset={node.screenSpaceRadius}
        />,
      );
    }
    return markers;
  }

  // Determines size of the marker
  static determineSize(nodeRadius) {
    // Factor controlling size of a marker in
    // relation to screen space radius of a node
    const radiusFactor = 0.1;

    let size = nodeRadius * radiusFactor;
    const max_marker_size = 3;
    const min_marker_size = 1.5;

    if (size >= max_marker_size) { size = max_marker_size; }
    if (size <= min_marker_size) { size = min_marker_size; }

    return size;
  }

  // Returns info text for the node if it exists, otherwise warn
  static getInfoText(node, infoNodes) {
    if (infoNodes) { // else get infotext for the icon
      for (let i = 0; i < infoNodes.length; i++) {
        if (node === infoNodes[i].name) {
          return infoNodes[i].info;
        }
      }
      console.warn(`No info text available for ${node}`);
    }
    console.warn('No info file available for this story');
  }

  // Determines whether this marker is visible by checking possible
  // occlusion by all nodes that are currently visible on the screen
  static updateVisibility(markerNodes) {
    for (let index = 0; index < markerNodes.length; index++) {
      const node = markerNodes[index];

      if (!node.visibility) {
        continue;
      }
      const nodeCenterX = node.screenSpacePos[0];
      const nodeCenterY = node.screenSpacePos[1];
      const occlusionMarginFactor = 1.3;

      for (let compareIndex = 0; compareIndex < markerNodes.length; compareIndex++) {
        const compareNode = markerNodes[compareIndex];

        if (!compareNode.visibility || compareNode.name === node.name) {
          continue;
        }

        const compareNodeCenterX = compareNode.screenSpacePos[0];
        const compareNodeCenterY = compareNode.screenSpacePos[1];

        // check if this marker position is occluded by the comparing node
        const thisMarkerOutsideCircle = Markers.outsideCircle(
          compareNodeCenterX,
          compareNodeCenterY,
          compareNode.screenSpaceRadius * occlusionMarginFactor,
          nodeCenterX,
          nodeCenterY + node.screenSpaceRadius,
        );

        const compareIsInfront = (node.distanceFromCamera > compareNode.distanceFromCamera);

        if (!thisMarkerOutsideCircle && compareIsInfront) {
          node.visibility = false;
        }
      }
    }
  }

  render() {
    if (!this.props.trackingNodes) {
      return null;
    }

    return (
      <div className="Markers">
        {this.createInfoMarkers()}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  // Keeps track of the nodes we need to subscribe screen space data from
  let trackingNodes;
  // Keeps track of the markers we want to render
  const markerNodes = [];
  const infoIconNodes = state.storyTree.story.showinfoicons;
  const labelNodes = state.storyTree.story.showlabels;

  // terminate if there are no markers to track
  if (!labelNodes && !infoIconNodes) {
    return { trackingNodes };
  }

  // the nodes containing info that may or may not be shown
  const infoNodes = state.storyTree.info.infonodes;
  trackingNodes = [];

  if (labelNodes) {
    labelNodes.map((node) => {
      trackingNodes.push(node);
    });
  }

  if (infoIconNodes) {
    infoIconNodes.map((node) => {
      if (!trackingNodes.includes(node)) {
        trackingNodes.push(node);
      }
    });
  }

  trackingNodes.map((node) => {
    let infoText;
    let showInfoIcon = false;
    let showLabel = false;

    // show labels specified in the json file
    if (labelNodes) {
      for (let i = 0; i < labelNodes.length; i++) {
        if (node === labelNodes[i]) {
          showLabel = true;
        }
      }
    }

    // if show-icons are specified in the json file
    if (infoIconNodes) {
      for (let i = 0; i < infoIconNodes.length; i++) {
        if (node === infoIconNodes[i]) {
          showInfoIcon = true;
          infoText = Markers.getInfoText(node, infoNodes);
        }
      }
    }

    const markerProperties = {
      name: node,
      visibility: state.propertyTree.properties[`Scene.${node}.ScreenVisibility`].value,
      screenSpacePos: state.propertyTree.properties[`Scene.${node}.ScreenSpacePosition`].value,
      screenSpaceRadius: state.propertyTree.properties[`Scene.${node}.ScreenSizeRadius`].value,
      distanceFromCamera: state.propertyTree.properties[`Scene.${node}.DistanceFromCamToNode`].value,
      size: 0,
      infoText: infoText || 'No available info',
      showInfoIcon,
      showLabel,
    };

    markerNodes.push(markerProperties);
  });

  Markers.updateVisibility(markerNodes);

  markerNodes.map((markerNode) => {
    // if the marker is not occluded, calculate its size
    if (markerNode.visibility) {
      markerNode.size = Markers.determineSize(markerNode.screenSpaceRadius);
    }
  });

  return {
    markerNodes,
    trackingNodes,
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
  },
});

Markers = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Markers);

export default Markers;
