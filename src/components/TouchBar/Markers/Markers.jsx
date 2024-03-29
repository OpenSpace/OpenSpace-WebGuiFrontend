import React from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { setPropertyValue, subscribeToProperty, unsubscribeToProperty } from '../../../api/Actions/index';

import MarkerInfo from './MarkerInfo';

// Check if the point [x,y] is outside the circle with the center [centerX,centerY] and radius r
function outsideCircle(centerX, centerY, r, x, y) {
  const squareDist = ((x - centerX) ** 2) + ((y - centerY) ** 2);
  return (squareDist > r ** 2);
}

// Determines whether this marker is visible by checking possible
// occlusion by all nodes that are currently visible on the screen
function updateVisibility(markerNodes) {
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
      const thisMarkerOutsideCircle = outsideCircle(
        compareNodeCenterX,
        compareNodeCenterY,
        compareNode.screenSpaceRadius * occlusionMarginFactor,
        nodeCenterX,
        nodeCenterY + node.screenSpaceRadius
      );

      const compareIsInfront = (node.distanceFromCamera > compareNode.distanceFromCamera);

      if (!thisMarkerOutsideCircle && compareIsInfront) {
        node.visibility = false;
      }
    }
  }
}

// Determines size of the marker
function determineSize(nodeRadius) {
  // Factor controlling size of a marker in
  // relation to screen space radius of a node
  const radiusFactor = 0.1;

  let size = nodeRadius * radiusFactor;
  const MaxMarkerSize = 3;
  const MinMarkerSize = 1.5;

  if (size >= MaxMarkerSize) size = MaxMarkerSize;
  if (size <= MinMarkerSize) size = MinMarkerSize;

  return size;
}

// Returns info text for the node if it exists, otherwise warn
function getInfoText(node, infoNodes) {
  if (infoNodes) { // else get infotext for the icon
    for (let i = 0; i < infoNodes.length; i++) {
      if (node === infoNodes[i].name) {
        return infoNodes[i].info;
      }
    }
    console.warn(`No info text available for ${node}`);
  }
  console.warn('No info file available for this story');
  return 'No info available';
}

function Markers({ trackingNodes, markerNodes }) {
  const dispatch = useDispatch();

  function changePropertyValue(uri, value) {
    dispatch(setPropertyValue(uri, value));
  }

  React.useEffect(() => {
    trackingNodes.forEach((node) => {
      changePropertyValue(`Scene.${node}.ComputeScreenSpaceData`, true);
      dispatch(subscribeToProperty(`Scene.${node}.ScreenSpacePosition`));
      dispatch(subscribeToProperty(`Scene.${node}.ScreenSizeRadius`));
      dispatch(subscribeToProperty(`Scene.${node}.ScreenVisibility`));
      dispatch(subscribeToProperty(`Scene.${node}.DistanceFromCamToNode`));
    });
    return () => {
      trackingNodes.forEach((node) => {
        changePropertyValue(`Scene.${node}.ComputeScreenSpaceData`, false);
        dispatch(unsubscribeToProperty(`Scene.${node}.ScreenSpacePosition`));
        dispatch(unsubscribeToProperty(`Scene.${node}.ScreenSizeRadius`));
        dispatch(unsubscribeToProperty(`Scene.${node}.ScreenVisibility`));
        dispatch(unsubscribeToProperty(`Scene.${node}.DistanceFromCamToNode`));
      });
    };
  }, []);

  function createInfoMarkers() {
    const markers = [];
    Object.values(markerNodes).forEach((node) => {
      if (node.visibility) {
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
          />
        );
      }
    });
    return markers;
  }

  if (!trackingNodes) {
    return null;
  }

  return (
    <div className="Markers">
      {createInfoMarkers()}
    </div>
  );
}

const mapStateToProps = (state) => {
  // Keeps track of the nodes we need to subscribe screen space data from
  const trackingNodes = [];
  // Keeps track of the markers we want to render
  const markerNodesToRender = [];
  const infoIconNodes = state.storyTree.story.showinfoicons;
  const labelNodes = state.storyTree.story.showlabels;

  // terminate if there are no markers to track
  if (!labelNodes && !infoIconNodes) {
    return { trackingNodes };
  }

  // the nodes containing info that may or may not be shown
  const infoNodes = state.storyTree.info.infonodes;

  if (labelNodes) {
    labelNodes.forEach((node) => {
      trackingNodes.push(node);
    });
  }

  if (infoIconNodes) {
    infoIconNodes.forEach((node) => {
      if (!trackingNodes.includes(node)) {
        trackingNodes.push(node);
      }
    });
  }

  trackingNodes.forEach((node) => {
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
          infoText = getInfoText(node, infoNodes);
        }
      }
    }

    const markerProperties = {
      name: node,
      visibility: state.propertyTree.properties[`Scene.${node}.ScreenVisibility`].value,
      screenSpacePos: state.propertyTree.properties[`Scene.${node}.ScreenSpacePosition`].value,
      screenSpaceRadius: state.propertyTree.properties[`Scene.${node}.ScreenSizeRadius`].value,
      distanceFromCamera:
        state.propertyTree.properties[`Scene.${node}.DistanceFromCamToNode`].value,
      size: 0,
      infoText: infoText || 'No available info',
      showInfoIcon,
      showLabel
    };

    markerNodesToRender.push(markerProperties);
  });

  updateVisibility(markerNodesToRender);

  const markerNodesWithSize = markerNodesToRender.map((node) => {
    // if the marker is not occluded, calculate its size
    const updatedNode = node;
    if (node.visibility) {
      updatedNode.size = determineSize(node.screenSpaceRadius);
    }
    return updatedNode;
  });

  return {
    markerNodes: markerNodesWithSize,
    trackingNodes
  };
};

Markers.propTypes = {
  // Keeps track of the markers we want to render
  markerNodes: PropTypes.arrayOf(PropTypes.object),
  // Keeps track of the nodes we need to subscribe screen space data from
  trackingNodes: PropTypes.arrayOf(PropTypes.string)
};

Markers.defaultProps = {
  markerNodes: [],
  trackingNodes: []
};

export default connect(mapStateToProps)(Markers);
