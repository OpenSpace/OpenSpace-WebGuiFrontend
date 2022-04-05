import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import TooltipSkybrowser from './TooltipSkybrowser';
import SkybrowserFocusEntry from './SkybrowserFocusEntry';
import styles from './SkybrowserTabs.scss';
import SkybrowserSettings from './SkybrowserSettings.jsx'

class SkybrowserTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowingInfoButtons: [false, false, false, false, false],
      showSettings: false,
    };
    this.createTabs = this.createTabs.bind(this);
    this.createImageList = this.createImageList.bind(this);
    this.setRef = this.setRef.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.setOpacityOfImage = this.setOpacityOfImage.bind(this);
    this.removeImageSelection = this.removeImageSelection.bind(this);
    this.createButtons = this.createButtons.bind(this);
    this.toggleShowSettings = this.toggleShowSettings.bind(this);
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

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
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

  setOpacityOfImage(identifier, opacity) {
    const { skybrowserApi, selectedBrowser } = this.props;
    skybrowserApi.setOpacityOfImageLayer(selectedBrowser, Number(identifier), opacity);
  }

  removeImageSelection(identifier) {
    const { skybrowserApi, selectedBrowser } = this.props;
    skybrowserApi.removeSelectedImageInBrowser(selectedBrowser, Number(identifier));
  }

  createButtons(target) {
    const { skybrowserApi, data } = this.props;
    const targetId = target.id;
    const toggleSettings = this.toggleShowSettings;

    const lookButton = {
      selected: false,
      icon: 'visibility',
      text: 'Look at target',
      function(targetId) {
        skybrowserApi.adjustCamera(targetId);
      },
    };
    const moveButton = {
      selected: false,
      icon: 'filter_center_focus',
      text: 'Move target to center of view',
      function(targetId) {
        skybrowserApi.centerTargetOnScreen(targetId);
      },
    };
    const trashButton = {
      selected: false,
      icon: 'delete',
      text: 'Remove all images',
      function(targetId) {
        data.map(image => {
          skybrowserApi.removeSelectedImageInBrowser(targetId, Number(image.identifier));
        })
      },
    };
    const scrollInButton = {
      selected: false,
      icon: 'zoom_in',
      text: 'Zoom in',
      function(targetId) {
        const newFov = Math.max(target.FOV - 5, 0.01);
        skybrowserApi.setVerticalFov(targetId, Number(newFov));
      },
    };
    const scrollOutButton = {
      selected: false,
      icon: 'zoom_out',
      text: 'Zoom out',
      function(targetId) {
        const newFov = Math.min(target.FOV + 5, 70);
        skybrowserApi.setVerticalFov(targetId, Number(newFov));
      },
    };
    const showSettingsButton = {
      selected: this.state.showSettings,
      icon: 'settings',
      text: 'Settings',
      function(targetId) {
        toggleSettings();
      },
    };

    const buttonsData = [lookButton, moveButton, scrollInButton, scrollOutButton, trashButton, showSettingsButton];

    const buttons = buttonsData.map((button, index) => (
      <Button
        key={index}
        onClick={() => {
          button.function(targetId);
        }}
        onMouseLeave={() => this.hideTooltip(index)}
        className={button.selected ? styles.tabButtonActive : styles.tabButtonInactive}
        transparent
        small
      >
        <MaterialIcon
          icon={button.icon}
          className="medium"
          onMouseEnter={() => this.showTooltip(index)}
        />
        {this.state.isShowingInfoButtons[index] && (
          <TooltipSkybrowser placement="bottom-right" style={this.positionInfo}>
            {button.text}
          </TooltipSkybrowser>
        )}
      </Button>
    ));

    return (
      <span className={styles.tabButtonContainer} ref={this.setRef('infoButton')}>
        {buttons}
      </span>
    );
  }

  createTabs() {
    const { targets, selectedBrowser, skybrowserApi } = this.props;
    const buttons = targets[selectedBrowser] && this.createButtons(targets[selectedBrowser]);

    const allTabs = Object.keys(targets).map((target, index) => {
      const targetColor = `rgb(${targets[target].color})`;
      return (
        <div
          key={index}
          style={
            selectedBrowser === target
              ? { borderTopRightRadius: '4px', borderTop: `3px solid ${targetColor}` }
              : {}
          }
        >
          <div
            className={selectedBrowser === target ? styles.tabActive : styles.tabInactive}
            onClick={() => skybrowserApi.setSelectedBrowser(target)}
          >
            <span className={styles.tabHeader}>
              <span className={styles.tabTitle}>{targets[target].name}</span>
              <Button
                onClick={() => skybrowserApi.removeTargetBrowserPair(target)}
                className={styles.closeTabButton}
                transparent
                small
              >
                <MaterialIcon icon="close" className="small" />
              </Button>
            </span>
            {selectedBrowser === target && buttons}
          </div>
        </div>
      );
    });

    return (
      <div className={styles.navTabs}>
        {allTabs}
        <Button
          onClick={() => skybrowserApi.createTargetBrowserPair()}
          className={styles.addTabButton}
          transparent
        >
          <MaterialIcon icon="add" />
        </Button>
      </div>
    );
  }

  createImageList(data, props) {
    const {
      currentTargetColor, selectedBrowser, selectImage, skybrowserApi,
    } = props;
    const images = (
      <ul>
        {data.map((entry, index) => (
          <div key={index}>
            {index == 0 ? (
              <span />
            ) : (
              <Button
                onClick={() => skybrowserApi.setImageLayerOrder(
                  selectedBrowser,
                  Number(entry.identifier),
                  index - 1,
                )
                }
                className={styles.arrowButton}
                transparent
              >
                <MaterialIcon icon="keyboard_arrow_left" />
              </Button>
            )}
            <SkybrowserFocusEntry
              {...entry}
              skybrowserApi={skybrowserApi}
              key={entry.identifier}
              onSelect={selectImage}
              removeImageSelection={this.removeImageSelection}
              setOpacity={this.setOpacityOfImage}
              currentTargetColor={currentTargetColor}
            />
            {index === data.length - 1 ? (
              <span className={styles.arrowButtonEmpty} />
            ) : (
              <Button
                onClick={() => skybrowserApi.setImageLayerOrder(
                  selectedBrowser,
                  Number(entry.identifier),
                  index + 1,
                )
                }
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
      data, maxHeight, minHeight, targets, selectedBrowser, height, api, skybrowserApi, isUsingRae, isFacingCamera
    } = this.props;
    const { showSettings } = this.state;

    let tabDisplay = "";
    if (showSettings) {
      tabDisplay = (
        <SkybrowserSettings
          target={targets[selectedBrowser]}
          isUsingRae={isUsingRae}
          isFacingCamera={isFacingCamera}
          selectedBrowser={selectedBrowser}
          api={api}
          skybrowserApi={skybrowserApi}
        />);
    } else if (data.length === 0) {
      tabDisplay = <CenteredLabel>There are no selected images in this sky browser.</CenteredLabel>;
    } else {
      tabDisplay = this.createImageList(data, this.props);
    }

    return (
      <section className={styles.tabContainer} ref={this.setRef('tabsDiv')}>
        <Resizable
          enable={{ top: true, bottom: false }}
          handleClasses={{ top: styles.topHandle }}
          minHeight={minHeight}
          maxHeight={maxHeight}
          onResizeStop={() => {
            this.props.setCurrentTabHeight(this.tabsDiv.clientHeight);
          }}
          height={this.props.height}
        >
          {this.createTabs()}
          <div className={`${styles.tabContent} ${styles.tabContainer}`}>{tabDisplay}</div>
        </Resizable>
      </section>
    );
  }
}

SkybrowserTabs.propTypes = {
  children: PropTypes.node,
  data: PropTypes.array.isRequired,
  viewComponentProps: PropTypes.object,
};

SkybrowserTabs.defaultProps = {
  children: '',
  viewComponentProps: {},
};

export default SkybrowserTabs;
