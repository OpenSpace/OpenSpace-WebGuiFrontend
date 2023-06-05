import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import shallowEqualArrays from 'shallow-equal/arrays';
import shallowEqualObjects from 'shallow-equal/objects';

import {
  addNodeMetaPopover,
  addNodePropertyPopover,
  reloadPropertyTree,
  setPropertyTreeExpansion
} from '../../../api/Actions';
import {
  displayName, getLayerGroupFromUri,
  getSceneGraphNodeFromUri,
  isDeadEnd,
  isGlobeBrowsingLayer,
  isPropertyOwnerHidden,
  isPropertyVisible,
  isSceneGraphNode,
  nodeExpansionIdentifier
} from '../../../utils/propertyTreeHelpers';
import ToggleContent from '../../common/ToggleContent/ToggleContent';

import Property from './Property';
import PropertyOwnerHeader from './PropertyOwnerHeader';

const shouldSortAlphabetically = (uri) => {
  const splitUri = uri.split('.');
  // The only case when property owners should not be sorted
  // alphabetically is when they are globe browsing layers.
  // Layer groups have the format *.Layers.[ColorLayers|HeightLayers|...]
  if (splitUri.length < 2) {
    return true;
  }
  return splitUri.indexOf('Layers') !== (splitUri.length - 2);
};

function PropertyOwner({ uri, name, dragHandleTitleProps, expansionIdentifier, trashAction, autoExpand }) {
  const luaApi = useSelector((state) => state.luaApi);
  const propertyOwnerName = useSelector((state) => {
    return name || displayName(state.propertyTree.propertyOwners, state.propertyTree.properties, uri);
  });
  const subownersRaw = useSelector((state) => {
    const data = state.propertyTree.propertyOwners[uri]; 
    return data ? data.subowners : [];
  }, shallowEqualArrays);
  const subowners = useSelector((state) => {
    return subownersRaw.filter((subowner) => {
      const isOwnerVisible = !isPropertyOwnerHidden(state.propertyTree.properties, subowner);
      const isOwnerDeadEnd = isDeadEnd(state.propertyTree.propertyOwners, state.propertyTree.properties, subowner);

      return isOwnerVisible && !isOwnerDeadEnd && !isGlobeBrowsingLayer(subowner);
    });
  }, shallowEqualArrays);
  const subownerNames = useSelector((state) => {
    let result = {};
    subowners.forEach((subowner) => {
      result[subowner] = displayName(state.propertyTree.propertyOwners, state.propertyTree.properties, subowner);
    });
    return result;
  }, shallowEqualArrays);
  const properties = useSelector((state) => {
    const data = state.propertyTree.propertyOwners[uri];
    const subProperties = data ? data.properties : [];

    // Find all the subproperties of this owner (do not include the enabled property)
    return subProperties.filter((prop) => isPropertyVisible(state.propertyTree.properties, prop));
  }, shallowEqualArrays);
  const isExpanded = useSelector((state) => {
    // Check if undefined - that means the property tree expansion has not
    // been initialized yet (no stored history of expanding)
    let result = state.local.propertyTreeExpansion[expansionIdentifier];
    if (result === undefined) {
      result = autoExpand || false;
    }
    return result;
  });
  const isRenderable = useSelector((state) => {
    const renderableTypeProp = state.propertyTree.properties[`${uri}.Renderable.Type`];
    return (renderableTypeProp !== undefined);
  });
  const isHidden = useSelector((state) => {
    const showHidden = state.propertyTree.properties['OpenSpaceEngine.ShowHiddenSceneGraphNodes'];
    return isPropertyOwnerHidden(state.propertyTree.properties, uri) && !showHidden.value;
  });
  // @TODO (emmbr 2023-02-21) Make this work for other propety owners that have
  // descriptions too, such as geojson layers
  const isSceneGraphNodeOrLayer = isSceneGraphNode(uri) || isGlobeBrowsingLayer(uri);
  const layers = subownersRaw.filter((subowner) => (isGlobeBrowsingLayer(subowner)));
  const shouldSort = shouldSortAlphabetically(uri);
  const isFocus = propertyOwnerName && (propertyOwnerName.lastIndexOf('Current') > -1);
  
  // Use refs so they don't trigger re-renders
  const shownLayers = React.useRef(layers);
  const isDragging = React.useRef(false); 

  const dispatch = useDispatch();
  console.log("render")
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: expansionIdentifier,
      expanded
    }));
  };
  const popOut = () => {
    dispatch(addNodePropertyPopover({
      identifier: uri,
      focus: isFocus
    }));
  };
  const metaAction = () => {
    dispatch(addNodeMetaPopover({
      identifier: uri
    }));
  };
  const refresh = () => {
    dispatch(reloadPropertyTree());
  };

  function header() {
    const popOutAction = isRenderable ? popOut : undefined;
    const hasMetaAction = isSceneGraphNodeOrLayer ? metaAction : undefined;

    const header = (
      <PropertyOwnerHeader
        uri={uri}
        expanded={isExpanded}
        title={propertyOwnerName}
        setExpanded={setExpanded}
        popOutAction={popOutAction}
        trashAction={trashAction}
        metaAction={hasMetaAction}
      />
    );
    if (!dragHandleTitleProps) {
      return header;
    }
    return (
      <div {...dragHandleTitleProps}>
        {' '}
        { header }
      </div>
    );
  }

  // Render draggable and reorderable list with layers, using Beautinful DnD
  // Based on video tutorial: https://www.youtube.com/watch?v=aYZRRyukuIw&ab_channel=ColbyFayock
  function renderLayersList() {
    if (!shownLayers.current || shownLayers.current.length === 0) {
      return null;
    }

    const onDragStart = () => {
      isDragging.current = true;
    };

    const onDragEnd = async (result) => {
      if (!result.destination || result.source.index === result.destination.index) {
        isDragging.current = false;
        return; // no change => do nothing
      }

      // First update the order manually, so we keep it while the properties
      // are being refreshed below
      const tempLayers = shownLayers.current;
      const [reorderedItem] = tempLayers.splice(result.source.index, 1);
      tempLayers.splice(result.destination.index, 0, reorderedItem);

      isDragging.current = false;
      shownLayers.current = tempLayers;

      const uri = result.draggableId;
      const globe = getSceneGraphNodeFromUri(uri);
      const layerGroup = getLayerGroupFromUri(uri);

      await luaApi.globebrowsing.moveLayer(
        globe,
        layerGroup,
        result.source.index,
        result.destination.index,
      );

      // TODO: Once we have a proper way to subscribe to reordering, additions and removals
      // of property owners, this 'hard' refresh should be removed
      refresh();
    };

    // Invisible overlay that covers the entire body and prevents other hover effects
    // from being triggered while dragging
    const overlay = (
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100
      }}
      />
    );
    const id = (uri) => `${expansionIdentifier}/${nodeExpansionIdentifier(uri)}`;

    return (
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        { isDragging.current && overlay }
        <Droppable droppableId="layers">
          { (provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              { shownLayers.current.map((uri, index) => (
                <Draggable key={uri} draggableId={uri} index={index}>
                  {(item) => ( // Draggable expects functions as children
                    <div {...item.draggableProps} ref={item.innerRef}>
                      <PropertyOwner
                        dragHandleTitleProps={item.dragHandleProps}
                        uri={uri}
                        expansionIdentifier={id(uri)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              { provided.placeholder }
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  const sortedSubowners = shouldSort ?
    (subowners.slice(0).sort((a, b) => subownerNames[a].localeCompare(subownerNames[b], 'en'))) :
    subowners;

  return !isHidden && (
    <ToggleContent
      header={header()}
      expanded={isExpanded}
      setExpanded={setExpanded}
    >
      { renderLayersList() }
      { sortedSubowners.map((uri) => {
        const splitUri = uri.split('.');
        const uriIsRenderable = splitUri.length > 0 && splitUri[splitUri.length - 1] === 'Renderable';
        return (
          <PropertyOwner
            key={uri}
            uri={uri}
            expansionIdentifier={`${expansionIdentifier}/${nodeExpansionIdentifier(uri)}`}
            autoExpand={uriIsRenderable}
          />
        );
      })}
      { properties.map((uri) => <Property key={uri} uri={uri} />) }
    </ToggleContent>
  );
}

PropertyOwner.propTypes = {
  autoExpand: PropTypes.bool,
  dragHandleTitleProps: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  expansionIdentifier: PropTypes.string,
  name: PropTypes.string,
  trashAction: PropTypes.func,
  uri: PropTypes.string.isRequired
};

PropertyOwner.defaultProps = {
  autoExpand: false,
  dragHandleTitleProps: false,
  properties: [],
  subowners: []
};

export default PropertyOwner;
export { displayName, nodeExpansionIdentifier };
