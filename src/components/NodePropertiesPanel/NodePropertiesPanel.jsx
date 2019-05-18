import React, { Component } from 'react';
import { connect } from 'react-redux';

import Popover from '../common/Popover/Popover';
import Picker from '../BottomBar/Picker';
import styles from './NodePropertiesPanel.scss';
import Button from '../common/Input/Button/Button';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Property from '../Sidebar/Properties/Property'
import PropertyOwner from '../Sidebar/Properties/PropertyOwner'

import { NavigationAnchorKey, ScenePrefixKey, RenderableTypes } from '../../api/keys';
import { setPopoverVisibility, removeNodeProperyPopover, setPopoverActiveTab} from '../../api/Actions';

class NodePropertiesPanel extends Component {

	constructor(props) {
    super(props);
    this.togglePopover = this.togglePopover.bind(this);
	}

  togglePopover() {
      if (this.props.isFocusNodePanel) {
        this.props.setPopoverVisibilityAction(!this.props.showPopover, 'focusNodePropertiesPanel')
      } else {
        this.props.removeNodeProperyPopoverAction(this.props.node)
      }
  }

  propertiesForRenderableType() {
    switch (this.props.renderableType) {
      case RenderableTypes.RenderableGlobe:
        return ["Enabled", "PerformShading", "LodScaleFactor"];
      case RenderableTypes.RenderableBillboardsCloud:
        return ["Enabled", "DrawElements", "RenderOption", "Opacity", "DrawLabels"];
      case RenderableTypes.RenderablePlaneImageLocal:
        return ["Enabled", "Opacity", "Billboard"];
      case RenderableTypes.RenderableStars:
        return ["Enabled", "ColorOption", "Transparency", "ScaleFactor"];
    }
  }

  propertyOwnerForUri(activeTab, uri) {
    return (
                <PropertyOwner  autoExpand={true}
                                key={activeTab}
                                uri={uri}
                                expansionIdentifier={"P:"+uri} />
              );
  }

  contentForTab(activeTab) {
    if (activeTab == 0) {

      let featuredProperties = this.propertiesForRenderableType();

      if (featuredProperties) {
        return featuredProperties.map(prop => <Property key={prop} uri={this.props.nodeURI + ".Renderable." + prop} />)
      } else {
        return (
              <PropertyOwner  autoExpand={true}
                              key={0}
                              uri={this.props.nodeURI + ".Renderable"}
                              expansionIdentifier={"P:"+this.props.nodeURI} />
        );        
      }

    }

    if (RenderableTypes[this.props.renderableType]) {
      switch (this.props.renderableType) {
        case RenderableTypes.RenderableGlobe:
          switch (activeTab) {
            case 1: {
              let uri = this.props.nodeURI + ".Renderable.Layers.ColorLayers"
              return this.propertyOwnerForUri(activeTab, uri);
            }
            case 2: {
              let uri = this.props.nodeURI + ".Renderable.Layers.HeightLayers"
              return this.propertyOwnerForUri(activeTab, uri);
            }
          }
      }      
    } else {
      //no tabs otherwise
      console.log("Not a known renderable type:", this.props.renderableType);
      return;
    }
  }

  buttonForTab(activeTab, index, title) {
    return (
      <Button block largetext={activeTab == index} smalltext={activeTab != index} key={index} onClick={() => this.props.setPopoverActiveTabAction(index)}>{title}</Button>
    )
  }

  tabsForRenderableType(activeTab) {
    if (RenderableTypes[this.props.renderableType]) {
      switch (this.props.renderableType) {
        case RenderableTypes.RenderableGlobe:
          return [this.buttonForTab(activeTab, 1,"Color Layers"), (this.buttonForTab(activeTab, 2, "Height Layers"))];
      }      
    } else {
      return [];
    }
  }

  get popover() {
    const { nodeURI, activeTab, isFocusNodePanel, attached, nodeName, renderableType, subowners} = this.props;
    const windowTitle = isFocusNodePanel ? "Current Focus: " + nodeName : nodeName;
    return (
      <Popover
        className={`${Picker.Popover} && ${styles.nodePopover}`}
        title={windowTitle}
        closeCallback={this.togglePopover}
        attached={attached}
        detachable
      >
        <div className={Popover.styles.title}>Type - {renderableType && renderableType.replace("Renderable", "")}</div>
        <div className={`${Popover.styles.content} ${styles.contentContainer}`}>
          {this.contentForTab(activeTab)}  
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          {this.buttonForTab(activeTab, 0, 'Properties')}
          {this.tabsForRenderableType(activeTab)}
        </div>
      </Popover>
     );
  }

  render() {
    const { nodeName, showPopover } = this.props;
    return (
      <div className={Picker.Wrapper} >
        { showPopover && this.popover }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {

  let aim = state.propertyTree.properties[NavigationAnchorKey] ? state.propertyTree.properties[NavigationAnchorKey].value : undefined;
  var nodeURI = ownProps.isFocusNodePanel ? ScenePrefixKey + aim : ownProps.uri;

  let myPopover = ownProps.isFocusNodePanel ? state.local.popovers.focusNodePropertiesPanel : state.local.popovers.activeNodePropertyPanels[ownProps.uri]
  var popoverVisible = myPopover ? myPopover.visible : false;
  const popoverAttached = myPopover ? myPopover.attached : false;
  const popoverActiveTab = myPopover ? myPopover.activeTab : 0;

  const node = state.propertyTree.propertyOwners[nodeURI] ? state.propertyTree.propertyOwners[nodeURI] : {};
  const nodeName = node.name;

  if (ownProps.isFocusNodePanel && !aim) {
    popoverVisible = false;
  }

  let renderableTypeProp = state.propertyTree.properties[nodeURI + ".Renderable.Type"];
  let renderableType = renderableTypeProp ? renderableTypeProp.value : undefined;

  if (!renderableType) {
    popoverVisible = false
  }

  return {
    nodeURI: nodeURI,
    nodeName: nodeName,
    renderableType: renderableType,
    activeTab: popoverActiveTab,
    showPopover: popoverVisible,
    attached: popoverAttached,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {

  const setPopoverVisibilityAction = (visible, uri) => {
    dispatch(setPopoverVisibility({
      popover: uri,
      visible
    }));
  };

  const removeNodeProperyPopoverAction = () => {
    dispatch(removeNodeProperyPopover({
      identifier: ownProps.uri
    }));
  };

  const setPopoverActiveTabAction = (index) => {
    dispatch(setPopoverActiveTab({
      identifier: ownProps.uri,
      activeTab: index,
      isFocusNodePanel: ownProps.isFocusNodePanel
    }));
  };

  return {
    setPopoverVisibilityAction,
    removeNodeProperyPopoverAction,
    setPopoverActiveTabAction
  };
}

NodePropertiesPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodePropertiesPanel);

export default NodePropertiesPanel;