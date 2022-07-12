import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import { Icon } from '@iconify/react';
import Button from '../../common/Input/Button/Button';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import SkyBrowserTooltip from './SkyBrowserTooltip';
import SkyBrowserFocusEntry from './SkyBrowserFocusEntry';
import styles from './SkyBrowserTabs.scss';
import SkyBrowserSettings from './SkyBrowserSettings.jsx';
import {
  reloadPropertyTree,
} from '../../../api/Actions';

class SkyBrowserTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowingInfoButtons: [false, false, false, false, false],
      showSettings: false,
      messageCounter: 0,
    };
    this.createTabs = this.createTabs.bind(this);
    this.createImageList = this.createImageList.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.createButtons = this.createButtons.bind(this);
    this.toggleShowSettings = this.toggleShowSettings.bind(this);
    this.setImageLayerOrder = this.setImageLayerOrder.bind(this);
    this.createTargetBrowserPair = this.createTargetBrowserPair.bind(this);
    this.removeTargetBrowserPair = this.removeTargetBrowserPair.bind(this);
  }

  componentDidMount() {
    const newHeight = this.tabsDiv.clientHeight;
    this.props.setCurrentTabHeight(newHeight);
  }

  get positionInfo() {
    if (!this.infoButton) {
      return { top: '0px', left: '0px' };
    }
    const { top, right } = this.infoButton.getBoundingClientRect();
    return { top: `${top}`, left: `${right}` };
  }

  showTooltip(i) {
    const isShowingInfoButtonsNew = [...this.state.isShowingInfoButtons];
    isShowingInfoButtonsNew[i] = true;
    this.setState({ isShowingInfoButtonsNew });
    this.setState({ isShowingInfoButtons: isShowingInfoButtonsNew });
  }

  hideTooltip(i) {
    const isShowingInfoButtonsNew = [...this.state.isShowingInfoButtons];
    isShowingInfoButtonsNew[i] = false;
    this.setState({ isShowingInfoButtonsNew });
    this.setState({ isShowingInfoButtons: isShowingInfoButtonsNew });
  }

  toggleShowSettings() {
    this.setState({ showSettings: !this.state.showSettings });
  }

  setImageLayerOrder(browserId, identifier, order) {
    this.props.luaApi.skybrowser.setImageLayerOrder(browserId, identifier, order);
    const reverseOrder = this.props.data.length - order - 1;
    this.props.passMessageToWwt({
      event: 'image_layer_order',
      id: String(identifier),
      order: Number(reverseOrder),
      version: this.state.messageCounter,
    });
    this.setState({
      messageCounter: this.state.messageCounter + 1,
    });
  }

  createButtons(browser) {
    const { luaApi, data, removeAllSelectedImages } = this.props;
    const browserId = browser.id;
    const toggleSettings = this.toggleShowSettings;

    const lookButton = {
      selected: false,
      icon: 'visibility',
      text: 'Look at browser',
      function(browserId) {
        luaApi.skybrowser.adjustCamera(browserId);
      },
    };
    const moveButton = {
      selected: false,
      icon: 'filter_center_focus',
      text: 'Move target to center of view',
      function(browserId) {
        luaApi.skybrowser.stopAnimations(browserId);
        luaApi.skybrowser.centerTargetOnScreen(browserId);
      },
    };
    const _this = this;
    const trashButton = {
      selected: false,
      icon: 'delete',
      text: 'Remove all images',
      function(browserId) {
        removeAllSelectedImages(browserId);
      },
    };
    const scrollInButton = {
      selected: false,
      icon: 'zoom_in',
      text: 'Zoom in',
      function(browserId) {
        luaApi.skybrowser.stopAnimations(browserId);
        const newFov = Math.max(browser.fov - 5, 0.01);
        luaApi.skybrowser.setVerticalFov(browserId, Number(newFov));
      },
    };
    const scrollOutButton = {
      selected: false,
      icon: 'zoom_out',
      text: 'Zoom out',
      function(browserId) {
        luaApi.skybrowser.stopAnimations(browserId);
        const newFov = Math.min(browser.fov + 5, 70);
        luaApi.skybrowser.setVerticalFov(browserId, Number(newFov));
      },
    };
    const pointSpaceCraftButton = {
      selected: false,
      icon: 'eos-icons:satellite-alt',
      iconify: true,
      text: 'Point spacecraft',
      function(browserId) {
        luaApi.skybrowser.pointSpaceCraft(browserId);
      },
    };
    const showSettingsButton = {
      selected: this.state.showSettings,
      icon: 'settings',
      text: 'Settings',
      function(browserId) {
        toggleSettings();
      },
    };

    const buttonsData = [lookButton, moveButton, scrollInButton, scrollOutButton, pointSpaceCraftButton, trashButton, showSettingsButton];

    const buttons = buttonsData.map((button, index) => (
      <Button
        key={index}
        onClick={() => {
          button.function(browserId);
        }}
        onMouseOut={() => this.hideTooltip(index)}
        className={button.selected ? styles.tabButtonActive : styles.tabButtonInactive}
        transparent
        small
      >
        {button.iconify
          ? (
            <Icon
              icon={button.icon}
              rotate={2}
              onMouseOver={() => this.showTooltip(index)}
            />
          )
          : (
            <MaterialIcon
              icon={button.icon}
              className="medium"
              onMouseOver={() => this.showTooltip(index)}
            />
          )}
        {this.state.isShowingInfoButtons[index] && (
          <SkyBrowserTooltip placement="bottom-right" style={this.positionInfo}>
            {button.text}
          </SkyBrowserTooltip>
        )}
      </Button>
    ));

    return (
      <span
        className={styles.tabButtonContainer}
        ref={(element) => this.infoButton = element}
      >
        {buttons}
      </span>
    );
  }

  createTargetBrowserPair() {
    const { luaApi, setWwtRatio, refresh } = this.props;
    luaApi.skybrowser.createTargetBrowserPair();
    setWwtRatio(1);
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      refresh();
    }, 500);
  }

  removeTargetBrowserPair(browserId) {
    const ids = Object.keys(this.props.browsers);
    if (ids.length > 1) {
      const index = ids.indexOf(browserId);
      if (index > -1) {
        ids.splice(index, 1); // 2nd parameter means remove one item only
      }
      this.props.setSelectedBrowser(ids[0]);
    }
    this.props.luaApi.skybrowser.removeTargetBrowserPair(browserId);
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      refresh();
    }, 2000);
  }

  createTabs() {
    const { browsers, selectedBrowserId, luaApi } = this.props;
    const buttons = browsers[selectedBrowserId] && this.createButtons(browsers[selectedBrowserId]);

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
              if (!e) var e = window.event;
              e.cancelBubble = true;
              if (e.stopPropagation) e.stopPropagation();
              if (selectedBrowserId !== browser) {
                this.props.setSelectedBrowser(browser);
              }
            }}
          >
            <span className={styles.tabHeader}>
              <span className={styles.tabTitle}>{browsers[browser].name}</span>
              <Button
                onClick={(e) => {
                  if (!e) var e = window.event;
                  e.cancelBubble = true;
                  if (e.stopPropagation) e.stopPropagation();
                  this.removeTargetBrowserPair(browser);
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
          onClick={() => this.createTargetBrowserPair()}
          className={styles.addTabButton}
          transparent
        >
          <MaterialIcon icon="add" />
        </Button>
      </div>
    );
  }

  createImageList() {
    const {
      currentBrowserColor, browsers, selectedBrowserId, selectImage, luaApi, data, removeImageSelection, setOpacityOfImage,
    } = this.props;
    const images = (
      <ul>
        {data.map((entry, index) => (
          <div key={index}>
            {index == 0 ? (
              <span />
            ) : (
              <Button
                onClick={() => this.setImageLayerOrder(selectedBrowserId, Number(entry.identifier), index - 1)}
                className={styles.arrowButton}
                transparent
              >
                <MaterialIcon icon="keyboard_arrow_left" />
              </Button>
            )}
            <SkyBrowserFocusEntry
              {...entry}
              luaApi={luaApi}
              key={entry.identifier}
              onSelect={selectImage}
              removeImageSelection={removeImageSelection}
              opacity={browsers[selectedBrowserId].opacities[index]}
              setOpacity={setOpacityOfImage}
              currentBrowserColor={currentBrowserColor}
            />
            {index === data.length - 1 ? (
              <span className={styles.arrowButtonEmpty} />
            ) : (
              <Button
                onClick={() => this.setImageLayerOrder(selectedBrowserId, Number(entry.identifier), index + 1)}
                className={styles.arrowButton}
                transparent
              >
                <MaterialIcon icon="keyboard_arrow_right" />
              </Button>
            )}
          </div>
        ))}
      </ul>
    );

    return images;
  }

  render() {
    const {
      data, maxHeight, minHeight, browsers, selectedBrowserId, height, luaApi,
    } = this.props;
    const { showSettings } = this.state;

    let content = '';
    if (showSettings) {
      content = (
        <SkyBrowserSettings
          browser={browsers[selectedBrowserId]}
          selectedBrowserId={selectedBrowserId}
          luaApi={luaApi}
        />
      );
    } else if (data.length === 0) {
      content = <CenteredLabel>There are no selected images in this sky browser.</CenteredLabel>;
    } else {
      content = this.createImageList();
    }

    return (
      <section className={styles.tabContainer} ref={(element) => this.tabsDiv = element}>
        <Resizable
          enable={{ top: true, bottom: false }}
          handleClasses={{ top: styles.topHandle }}
          minHeight={minHeight}
          maxHeight={maxHeight}
          onResizeStop={() => {
            this.props.setCurrentTabHeight(this.tabsDiv.clientHeight);
          }}
          defaultSize={{ width: 'auto', height }}
          height={height}
        >
          {this.createTabs()}
          <div className={`${styles.tabContent} ${styles.tabContainer}`}>
            {content}
          </div>
        </Resizable>
      </section>
    );
  }
}

SkyBrowserTabs.propTypes = {
  children: PropTypes.node,
  data: PropTypes.array.isRequired,
  viewComponentProps: PropTypes.object,
};

SkyBrowserTabs.defaultProps = {
  children: '',
  viewComponentProps: {},
};

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = (dispatch) => ({
  refresh: () => {
    dispatch(reloadPropertyTree());
  },
});

SkyBrowserTabs = connect(mapStateToProps, mapDispatchToProps)(SkyBrowserTabs);

export default SkyBrowserTabs;
