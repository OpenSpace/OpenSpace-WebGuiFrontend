import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import shallowEqualArrays from 'shallow-equal/arrays';

import {
  setPropertyTreeExpansion
} from '../../../api/Actions';
import {
  displayName, getLayerGroupFromUri,
  getSceneGraphNodeFromUri,
  isDeadEnd,
  isGlobeBrowsingLayer,
  isPropertyVisible,
  isSceneGraphNode,
  nodeExpansionIdentifier
} from '../../../utils/propertyTreeHelpers';
import ToggleContent from '../../common/ToggleContent/ToggleContent';

import Property from './Property';
import PropertyOwnerHeader from './PropertyOwnerHeader';

// Render draggable and reorderable list with layers, using Beautinful DnD
// Based on video tutorial: https://www.youtube.com/watch?v=aYZRRyukuIw&ab_channel=ColbyFayock
function DragDropLayerList({ expansionIdentifier, uri }) {
  const luaApi = useSelector((state) => state.luaApi);
  const layers = useSelector((state) => {
    const data = state.propertyTree.propertyOwners[uri];
    const subownersRaw = data ? data.subowners : [];
    return subownersRaw.filter((subowner) => (isGlobeBrowsingLayer(subowner)));
  }, shallowEqualArrays);
  const [shownLayers, setShownLayers] = React.useState(layers);

  // When a layer is added, moved, or deleted in redux, update the state
  React.useEffect(() => {
    setShownLayers([...layers]);
  }, [layers]);

  if (!shownLayers || shownLayers.length === 0) {
    return null;
  }

  async function onDragEnd(result) {
    // No change - do nothing
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }

    // Get new layer order
    const tempLayers = shownLayers;
    const [reorderedItem] = tempLayers.splice(result.source.index, 1);
    tempLayers.splice(result.destination.index, 0, reorderedItem);

    setShownLayers(tempLayers);

    // Call the scripting for the engine
    const resultUri = result.draggableId;
    const globe = getSceneGraphNodeFromUri(resultUri);
    const layerGroup = getLayerGroupFromUri(resultUri);

    await luaApi.globebrowsing.moveLayer(
      globe,
      layerGroup,
      result.source.index,
      result.destination.index,
    );
  }

  function id(uriValue) {
    return `${expansionIdentifier}/${nodeExpansionIdentifier(uriValue)}`;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="layers">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {shownLayers.map((layerUri, index) => (
              <Draggable key={layerUri} draggableId={layerUri} index={index}>
                {(item) => ( // Draggable expects functions as children
                  <div {...item.draggableProps} ref={item.innerRef}>
                    <PropertyOwner
                      dragHandleTitleProps={item.dragHandleProps}
                      uri={layerUri}
                      expansionIdentifier={id(layerUri)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
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

function PropertyOwner({
  uri, name, dragHandleTitleProps, expansionIdentifier, trashAction, autoExpand
}) {
  const propertyOwnerName = useSelector((state) => {
    const { propertyOwners, properties } = state.propertyTree;
    return name || displayName(propertyOwners, properties, uri);
  });

  const subowners = useSelector((state) => {
    const { propertyOwners, properties } = state.propertyTree;
    const data = state.propertyTree.propertyOwners[uri];
    const subownersRaw = data ? data.subowners : [];
    const shownSubowners = subownersRaw.filter((subowner) => {
      const isOwnerDeadEnd = isDeadEnd(propertyOwners, properties, subowner);

      return !isOwnerDeadEnd && !isGlobeBrowsingLayer(subowner);
    });

    if (shouldSortAlphabetically(uri)) {
      return shownSubowners.slice(0).sort((a, b) => {
        const firstName = displayName(propertyOwners, properties, a);
        const secondName = displayName(propertyOwners, properties, b);

        return firstName.localeCompare(secondName, 'en');
      });
    }
    return shownSubowners;
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

  // @TODO (emmbr 2023-02-21) Make this work for other propety owners that have
  // descriptions too, such as geojson layers
  const isSceneGraphNodeOrLayer = isSceneGraphNode(uri) || isGlobeBrowsingLayer(uri);

  const dispatch = useDispatch();

  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: expansionIdentifier,
      expanded
    }));
  };

  function header() {
    const headerComponent = (
      <PropertyOwnerHeader
        uri={uri}
        expanded={isExpanded}
        title={propertyOwnerName}
        setExpanded={setExpanded}
        showMeta={isSceneGraphNodeOrLayer}
        showPopOutSettings={isRenderable}
        trashAction={trashAction}
      />
    );
    if (!dragHandleTitleProps) {
      return headerComponent;
    }
    return (
      <div {...dragHandleTitleProps}>
        {' '}
        {headerComponent}
      </div>
    );
  }

  return (
    <ToggleContent
      header={header()}
      expanded={isExpanded}
      setExpanded={setExpanded}
    >
      <DragDropLayerList
        expansionIdentifier={expansionIdentifier}
        uri={uri}
      />
      { subowners.map((ownerUri) => {
        const splitUri = ownerUri.split('.');
        const uriIsRenderable = splitUri.length > 0 && splitUri[splitUri.length - 1] === 'Renderable';
        return (
          <PropertyOwner
            key={ownerUri}
            uri={ownerUri}
            expansionIdentifier={`${expansionIdentifier}/${nodeExpansionIdentifier(ownerUri)}`}
            autoExpand={uriIsRenderable}
          />
        );
      })}
      { properties.map((propUri) => <Property key={propUri} uri={propUri} />) }
    </ToggleContent>
  );
}

PropertyOwner.propTypes = {
  autoExpand: PropTypes.bool,
  dragHandleTitleProps: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  expansionIdentifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  trashAction: PropTypes.func,
  uri: PropTypes.string.isRequired
};

PropertyOwner.defaultProps = {
  autoExpand: false,
  dragHandleTitleProps: false,
  name: null,
  trashAction: null
};

export default PropertyOwner;
export { displayName, nodeExpansionIdentifier };
