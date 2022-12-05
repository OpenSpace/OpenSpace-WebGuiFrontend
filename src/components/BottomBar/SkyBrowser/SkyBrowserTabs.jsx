import React from 'react';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import SkyBrowserTooltip from './SkyBrowserTooltip';
import { Icon } from '@iconify/react';
import styles from './SkyBrowserTabs.scss';
import SkyBrowserSettings from './SkyBrowserSettings.jsx'
import {
  reloadPropertyTree,
} from '../../../api/Actions';
import SkyBrowserSelectedImagesList from './SkyBrowserSelectedImagesList';

const ButtonIds = {
  LookAtTarget: "LookAtTarget",
  MoveTarget: "MoveTarget",
  RemoveImages: "RemoveImages",
  ZoomIn: "ZoomIn",
  ZoomOut: "ZoomOut",
  PointSpaceCraft: "PointSpaceCraft",
  Settings: "Settings"
}

function SkyBrowserTabs({ 
  activeImage,
  currentBrowserColor,
  height,
  imageCollectionIsLoaded,
  maxHeight,
  minHeight,
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
    let result = {};
    Object.keys(ButtonIds).forEach(id => result[id] = false);
    return result;
  }
  );
  
  // Refs to get info from DOM
  const infoButton = React.useRef(null);
  const tabsDiv = React.useRef(null);
  
  // Redux store access - selectors and dispatch
  const browsers = useSelector((state) => state.skybrowser.browsers);
  const luaApi = useSelector((state) => state.luaApi, shallowEqual);
  const selectedBrowserId = useSelector((state) => state.skybrowser.selectedBrowserId, shallowEqual);
  const imageIndicesLength = useSelector((state) => {
    return state.skybrowser.browsers[selectedBrowserId]?.selectedImages.length;
  });
  
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
      addAllSelectedImages(selectedBrowserId, false);
    }
  }, [imageCollectionIsLoaded]);

  function setSelectedBrowser(browserId) {
    if (browsers === undefined || browsers[browserId] === undefined) {
      return "";
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



  function addAllSelectedImages(browserId, passToOs = true) {
    if (browsers === undefined || browsers[browserId] === undefined) {
      return "";
    }
    // Make deep copies in order to reverse later
    const reverseImages = [...browsers[browserId].selectedImages];
    const opacities = [...browsers[browserId].opacities];
    reverseImages.reverse().map((image, index) => {
      selectImage(String(image), passToOs);
      setOpacityOfImage(String(image), opacities.reverse()[index], passToOs);
    });
  }

  function removeAllSelectedImages(browserId, passToOs = true) {
    if (browsers === undefined || browsers[browserId] === undefined) {
      return "";
    }
    browsers[browserId].selectedImages.map(image => {
      removeImageSelection(Number(image), passToOs);
    });
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
      icon: 'visibility',
      text: 'Look at browser',
      function(browserId) {
        luaApi.skybrowser.adjustCamera(browserId);
      },
    };
    const moveButton = {
      id: ButtonIds.MoveTarget,
      selected: false,
      icon: 'filter_center_focus',
      text: 'Move target to center of view',
      function: function(browserId) {
        luaApi.skybrowser.stopAnimations(browserId);
        luaApi.skybrowser.centerTargetOnScreen(browserId);
      },
    };
    var _this = this;
    const trashButton = {
      id: ButtonIds.RemoveImages,
      selected: false,
      icon: 'delete',
      text: 'Remove all images',
      function: function(browserId) {
        removeAllSelectedImages(browserId);
      },
    };
    const scrollInButton = {
      id: ButtonIds.ZoomIn,
      selected: false,
      icon: 'zoom_in',
      text: 'Zoom in',
      function: function(browserId) {
        luaApi.skybrowser.stopAnimations(browserId);
        const newFov = Math.max(browser.fov - 5, 0.01);
        luaApi.skybrowser.setVerticalFov(browserId, Number(newFov));
      },
    };
    const scrollOutButton = {
      id: ButtonIds.ZoomOut,
      selected: false,
      icon: 'zoom_out',
      text: 'Zoom out',
      function: function(browserId) {
        luaApi.skybrowser.stopAnimations(browserId);
        const newFov = Math.min(browser.fov + 5, 70);
        luaApi.skybrowser.setVerticalFov(browserId, Number(newFov));
      },
    };
    const pointSpaceCraftButton = {
      id: ButtonIds.PointSpaceCraft,
      selected: false,
      icon: 'eos-icons:satellite-alt',
      iconify: true,
      text: 'Point spacecraft',
      function: function(browserId) {
        luaApi.skybrowser.pointSpaceCraft(browserId);
      },
    };
    const showSettingsButton = {
      id: ButtonIds.Settings,
      selected: showSettings,
      icon: 'settings',
      text: 'Settings',
      function: function(browserId) {
        toggleSettings();
      },
    };

    const buttonsData = [lookButton, moveButton, scrollInButton, scrollOutButton, pointSpaceCraftButton, trashButton, showSettingsButton];

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
        {button.iconify ?
          <Icon
            icon={button.icon}
            rotate={2}
            onMouseOver={() => showTooltip(button.id, true)}
          />
          :
        <MaterialIcon
          icon={button.icon}
          className="medium"
          onMouseOver={() => showTooltip(button.id, true)}
        />}
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
        ref={(element) => infoButton.current = element}
      >
        {buttons}
      </span>
    );
  }

  function createTargetBrowserPair() {
    luaApi.skybrowser.createTargetBrowserPair();
    setWwtRatio(1);
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      dispatch(reloadPropertyTree());
    }, 500);
  }

  function removeTargetBrowserPair(browserId) {
    let ids = Object.keys(browsers);
    if(ids.length > 1) {
      const index = ids.indexOf(browserId);
      if (index > -1) {
        ids.splice(index, 1); // 2nd parameter means remove one item only
      }
      setSelectedBrowser(ids[0]);
    }
    luaApi.skybrowser.removeTargetBrowserPair(browserId);
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      dispatch(reloadPropertyTree());
    }, 2000);
    
  }

  function createTabs() {
    const buttons = browsers[selectedBrowserId] && createButtons(browsers[selectedBrowserId]);

    const allTabs = Object.keys(browsers).map((browser, index) => {
      const browserColor = `rgb(${browsers[browser].color})`;
      return (
        <div
          key={index}
          style={
            selectedBrowserId === browser
              ? { borderTopRightRadius: '4px', borderTop: `3px solid ${browserColor}` }
              : {}
          }
        >
          <div
            className={selectedBrowserId === browser ? styles.tabActive : styles.tabInactive}
            onClick={(e) => {
              let event = e ?? window.event;
              event.cancelBubble = true;
              e?.stopPropagation();
              if (selectedBrowserId !== browser) {
                setSelectedBrowser(browser)}
              }
            }
          >
            <span className={styles.tabHeader}>
              <span className={styles.tabTitle}>{browsers[browser].name}</span>
              <Button
                onClick={(e) => {
                  if (!e) var e = window.event;
                  e.cancelBubble = true;
                  if (e.stopPropagation) e.stopPropagation();
                  removeTargetBrowserPair(browser);
                }}
                className={styles.closeTabButton}
                transparent
                small
              >
                <MaterialIcon icon="close" className="small" />
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
          <MaterialIcon icon="add" />
        </Button>
      </div>
    );
  }

  let content = "";
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
      />
    );
  }

  return (
    <section className={styles.tabContainer} ref={(element) => tabsDiv.current = element}>
      <Resizable
        enable={{ top: true, bottom: false }}
        handleClasses={{ top: styles.topHandle }}
        minHeight={minHeight}
        maxHeight={maxHeight}
        onResizeStop={() => {
          setCurrentTabHeight(tabsDiv.current.clientHeight);
        }}
        defaultSize={{width: 'auto', height: height}}
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
  activeImage: PropTypes.string,
  currentBrowserColor: PropTypes.func,
  height: PropTypes.number,
  imageCollectionIsLoaded: PropTypes.bool,
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number,
  passMessageToWwt: PropTypes.func,
  selectImage: PropTypes.func,
  setBorderRadius: PropTypes.func,
  setCurrentTabHeight: PropTypes.func,
  setWwtRatio: PropTypes.func
};

export default SkyBrowserTabs;
