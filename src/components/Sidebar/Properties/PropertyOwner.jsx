import React from 'react';
import { connect } from 'react-redux';
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
import subStateToProps from '../../../utils/subStateToProps';
import ToggleContent from '../../common/ToggleContent/ToggleContent';

import Property from './Property';
import PropertyOwnerHeader from './PropertyOwnerHeader';

function PropertyOwnerComponent({ uri, name, isExpanded, setExpanded, popOut, metaAction, trashAction,
  isRenderable, isSceneGraphNodeOrLayer, dragHandleTitleProps, layers, expansionIdentifier, shouldSort,
  subowners, subownerNames, isHidden, properties, luaApi, refresh
}) {
  const [shownLayers, setShownLayers] = React.useState(layers);
  const isDragging = React.useRef(false); // Use a ref so that it doesn't trigger a re-render

  React.useEffect(() => {
    setShownLayers(layers);
  }, [layers]);

  function header() {
    const popOutAction = isRenderable ? popOut : undefined;
    const hasMetaAction = isSceneGraphNodeOrLayer ? metaAction : undefined;

    const header = (
      <PropertyOwnerHeader
        uri={uri}
        expanded={isExpanded}
        title={name}
        setExpanded={setExpanded}
        popOutAction={popOutAction}
        trashAction={trashAction}
        metaAction={hasMetaAction}
      />
    );

    if (dragHandleTitleProps) {
      return (
        <div {...dragHandleTitleProps}>
          {' '}
          { header }
        </div>
      );
    }
    return header;
  }

  // Render draggable and reorderable list with layers, using Beautinful DnD
  // Based on video tutorial: https://www.youtube.com/watch?v=aYZRRyukuIw&ab_channel=ColbyFayock
  function renderLayersList() {
    if (!shownLayers || shownLayers.length === 0) {
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
      const tempLayers = shownLayers;
      const [reorderedItem] = tempLayers.splice(result.source.index, 1);
      tempLayers.splice(result.destination.index, 0, reorderedItem);

      isDragging.current = false;
      setShownLayers(tempLayers);

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
              { shownLayers.map((uri, index) => (
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

const mapSubStateToProps = (
  {
    luaApi, propertyOwners, properties, propertyTreeExpansion
  },
  {
    uri, name, autoExpand, expansionIdentifier
  },
) => {
  const data = propertyOwners[uri];
  const showHidden = properties['OpenSpaceEngine.ShowHiddenSceneGraphNodes'];
  const isHidden = isPropertyOwnerHidden(properties, uri) && !showHidden.value;
  let subowners = data ? data.subowners : [];
  let subProperties = data ? data.properties : [];

  const layers = subowners.filter((subowner) => (isGlobeBrowsingLayer(subowner)));
  subowners = subowners.filter((subowner) => {
    const isOwnerVisible = !isPropertyOwnerHidden(properties, subowner);
    const isOwnerDeadEnd = isDeadEnd(propertyOwners, properties, subowner);

    return isOwnerVisible && !isOwnerDeadEnd && !isGlobeBrowsingLayer(subowner);
  });

  const subownerNames = {};
  subowners.forEach((subowner) => {
    subownerNames[subowner] = displayName(propertyOwners, properties, subowner);
  });

  // Find all the subproperties of this owner (do not include the enabled property)
  subProperties = subProperties.filter((prop) => isPropertyVisible(properties, prop));

  const shouldSort = shouldSortAlphabetically(uri);
  const nameResult = name || displayName(propertyOwners, properties, uri);

  // Check if undefined - that means the property tree expansion has not
  // been initialized yet (no stored history of expanding)
  let isExpanded = propertyTreeExpansion[expansionIdentifier];
  if (isExpanded === undefined) {
    isExpanded = autoExpand || false;
  }

  const renderableTypeProp = properties[`${uri}.Renderable.Type`];
  const isRenderable = (renderableTypeProp !== undefined);

  // @TODO (emmbr 2023-02-21) Make this work for other propety owners that have
  // descriptions too, such as geojson layers
  const showMeta = (isSceneGraphNode(uri) || isGlobeBrowsingLayer(uri));

  return {
    name: nameResult,
    layers,
    luaApi,
    subowners,
    subownerNames,
    properties: subProperties,
    isExpanded,
    shouldSort,
    isRenderable,
    isSceneGraphNodeOrLayer: showMeta,
    isHidden
  };
};

const mapStateToSubState = (state) => ({
  luaApi: state.luaApi,
  propertyOwners: state.propertyTree.propertyOwners,
  properties: state.propertyTree.properties,
  propertyTreeExpansion: state.local.propertyTreeExpansion
});

const mapDispatchToProps = (dispatch, ownProps) => {
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: ownProps.expansionIdentifier,
      expanded
    }));
  };

  const isFocus = ownProps.name && (ownProps.name.lastIndexOf('Current') > -1);
  const popOut = () => {
    dispatch(addNodePropertyPopover({
      identifier: ownProps.uri,
      focus: isFocus
    }));
  };

  const metaAction = () => {
    dispatch(addNodeMetaPopover({
      identifier: ownProps.uri
    }));
  };

  const refresh = () => {
    dispatch(reloadPropertyTree());
  };

  return {
    setExpanded,
    popOut,
    metaAction,
    refresh
  };
};

const PropertyOwner = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(PropertyOwnerComponent);

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
