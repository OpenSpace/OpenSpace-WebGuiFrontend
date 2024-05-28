import React from 'react';
import {
  MdAdd, MdClose, MdDelete, MdFilterCenterFocus, MdSettings, MdVisibility, MdZoomIn, MdZoomOut
} from 'react-icons/md';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';

import { stopEventPropagation } from '../../../utils/helpers';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import Button from '../../common/Input/Button/Button';

import SkyBrowserSelectedImagesList from './SkyBrowserSelectedImagesList';
import SkyBrowserSettings from './SkyBrowserSettings';
import SkyBrowserTooltip from './SkyBrowserTooltip';

import styles from './SkyBrowserTabs.scss';

const ButtonIds = {
  LookAtTarget: 'LookAtTarget',
  MoveTarget: 'MoveTarget',
  RemoveImages: 'RemoveImages',
  ZoomIn: 'ZoomIn',
  ZoomOut: 'ZoomOut',
  Settings: 'Settings'
};

function SkyBrowserTabs({
  activeImage,
  currentBrowserColor,
  height,
  imageCollectionIsLoaded,
  maxHeight,
  minHeight,
  moveCircleToHoverImage,
  passMessageToWwt,
  removeImageSelection,
  selectImage,
  setBorderRadius,
  setCurrentTabHeight,
  setOpacityOfImage,
  setWwtRatio
}) {
  // State
  const [showSettings, setShowSettings] = React.useState(false);
  // Sets the showing state info text for the top buttons in the tabs
  const [isShowingInfoButtons, setIsShowingInfoButtons] = React.useState(() => {
    const result = {};
    Object.keys(ButtonIds).forEach((id) => { result[id] = false; });
    return result;
  });

  // Refs to get info from DOM
  const infoButton = React.useRef(null);
  const tabsDiv = React.useRef(null);

  // Redux store access - selectors and dispatch
  const browsers = useSelector((state) => state.skybrowser.browsers);
  const luaApi = useSelector((state) => state.luaApi, shallowEqual);
  const selectedBrowserId = useSelector(
    (state) => state.skybrowser.selectedBrowserId,
    shallowEqual
  );
  const imageIndicesLength = useSelector(
    (state) => state.skybrowser.browsers[selectedBrowserId]?.selectedImages.length
  );

  const dispatch = useDispatch();

  // Effects
  // Update tab height when the div is changed
  React.useEffect(() => {
    if (tabsDiv.current) {
      const newHeight = tabsDiv.current.clientHeight;
      setCurrentTabHeight(newHeight);
    }
  }, [tabsDiv.current]);

  // When WWT has loaded the image collection, add all selected images
  React.useEffect(() => {
    if (imageCollectionIsLoaded) {
      // eslint-disable-next-line no-use-before-define
      addAllSelectedImages(selectedBrowserId, false);
    }
  }, [imageCollectionIsLoaded]);

  function addAllSelectedImages(browserId, passToOs = true) {
    if (browsers === undefined || browsers[browserId] === undefined) {
      return;
    }
    // Make deep copies in order to reverse later
    const reverseImages = [...browsers[browserId].selectedImages];
    const opacities = [...browsers[browserId].opacities];
    reverseImages.reverse().forEach((image, index) => {
      selectImage(String(image), passToOs);
      setOpacityOfImage(String(image), opacities.reverse()[index], passToOs);
    });
  }

  function removeAllSelectedImages(browserId, passToOs = true) {
    if (browsers === undefined || browsers[browserId] === undefined) {
      return;
    }
    browsers[browserId].selectedImages.forEach((image) => {
      removeImageSelection(Number(image), passToOs);
    });
  }

  function setSelectedBrowser(browserId) {
    if (browsers === undefined || browsers[browserId] === undefined) {
      return;
    }
    // Don't pass the selection to OpenSpace as we are only changing images in the GUI
    // This is a result of only having one instance of the WWT application, but making
    // it appear as there are many
    const passToOs = false;
    removeAllSelectedImages(selectedBrowserId, passToOs);
    addAllSelectedImages(browserId, passToOs);
    luaApi.skybrowser.setSelectedBrowser(browserId);
    setWwtRatio(browsers[browserId].ratio);
  }

  function positionInfo() {
    if (!infoButton) {
      return { top: '0px', left: '0px' };
    }
    const { top, right } = infoButton.current.getBoundingClientRect();
    return { top: `${top}`, left: `${right}` };
  }

  function showTooltip(id, shouldShow) {
    const isShowingInfoButtonsNew = { ...isShowingInfoButtons };
    isShowingInfoButtonsNew[id] = shouldShow;
    setIsShowingInfoButtons(isShowingInfoButtonsNew);
  }

  function toggleShowSettings() {
    setShowSettings(!showSettings);
  }

  function createButtons(browser) {
    const browserId = browser.id;
    const toggleSettings = toggleShowSettings;

    const lookButton = {
      id: ButtonIds.LookAtTarget,
      selected: false,
      Icon: MdVisibility,
      text: 'Look at browser',
      function(id) {
        luaApi.skybrowser.adjustCamera(id);
      }
    };
    const moveButton = {
      id: ButtonIds.MoveTarget,
      selected: false,
      Icon: MdFilterCenterFocus,
      text: 'Move target to center of view',
      function(id) {
        luaApi.skybrowser.stopAnimations(id);
        luaApi.skybrowser.centerTargetOnScreen(id);
      }
    };
    const trashButton = {
      id: ButtonIds.RemoveImages,
      selected: false,
      Icon: MdDelete,
      text: 'Remove all images',
      function(id) {
        removeAllSelectedImages(id);
      }
    };
    const scrollInButton = {
      id: ButtonIds.ZoomIn,
      selected: false,
      Icon: MdZoomIn,
      text: 'Zoom in',
      function(id) {
        luaApi.skybrowser.stopAnimations(id);
        const newFov = Math.max(browser.fov - 5, 0.01);
        luaApi.skybrowser.setVerticalFov(id, Number(newFov));
      }
    };
    const scrollOutButton = {
      id: ButtonIds.ZoomOut,
      selected: false,
      Icon: MdZoomOut,
      text: 'Zoom out',
      function(id) {
        luaApi.skybrowser.stopAnimations(id);
        const newFov = Math.min(browser.fov + 5, 70);
        luaApi.skybrowser.setVerticalFov(id, Number(newFov));
      }
    };
    const showSettingsButton = {
      id: ButtonIds.Settings,
      selected: showSettings,
      Icon: MdSettings,
      text: 'Settings',
      function() {
        toggleSettings();
      }
    };

    const buttonsData = [
      lookButton,
      moveButton,
      scrollInButton,
      scrollOutButton,
      trashButton,
      showSettingsButton
    ];

    const buttons = buttonsData.map((button) => (
      <Button
        key={button.id}
        onClick={() => {
          button.function(browserId);
        }}
        onMouseOut={() => showTooltip(button.id, false)}
        className={button.selected ? styles.tabButtonActive : styles.tabButtonInactive}
        transparent
        small
      >
        <button.Icon
          onMouseOver={() => showTooltip(button.id, true)}
          className="medium"
        />
        {isShowingInfoButtons[button.id] && (
          <SkyBrowserTooltip placement="bottom-right" style={positionInfo()}>
            {button.text}
          </SkyBrowserTooltip>
        )}
      </Button>
    ));

    return (
      <span
        className={styles.tabButtonContainer}
        ref={infoButton}
      >
        {buttons}
      </span>
    );
  }

  function createTargetBrowserPair() {
    luaApi.skybrowser.createTargetBrowserPair();
    setWwtRatio(1);
  }

  function removeTargetBrowserPair(browserId) {
    const ids = Object.keys(browsers);
    if (ids.length > 1) {
      const index = ids.indexOf(browserId);
      if (index > -1) {
        ids.splice(index, 1); // 2nd parameter means remove one item only
      }
      setSelectedBrowser(ids[0]);
    }
    luaApi.skybrowser.removeTargetBrowserPair(browserId);
  }

  function createTabs() {
    const buttons = browsers[selectedBrowserId] && createButtons(browsers[selectedBrowserId]);

    const allTabs = Object.keys(browsers).map((browser) => {
      const browserColor = `rgb(${browsers[browser].color})`;
      return (
        <div
          key={browser}
          style={
            selectedBrowserId === browser ?
              { borderTopRightRadius: '4px', borderTop: `3px solid ${browserColor}` } :
              {}
          }
        >
          <div
            className={selectedBrowserId === browser ? styles.tabActive : styles.tabInactive}
            onKeyDown={(e) => {
              const event = e ?? window.event;
              event.cancelBubble = true;
              e?.stopPropagation();
              if (selectedBrowserId !== browser) {
                setSelectedBrowser(browser);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className={styles.tabHeader}>
              <span className={styles.tabTitle}>{browsers[browser].name}</span>
              <Button
                onClick={(e) => {
                  stopEventPropagation(e);
                  removeTargetBrowserPair(browser);
                }}
                className={styles.closeTabButton}
                transparent
                small
              >
                <MdClose className="small" />
              </Button>
            </span>
            {selectedBrowserId === browser && buttons}
          </div>
        </div>
      );
    });

    return (
      <div className={styles.navTabs}>
        {allTabs}
        <Button
          onClick={() => createTargetBrowserPair()}
          className={styles.addTabButton}
          transparent
        >
          <MdAdd className="small" />
        </Button>
      </div>
    );
  }

  let content = '';
  if (showSettings) {
    content = (
      <SkyBrowserSettings
        selectedBrowserId={selectedBrowserId}
        luaApi={luaApi}
        setBorderRadius={setBorderRadius}
      />
    );
  } else if (imageIndicesLength === 0) {
    content = (
      <CenteredLabel>
        There are no selected images in this sky browser
      </CenteredLabel>
    );
  } else {
    content = (
      <SkyBrowserSelectedImagesList
        luaApi={luaApi}
        selectImage={selectImage}
        currentBrowserColor={currentBrowserColor}
        activeImage={activeImage}
        passMessageToWwt={passMessageToWwt}
        removeImageSelection={removeImageSelection}
        setOpacityOfImage={setOpacityOfImage}
        moveCircleToHoverImage={moveCircleToHoverImage}
      />
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
          {content}
        </div>
      </Resizable>
    </section>
  );
}

SkyBrowserTabs.propTypes = {
  activeImage: PropTypes.string.isRequired,
  currentBrowserColor: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  imageCollectionIsLoaded: PropTypes.bool.isRequired,
  maxHeight: PropTypes.number.isRequired,
  minHeight: PropTypes.number.isRequired,
  moveCircleToHoverImage: PropTypes.func.isRequired,
  passMessageToWwt: PropTypes.func.isRequired,
  removeImageSelection: PropTypes.func.isRequired,
  selectImage: PropTypes.func.isRequired,
  setBorderRadius: PropTypes.func.isRequired,
  setCurrentTabHeight: PropTypes.func.isRequired,
  setOpacityOfImage: PropTypes.func.isRequired,
  setWwtRatio: PropTypes.func.isRequired
};

export default SkyBrowserTabs;
