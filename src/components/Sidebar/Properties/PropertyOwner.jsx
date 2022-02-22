import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import shallowEqualArrays from 'shallow-equal/arrays';
import shallowEqualObjects from 'shallow-equal/objects';
import { 
  addNodeMetaPopover,
  addNodePropertyPopover,
  reloadPropertyTree,
  setPropertyTreeExpansion
} from '../../../api/Actions';
import subStateToProps from '../../../utils/subStateToProps';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import { 
  getLayerGroupFromUri,
  getSceneGraphNodeFromUri,
  isDeadEnd,
  isGlobeBrowsingLayer,
  isPropertyOwnerHidden,
  isPropertyVisible,
  isSceneGraphNode
} from './../../../utils/propertyTreeHelpers';
import Property from './Property';
import PropertyOwnerHeader from './PropertyOwnerHeader';


/**
 * Return an identifier for the tree expansion state.
 */
const nodeExpansionIdentifier = uri => {
  const splitUri = uri.split('.');
  if (splitUri.length > 1) {
    return 'O:' + splitUri[splitUri.length - 1];
  } else {
    return '';
  }
}

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
      this.props.sort === nextProps.sort);
  }

  componentDidUpdate(prevProps, prevState) {
    // Update state value variable when we get new props
    if (prevProps.layers !== this.props.layers) {
      this.setState({ shownLayers: this.props.layers });
    }
  }

  // Render draggable and reorderable list with layers, using Beautinful DnD
  // Based on video tutorial: https://www.youtube.com/watch?v=aYZRRyukuIw&ab_channel=ColbyFayock
  renderLayersList() {
    const { expansionIdentifier } = this.props;
    const { shownLayers } = this.state;

    if (!shownLayers || shownLayers.length === 0) {
      return <></>;
    }

    const onDragStart = () => {
      this.setState({isDragging: true});
    }

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
        result.destination.index
      );

      // TODO: Once we have a proper way to subscribe to reordering, additions and removals
      // of property owners, this 'hard' refresh should be removed
      this.props.refresh();
    }

    // Invisible overlay that covers the entire body and prevents other hover effects
    // from being triggered while dragging
    const overlay = <div style ={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, zIndex: 100}}></div>;

    return (
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        { this.state.isDragging && overlay }
        <Droppable droppableId="layers">
          { (provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              { shownLayers.map((uri, index) => {
                return (
                  <Draggable key={uri} draggableId={uri} index={index}>
                    {(provided) => {
                      return <div {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                        <PropertyOwner
                          uri={uri}
                          expansionIdentifier={expansionIdentifier + '/' + nodeExpansionIdentifier(uri)}
                          autoExpand={false}
                        />
                      </div>
                    }}
                  </Draggable>
                );
              })}
            { provided.placeholder }
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  }

  render() {
    const {
      uri,
      name,
      properties,
      subowners,
      subownerNames,
      isExpanded,
      setExpanded,
      expansionIdentifier,
      sort,
      popOut,
      metaAction,
      trashAction,
      isRenderable,
      isSceneGraphNodeOrLayer
    } = this.props;

    const sortedSubowners =
      sort ?
        (subowners.slice(0).sort((a, b) => subownerNames[a].localeCompare(subownerNames[b], 'en'))) :
        subowners;

    const popOutAction = isRenderable ? popOut : undefined;
    const hasMetaAction = isSceneGraphNodeOrLayer ? metaAction : undefined;

    const header = <PropertyOwnerHeader uri={uri}
                                        expanded={isExpanded}
                                        title={name}
                                        setExpanded={setExpanded}
                                        popOutAction={popOutAction}
                                        trashAction={trashAction}
                                        metaAction={hasMetaAction} />

    return <ToggleContent
      header={header}
      expanded={isExpanded}
      setExpanded={setExpanded}
    >
      { 
        this.renderLayersList()
      }
      {
        sortedSubowners.map(uri => {
          let autoExpand = sortedSubowners.length + properties.length === 1 ? true : undefined;
          const splitUri = uri.split('.');
          if (splitUri.length > 0 && splitUri[splitUri.length - 1] === "Renderable") {
            autoExpand = true;
          }
          return <PropertyOwner key={uri}
                       uri={uri}
                       expansionIdentifier={expansionIdentifier + '/' + nodeExpansionIdentifier(uri)}
                       autoExpand={autoExpand}/>;
        })
      }
      {
        properties.map(uri => <Property key={uri} uri={uri} />)
      }
    </ToggleContent>
  };
}

const shouldSortAlphabetically = uri => {
  const splitUri = uri.split('.');
  // The only case when property owners should not be sorted
  // alphabetically is when they are globe browsing layers.
  // Layer groups have the format *.Layers.[ColorLayers|HeightLayers|...]
  if (splitUri.length < 2) {
    return true;
  }
  return splitUri.indexOf('Layers') !== (splitUri.length - 2);
}

const displayName = (propertyOwners, properties, uri) => {
  var property = properties[uri + ".GuiName"];
  if (!property && isGlobeBrowsingLayer(uri) && propertyOwners[uri] && propertyOwners[uri].name) {
    property = {value: propertyOwners[uri].name};
  }

  return property ? property.value : propertyOwners[uri].identifier;
}

const mapSubStateToProps = (
  { luaApi, propertyOwners, properties, propertyTreeExpansion },
  { uri, name, autoExpand, expansionIdentifier }
) => {
  const data = propertyOwners[uri];
  let subowners = data ? data.subowners : [];
  let subProperties = data ? data.properties : [];

  let layers = subowners.filter(uri => (isGlobeBrowsingLayer(uri)));
  subowners = subowners.filter(uri => (
    !isPropertyOwnerHidden(properties, uri) && !isDeadEnd(propertyOwners, properties, uri) && !isGlobeBrowsingLayer(uri)
  ));

  const subownerNames = {};
  subowners.forEach(uri => {
    subownerNames[uri] = displayName(propertyOwners, properties, uri)
  });
  subProperties = subProperties.filter(uri => isPropertyVisible(properties, uri));

  const sort = shouldSortAlphabetically(uri);

  name = name || displayName(propertyOwners, properties, uri);
  let isExpanded = propertyTreeExpansion[expansionIdentifier];
  if (isExpanded === undefined) {
    isExpanded = autoExpand || false;
  }

  let renderableTypeProp = properties[uri + ".Renderable.Type"];
  var property = properties[uri + ".GuiName"];
  var showMeta = false;
  if ((isSceneGraphNode(uri) || isGlobeBrowsingLayer(uri))) {
    showMeta = true;
  }

  return {
    name,
    layers,
    luaApi,
    subowners,
    subownerNames,
    properties: subProperties,
    isExpanded,
    sort,
    isRenderable: (renderableTypeProp != undefined),
    isSceneGraphNodeOrLayer: showMeta
  };
}

const mapStateToSubState = state => ({
  luaApi: state.luaApi,
  propertyOwners: state.propertyTree.propertyOwners,
  properties: state.propertyTree.properties,
  propertyTreeExpansion: state.local.propertyTreeExpansion
})

const mapDispatchToProps = (dispatch, ownProps) => {
  const setExpanded = (expanded) => {
    dispatch(setPropertyTreeExpansion({
      identifier: ownProps.expansionIdentifier,
      expanded
    }));
  }

  const isFocus = ownProps.name && (ownProps.name.lastIndexOf('Current') > -1);
  const popOut = () => {
    dispatch(addNodePropertyPopover({
      identifier: ownProps.uri,
      focus: isFocus
    }));
  };

  const metaAction = () => {
    dispatch(addNodeMetaPopover({
      identifier: ownProps.uri,
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
}

const PropertyOwner = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(PropertyOwnerComponent);


PropertyOwner.propTypes = {
  uri: PropTypes.string.isRequired,
  autoExpand: PropTypes.bool
};

PropertyOwner.defaultProps = {
  properties: [],
  subowners: []
};

export default PropertyOwner;
export { displayName, nodeExpansionIdentifier };

