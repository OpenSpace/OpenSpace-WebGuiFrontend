import React from 'react';
import { connect } from 'react-redux';

import { removeNodePropertyPopover, setPopoverActiveTab, setPopoverVisibility } from '../../api/Actions';
import { NavigationAnchorKey, RenderableTypes, ScenePrefixKey } from '../../api/keys';
import Picker from '../BottomBar/Picker';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Property from '../Sidebar/Properties/Property';
import PropertyOwner from '../Sidebar/Properties/PropertyOwner';

import styles from './NodePropertiesPanel.scss';

function NodePropertiesPanel({
  isFocusNodePanel, showPopover, node, renderableType, setPopoverVisibilityAction,
  removeNodePropertyPopoverAction, nodeURI, renderableProps, setPopoverActiveTabAction,
  activeTab, attached, nodeName
}) {
  const isDefined = RenderableTypes[renderableType];
  const isGlobe = isDefined && renderableType === RenderableTypes.RenderableGlobe;

  function togglePopover() {
    if (isFocusNodePanel) {
      setPopoverVisibilityAction(!showPopover, 'focusNodePropertiesPanel');
    } else {
      removeNodePropertyPopoverAction(node);
    }
  }

  function propertiesForRenderableType() {
    switch (renderableType) {
    case RenderableTypes.RenderableGlobe:
      return ['Enabled', 'PerformShading', 'TargetLodScaleFactor'];
    case RenderableTypes.RenderableBillboardsCloud:
      return ['Enabled', 'DrawElements', 'RenderOption', 'Opacity', 'DrawLabels'];
    case RenderableTypes.RenderablePlaneImageLocal:
      return ['Enabled', 'Opacity', 'Billboard'];
    case RenderableTypes.RenderableStars:
      return ['Enabled', 'ColorOption', 'Transparency', 'ScaleFactor'];
    default:
      return null;
    }
  }

  function propertyOwnerForUri(uri) {
    return (
      <PropertyOwner
        autoExpand
        key={activeTab}
        uri={uri}
        expansionIdentifier={`P:${uri}`}
      />
    );
  }

  function contentForTab() {
    if (activeTab === 0) {
      const featuredProperties = propertiesForRenderableType();
      if (featuredProperties) {
        return featuredProperties.map((prop) => {
          const propUri = `${nodeURI}.Renderable.${prop}`;
          if (renderableProps.includes(propUri)) {
            return <Property key={prop} uri={propUri} />;
          }
          return null;
        });
      }

      return (
        <PropertyOwner
          autoExpand
          key={0}
          uri={`${nodeURI}.Renderable`}
          expansionIdentifier={`P:${nodeURI}`}
        />
      );
    }

    if (isGlobe) {
      switch (activeTab) {
      case 1: {
        const uri = `${nodeURI}.Renderable.Layers.ColorLayers`;
        return propertyOwnerForUri(uri);
      }
      case 2: {
        const uri = `${nodeURI}.Renderable.Layers.HeightLayers`;
        return propertyOwnerForUri(uri);
      }
      default: {
        return null;
      }
      }
    }
    return null;
  }

  function buttonForTab(index, title) {
    return (
      <Button
        block
        largetext={activeTab === index}
        smalltext={activeTab !== index}
        key={index}
        onClick={() => setPopoverActiveTabAction(index)}
      >
        {title}
      </Button>
    );
  }

  function tabsForRenderableType() {
    if (isGlobe) {
      return [buttonForTab(1, 'Color Layers'), (buttonForTab(2, 'Height Layers'))];
    }
    return null;
  }

  function popover() {
    const windowTitle = isFocusNodePanel ? `Current Focus: ${nodeName}` : nodeName;
    return (
      <Popover
        className={`${Picker.Popover} && ${styles.nodePopover}`}
        title={windowTitle}
        closeCallback={togglePopover}
        attached={attached}
        detachable
      >
        <div className={Popover.styles.title}>
          Type -
          {renderableType && renderableType.replace('Renderable', '')}
        </div>
        <div className={`${Popover.styles.content} ${styles.contentContainer}`}>
          { contentForTab() }
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          { buttonForTab(0, 'Properties') }
          { tabsForRenderableType() }
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      { showPopover && popover() }
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  const aim = state.propertyTree.properties[NavigationAnchorKey] ?
    state.propertyTree.properties[NavigationAnchorKey].value :
    undefined;

  const nodeURI = ownProps.isFocusNodePanel ? ScenePrefixKey + aim : ownProps.uri;

  const myPopover = ownProps.isFocusNodePanel ?
    state.local.popovers.focusNodePropertiesPanel :
    state.local.popovers.activeNodePropertyPanels[ownProps.uri];

  let popoverVisible = myPopover ? myPopover.visible : false;
  const popoverAttached = myPopover ? myPopover.attached : false;
  const popoverActiveTab = myPopover && myPopover.activeTab ? myPopover.activeTab : 0;

  const node = state.propertyTree.propertyOwners[nodeURI] ?? {};
  const nodeName = node.name;

  const renderableProps = state.propertyTree.propertyOwners[`${nodeURI}.Renderable`] ?
    state.propertyTree.propertyOwners[`${nodeURI}.Renderable`].properties :
    null;

  if (ownProps.isFocusNodePanel && !aim) {
    popoverVisible = false;
  }

  const renderableTypeProp = state.propertyTree.properties[`${nodeURI}.Renderable.Type`];
  const renderableType = renderableTypeProp ? renderableTypeProp.value : undefined;

  if (!renderableType) {
    popoverVisible = false;
  }

  return {
    nodeURI,
    nodeName,
    renderableType,
    activeTab: popoverActiveTab,
    showPopover: popoverVisible,
    attached: popoverAttached,
    renderableProps
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const setPopoverVisibilityAction = (visible, uri) => {
    dispatch(setPopoverVisibility({
      popover: uri,
      visible
    }));
  };

  const removeNodePropertyPopoverAction = () => {
    dispatch(removeNodePropertyPopover({
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
    removeNodePropertyPopoverAction,
    setPopoverActiveTabAction
  };
};

NodePropertiesPanel = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodePropertiesPanel);

export default NodePropertiesPanel;
