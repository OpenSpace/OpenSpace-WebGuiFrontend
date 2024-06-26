import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { removeNodePropertyPopover, setPopoverActiveTab } from '../../api/Actions';
import { RenderableTypes } from '../../api/keys';
import Picker from '../BottomBar/Picker';
import HorizontalDelimiter from '../common/HorizontalDelimiter/HorizontalDelimiter';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Property from '../Sidebar/Properties/Property';
import PropertyOwner from '../Sidebar/Properties/PropertyOwner';

import styles from './NodePropertiesPanel.scss';

function NodePropertiesPanel({ uri }) {
  const nodeURI = uri;

  const nodeName = useSelector((state) => (
    state.propertyTree.propertyOwners[nodeURI]?.name
  ));

  // Renderable type and info
  const renderableType = useSelector((state) => (
    state.propertyTree.properties[`${nodeURI}.Renderable.Type`]?.value
  ));

  const renderableProps = useSelector((state) => (
    state.propertyTree.propertyOwners[`${nodeURI}.Renderable`]?.properties
  ));

  const isDefined = RenderableTypes[renderableType];
  const isGlobe = isDefined && renderableType === RenderableTypes.RenderableGlobe;

  // Popover visiblity
  const myPopover = useSelector((state) => (
    state.local.popovers.activeNodePropertyPanels[uri]
  ));
  let showPopover = myPopover?.visible || false;
  if (!renderableType) {
    showPopover = false;
  }
  const attached = myPopover?.attached || false;
  const activeTab = myPopover?.activeTab || 0;

  const dispatch = useDispatch();

  function togglePopover() {
    dispatch(removeNodePropertyPopover({
      identifier: uri
    }));
  }

  function setPopoverActiveTabAction(index) {
    dispatch(setPopoverActiveTab({
      identifier: uri,
      activeTab: index
    }));
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

  function propertyOwnerForUri(ownerUri) {
    return (
      <PropertyOwner
        autoExpand
        key={activeTab}
        uri={ownerUri}
        expansionIdentifier={`P:${ownerUri}`}
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
          const layerUri = `${nodeURI}.Renderable.Layers.ColorLayers`;
          return propertyOwnerForUri(layerUri);
        }
        case 2: {
          const layerUri = `${nodeURI}.Renderable.Layers.HeightLayers`;
          return propertyOwnerForUri(layerUri);
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
    return (
      <Popover
        className={`${Picker.Popover} && ${styles.nodePopover}`}
        title={nodeName}
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
        <HorizontalDelimiter />

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

NodePropertiesPanel.propTypes = {
  uri: PropTypes.string.isRequired
};

NodePropertiesPanel.defaultProps = {};

export default NodePropertiesPanel;
