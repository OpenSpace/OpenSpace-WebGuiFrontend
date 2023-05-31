import React from 'react';
import { useSelector } from 'react-redux';

import { NavigationAnchorKey, ScenePrefixKey } from '../../api/keys';

import NodePropertiesPanel from './NodePropertiesPanel';

function FocusNodePropertiesPanel() {
  const node = useSelector((state) => {
    const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
    return anchorProp ? ScenePrefixKey + anchorProp.value : '';
  });
  return (
    <NodePropertiesPanel uri={node} isFocusNodePanel />
  );
}

export default FocusNodePropertiesPanel;
