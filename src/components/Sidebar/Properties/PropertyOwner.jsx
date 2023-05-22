import React, { Component } from 'react';
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

class PropertyOwnerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shownLayers: props.layers,
      isDragging: false
    };

    this.renderLayersList = this.renderLayersList.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.isDragging !== nextState.isDragging) {
      return true;
    }
    return !(
      this.props.uri === nextProps.uri &&
      this.props.name === nextProps.name &&
      shallowEqualArrays(this.props.layers, nextProps.layers) &&
      shallowEqualArrays(this.props.properties, nextProps.properties) &&
      shallowEqualArrays(this.props.subowners, nextProps.subowners) &&
      shallowEqualObjects(this.props.subownerNames, nextProps.subownerNames) &&
      this.props.isExpanded === nextProps.isExpanded &&
      this.props.setExpanded === nextProps.setExpanded &&
      this.props.autoExpand === nextProps.autoExpand &&
      this.props.expansionIdentifier === nextProps.expansionIdentifier &&
      this.props.shouldSort === nextProps.shouldSort);
  }

  componentDidUpdate(prevProps) {
    // Update state value variable when we get new props
    if (prevProps.layers !== this.props.layers) {
      this.setState({ shownLayers: this.props.layers });
    }
  }

  get header() {
    const {
      uri, name, isExpanded, setExpanded, popOut, metaAction, trashAction,
      isRenderable, isSceneGraphNodeOrLayer, dragHandleTitleProps
    } = this.props;

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
  renderLayersList() {
    const { expansionIdentifier } = this.props;
    const { shownLayers } = this.state;

    if (!shownLayers || shownLayers.length === 0) {
      return null;
    }

    const onDragStart = () => {
      this.setState({ isDragging: true });
    };

    const onDragEnd = async (result) => {
      if (!result.destination || result.source.index === result.destination.index) {
        this.setState({ isDragging: false });
        return; // no change => do nothing
      }

      // First update the order manually, so we keep it while the properties
      // are being refreshed below
      const tempLayers = shownLayers;
      const [reorderedItem] = tempLayers.splice(result.source.index, 1);
      tempLayers.splice(result.destination.index, 0, reorderedItem);

      this.setState({ isDragging: false, shownLayers: tempLayers });

      const uri = result.draggableId;
      const globe = getSceneGraphNodeFromUri(uri);
      const layerGroup = getLayerGroupFromUri(uri);

      await this.props.luaApi.globebrowsing.moveLayer(
        globe,
        layerGroup,
        result.source.index,
        result.destination.index,
      );

      // TODO: Once we have a proper way to subscribe to reordering, additions and removals
      // of property owners, this 'hard' refresh should be removed
      this.props.refresh();
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
        { this.state.isDragging && overlay }
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
                        autoExpand={false}
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

  render() {
    const {
      properties,
      subowners,
      subownerNames,
      isExpanded,
      setExpanded,
      expansionIdentifier,
      shouldSort,
      isHidden
    } = this.props;

    const sortedSubowners = shouldSort ?
      (subowners.slice(0).sort((a, b) => subownerNames[a].localeCompare(subownerNames[b], 'en'))) :
      subowners;

    return !isHidden && (
      <ToggleContent
        header={this.header}
        expanded={isExpanded}
        setExpanded={setExpanded}
      >
        { this.renderLayersList() }
        { sortedSubowners.map((uri) => {
          let autoExpand = sortedSubowners.length + properties.length === 1 ? true : undefined;
          const splitUri = uri.split('.');
          if (splitUri.length > 0 && splitUri[splitUri.length - 1] === 'Renderable') {
            autoExpand = true;
          }
          return (
            <PropertyOwner
              key={uri}
              uri={uri}
              expansionIdentifier={`${expansionIdentifier}/${nodeExpansionIdentifier(uri)}`}
              autoExpand={autoExpand}
            />
          );
        })}
        { properties.map((uri) => <Property key={uri} uri={uri} />) }
      </ToggleContent>
    );
  }
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
