import React from 'react';
import {
  MdAdd, MdClose, MdDelete, MdFilterCenterFocus, MdSettings, MdVisibility, MdZoomIn, MdZoomOut
} from 'react-icons/md';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import { useSubscribeToProperty } from '../../../utils/customHooks';
import propertyDispatcher from '../../../api/propertyDispatcher';

import { stopEventPropagation } from '../../../utils/helpers';
import Button from '../../common/Input/Button/Button';

import SkyBrowserTooltip from './SkyBrowserTooltip';

import styles from './SkyBrowserTabs.scss';

function SettingsButton({
  onClick, Icon, text, canBeSelected = false
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [isSelected, setIsSelected] = React.useState(false);
  const infoButton = React.useRef(null);

  function positionInfo() {
    if (!infoButton) {
      return { top: '0px', left: '0px' };
    }
    const { top, right } = infoButton.current.getBoundingClientRect();
    return { top: `${top}`, left: `${right}` };
  }

  function handleClick() {
    onClick();
    if (canBeSelected) {
      setIsSelected(oldValue => !oldValue);
    }
  }

  return (
    <Button
    onClick={handleClick}
    onMouseOver={() => setShowTooltip(true)}
    onMouseOut={() => setShowTooltip(false)}
    className={isSelected ? styles.tabButtonActive : styles.tabButtonInactive}
    transparent
    small
    ref={infoButton}
  >
    <Icon
      className="medium"
    />
    {showTooltip && (
      <SkyBrowserTooltip placement="bottom-right" style={positionInfo()}>
        {text}
      </SkyBrowserTooltip>
    )}
  </Button>
  );
}

function SkyBrowserTabs({
  height,
  maxHeight,
  minHeight,
  setCurrentTabHeight,
  setShowSettings,
  children
}) {
  // Redux store access - selectors and dispatch
  const selectedPairId = useSubscribeToProperty("Modules.SkyBrowser.SelectedPairId");
  const selectedBrowserId = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Browser`);
  const fov = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.VerticalFov`);
  const borderColor = useSubscribeToProperty(`Modules.SkyBrowser.${selectedPairId}.Color`)?.map(x => x * 255);
  const allPairs = useSubscribeToProperty(`Modules.SkyBrowser.AllPairs`);

  const luaApi = useSelector((state) => state.luaApi);

  // Refs to get info from DOM
  const tabsDiv = React.useRef(null);

  const dispatch = useDispatch();

  // Update tab height when the div is changed
  React.useEffect(() => {
    if (tabsDiv.current) {
      const newHeight = tabsDiv.current.clientHeight;
      setCurrentTabHeight(newHeight);
    }
  }, [tabsDiv.current]);

  function removeAllSelectedImages() {
    propertyDispatcher(dispatch, `ScreenSpace.${selectedBrowserId}.SelectedImagesUrls`).set([]);
    propertyDispatcher(dispatch, `ScreenSpace.${selectedBrowserId}.SelectedImagesOpacities`).set([]);
  }

  function createTabs() {
    const allTabs = allPairs.map((id, index) => {
      const browserColor = `rgb(${borderColor})`;
      const isActive = selectedPairId === id;
      return (
        <div
          key={id}
          style={isActive ? { borderTopRightRadius: '4px', borderTop: `3px solid ${browserColor}` } : {}}
        >
          <div
            className={isActive ? styles.tabActive : styles.tabInactive}
            onMouseDown={(e) => {
              const event = e ?? window.event;
              event.cancelBubble = true;
              e?.stopPropagation();
              if (!isActive) {
                propertyDispatcher(dispatch, "Modules.SkyBrowser.SelectedPairId").set(id);
              }
            }}
            role="button"
            tabIndex={index}
          >
            <span className={styles.tabHeader}>
              <span className={styles.tabTitle}>{id}</span>
              <Button
                onClick={(e) => {
                  stopEventPropagation(e);
                  luaApi.skybrowser.removeTargetBrowserPair(id);
                }}
                className={styles.closeTabButton}
                transparent
                small
              >
                <MdClose className="small" />
              </Button>
            </span>
            {isActive && (
              <span
              className={styles.tabButtonContainer}
            >
              <SettingsButton
                Icon={MdVisibility}
                text={`Look at browser`}
                onClick={() => luaApi.skybrowser.adjustCamera(selectedPairId)}
              />
              <SettingsButton
                Icon={MdFilterCenterFocus}
                text={'Move target to center of view'}
                onClick={() => {
                  propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.StopAnimations`).set(null);
                  luaApi.skybrowser.centerTargetOnScreen(selectedPairId);
                }}
              />
              <SettingsButton
                Icon={MdDelete}
                text={'Remove all images'}
                onClick={() => removeAllSelectedImages(selectedPairId)}
              />
              <SettingsButton
                Icon={MdZoomIn}
                text={'Zoom in'}
                onClick={() => {
                  propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.StopAnimations`).set(null);
                  const newFov = Math.max(fov - 5, 0.01);
                  luaApi.setPropertyValueSingle(`Modules.SkyBrowser.${selectedPairId}.VerticalFov`, newFov, 0.5, "QuadraticEaseInOut");
                }}
              />
              <SettingsButton
                Icon={MdZoomOut}
                text={'Zoom out'}
                onClick={() => {
                  propertyDispatcher(dispatch, `Modules.SkyBrowser.${selectedPairId}.StopAnimations`).set(null);
                  const newFov = Math.min(fov + 5, 70);
                  luaApi.setPropertyValueSingle(`Modules.SkyBrowser.${selectedPairId}.VerticalFov`, newFov, 0.5, "QuadraticEaseInOut");
                }}
              />
              <SettingsButton
                Icon={MdSettings}
                text={'Settings'}
                onClick={() => setShowSettings(oldVal => !oldVal)}
                canBeSelected={true}
              />
            </span>
            )}
          </div>
        </div>
      );
    });

    return (
      <div className={styles.navTabs}>
        {allTabs}
        <Button
          onClick={() => luaApi.skybrowser.createTargetBrowserPair()}
          className={styles.addTabButton}
          transparent
        >
          <MdAdd className="small" />
        </Button>
      </div>
    );
  }

  return (
    <section className={styles.tabContainer} ref={tabsDiv}>
      <Resizable
        enable={{ top: true, bottom: false }}
        handleClasses={{ top: styles.topHandle }}
        minHeight={minHeight}
        maxHeight={maxHeight}
        onResizeStop={() => {
          setCurrentTabHeight(tabsDiv.current.clientHeight);
        }}
        defaultSize={{ width: 'auto', height }}
        height={height}
      >
        {createTabs()}
        <div className={`${styles.tabContent} ${styles.tabContainer}`}>
          {children}
        </div>
      </Resizable>
    </section>
  );
}

SkyBrowserTabs.propTypes = {
  height: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  minHeight: PropTypes.number.isRequired,
  setCurrentTabHeight: PropTypes.func.isRequired,
  setShowSettings: PropTypes.func.isRequired,
  showSettings: PropTypes.bool.isRequired
};

export default SkyBrowserTabs;
