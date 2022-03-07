import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Row from '../common/Row/Row';
import NumericInput from '../common/Input/NumericInput/NumericInput';
import ColorPickerPopup from '../common/ColorPicker/ColorPickerPopup';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import { excludeKeys } from '../../utils/helpers';
import TooltipSkybrowser from './TooltipSkybrowser';
import SkybrowserFocusEntry from './SkybrowserFocusEntry';
import styles from './SkybrowserTabs.scss';

class SkybrowserTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 185,
      currentHeight: 185,
      isShowingInfoButtons: [false, false, false, false, false],
      showSettings: false,
    };

    this.createTabs = this.createTabs.bind(this);
    this.createImageList = this.createImageList.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
    this.onResize = this.onResize.bind(this);
    this.setRef = this.setRef.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.createSettings = this.createSettings.bind(this);
    this.valueToColor = this.valueToColor.bind(this);
    this.toggleFaceCamera = this.toggleFaceCamera.bind(this);
    this.toggleRadiusAzimuthElevation = this.toggleRadiusAzimuthElevation.bind(this);
    this.setOpacityOfImage = this.setOpacityOfImage.bind(this);
    this.removeImageSelection = this.removeImageSelection.bind(this);
    this.createButtons = this.createButtons.bind(this);
    this.toggleShowSettings = this.toggleShowSettings.bind(this);
  }

  get inheritedProps() {
    const doNotInclude = 'closeCallback className position size title';
    return excludeKeys(this.props, doNotInclude);
  }

  get position() {
    if (!this.wrapper) {
      return { top: '0px', left: '0px' };
    }
    const { top, right } = this.wrapper.getBoundingClientRect();
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

  toggleFaceCamera() {
    const {
      api, isFacingCamera, selectedBrowser, selectedTarget,
    } = this.props;
    const uriBrowser = `ScreenSpace.${selectedBrowser}.FaceCamera`;
    const uriTarget = `ScreenSpace.${selectedTarget}.FaceCamera`;

    api.setPropertyValueSingle(uriBrowser, !isFacingCamera);
    api.setPropertyValueSingle(uriTarget, !isFacingCamera);
  }

  toggleRadiusAzimuthElevation() {
    const {
      api, isUsingRae, selectedBrowser, selectedTarget,
    } = this.props;
    const uriBrowser = `ScreenSpace.${selectedBrowser}.UseRadiusAzimuthElevation`;
    const uriTarget = `ScreenSpace.${selectedTarget}.UseRadiusAzimuthElevation`;

    api.setPropertyValueSingle(uriBrowser, !isUsingRae);
    api.setPropertyValueSingle(uriTarget, !isUsingRae);
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
    const { skybrowserApi } = this.props;
    const targetIsLocked = target.isLocked;
    const targetId = target.id;
    const toggleSettings = this.toggleShowSettings;

    const lookButton = {
      selected: false,
      icon: 'visibility',
      text: 'Look at target',
      function(targetId) {
        skybrowserApi.lockTarget(targetId);
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
    const lockButton = {
      selected: targetIsLocked,
      icon: 'lock',
      text: 'Lock aim of target',
      function(targetId) {
        if (targetIsLocked) {
          skybrowserApi.unlockTarget(targetId);
        } else {
          skybrowserApi.lockTarget(targetId);
        }
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

    const buttonsData = [lookButton, moveButton, lockButton, showSettingsButton];

    const buttons = buttonsData.map((button, index) => (
      <Button
        onClick={() => { button.function(targetId); }}
        onMouseLeave={() => this.hideTooltip(index)}
        className={button.selected ? styles.tabButtonActive : styles.tabButton}
        transparent
        small
      >
        <MaterialIcon icon={button.icon} className="small" onMouseEnter={() => this.showTooltip(index)} />
        { this.state.isShowingInfoButtons[index] && (
          <TooltipSkybrowser
            placement="bottom-right"
            style={this.position}
          >
            {button.text}
          </TooltipSkybrowser>
        )}
      </Button>
    ));

    return (
      <div>
        <span className={styles.tabButtonContainer} ref={this.setRef('wrapper')}>
          {buttons}
        </span>
      </div>
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
          style={selectedBrowser === target ? { borderTopRightRadius: '4px', borderTop: `3px solid ${targetColor}` } : {}}
        >
          <div
            className={selectedBrowser === target ? styles.tabActive : styles.tab}
            onClick={() => skybrowserApi.setSelectedBrowser(target)}
          >
            <span className={styles.tabHeader}>
              <span className={styles.tabTitle}>{ targets[target].name }</span>
              <Button
                onClick={() => skybrowserApi.removeTargetBrowserPair(target)}
                className={styles.closeTabButton}
                transparent
                small
              >
                <MaterialIcon icon="close" className="small" />
              </Button>
            </span>
            { selectedBrowser === target && buttons }
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
    const tabs = (
      <ul>
        { data.map((entry, index) => (
          <div>
            {(index == 0) ? <span className={styles.arrowButtonEmpty} transparent /> : (
              <Button onClick={() => skybrowserApi.setImageLayerOrder(selectedBrowser, Number(entry.identifier), index - 1)} className={styles.arrowButton} transparent>
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
            {(index === data.length - 1)
              ? <span className={styles.arrowButtonEmpty} transparent />
              : (
                <Button
                  onClick={() => skybrowserApi.setImageLayerOrder(selectedBrowser, Number(entry.identifier), index + 1)}
                  className={styles.arrowButton}
                  transparent
                >
                  <MaterialIcon icon="keyboard_arrow_right" />
                </Button>
              )
            }
          </div>
        ))}
      </ul>
    );

    return (
      <ScrollOverlay>
        { data.length > 0 && tabs }
      </ScrollOverlay>
    );
  }

  valueToColor(color) {
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: 1.0,
    };
  }

  createSettings(target) {
    if (!target) {
      return '';
    }
    const { isUsingRae, isFacingCamera, selectedBrowser } = this.props;
    // Take half to display in ranges [0,1] instead of [0,2]
    const size = target.size.map(value => value * 0.5);
    const colors = target.color;
    const colorData = ['Border Color: Red', 'Green', 'Blue'];
    const sizeData = ['Browser Width', 'Browser Height'];
    const precision = 7;
    const { api } = this.props;
    const { skybrowserApi } = this.props;

    // TODO: Fix color picker
    const colorPicker = (
      <ColorPickerPopup
        disableAlpha
        color={this.valueToColor(target.color)}
        onChange={(values) => { }}
        placement="right"
        disabled={false}
      />
    );

    return (
      <ScrollOverlay>
        <NumericInput
          className="Vertical Field Of View"
          label="Vertical Field Of View"
          max={70}
          min={0.0000000001}
          disabled={!skybrowserApi.setVerticalFov}
          onValueChanged={(fov) => { skybrowserApi.setVerticalFov(selectedBrowser, fov); }}
          step={1}
          value={parseFloat(target.FOV.toFixed(precision))}
          placeholder="value 0"
        />
        <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
          <NumericInput
            className="Right Ascension"
            label="Right Ascension"
            max={360}
            min={0}
            disabled={!skybrowserApi.setVerticalFov}
            onValueChanged={value => skybrowserApi.setEquatorialAim(selectedBrowser, value, target.dec)}
            step={0.1}
            value={parseFloat(target.ra.toFixed(precision))}
            placeholder="value 1"
          />
          <NumericInput
            className="Declination"
            label="Declination"
            max={90}
            min={-90}
            disabled={!skybrowserApi.setVerticalFov}
            onValueChanged={value => skybrowserApi.setEquatorialAim(selectedBrowser, target.ra, value)}
            step={0.1}
            value={parseFloat(target.dec.toFixed(precision))}
            placeholder="value 2"
          />
        </Row>
        <Checkbox
          label="Use Radius Azimuth Elevation"
          checked={isUsingRae}
          left={false}
          disabled={false}
          setChecked={this.toggleRadiusAzimuthElevation}
          wide
        />
        <Checkbox
          label="Face Camera"
          checked={isFacingCamera}
          left={false}
          disabled={false}
          setChecked={this.toggleFaceCamera}
          wide
        />
        <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
          { colors.map((color, index) => (
            <NumericInput
              className={colorData[index]}
              label={colorData[index]}
              max={255}
              min={0}
              onValueChanged={(value) => {
                const newColor = colors;
                newColor[index] = value;
                skybrowserApi.setBorderColor(selectedBrowser, newColor[0], newColor[1], newColor[2]);
              }}
              step={1}
              value={color}
              placeholder={`value ${index}`}
            />
          ))}
        </Row>
        <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
          { size.map((value, index) => (
            <NumericInput
              className={sizeData[index]}
              label={sizeData[index]}
              max={1}
              min={0.1}
              onValueChanged={(value) => {
                const newSize = size.map(value => value * 2);
                newSize[index] = value * 2;
                skybrowserApi.setScreenSpaceSize(selectedBrowser, newSize[0], newSize[1]);
              }}
              step={0.1}
              value={parseFloat(value.toFixed(precision))}
              placeholder={`value ${index}`}
            />
          ))}
        </Row>
      </ScrollOverlay>
    );
  }

  onResizeStop(e, direction, ref, delta) {
    this.setState({
      height: this.state.height + delta.height,
    });
  }

  onResize(e, direction, ref, delta) {
    this.setState({
      currentHeight: this.state.height + delta.height,
    });
    this.props.setCurrentTabHeight(this.state.currentHeight);
  }

  render() {
    const {
      data, currentPopoverHeight, targets, selectedBrowser,
    } = this.props;
    const { showSettings, currentHeight } = this.state;

    let tabDisplay;
    if (Object.keys(targets).length === 0) {
      tabDisplay = (
        <ScrollOverlay>
          <CenteredLabel>There are no sky browsers. Press "+" to create one.</CenteredLabel>
        </ScrollOverlay>
      );
    } else if (showSettings) {
      tabDisplay = this.createSettings(targets[selectedBrowser]);
    } else if (data.length === 0) {
      tabDisplay = (
        <ScrollOverlay>
          <CenteredLabel>There are no selected images in this sky browser.</CenteredLabel>
        </ScrollOverlay>
      );
    } else {
      tabDisplay = this.createImageList(data, this.props);
    }

    return (
      <section {...this.inheritedProps} className={styles.tabContainer}>
        <Resizable
          enable={{ top: true, bottom: false }}
          handleClasses={{ top: styles.topHandle }}
          size={{ height: currentHeight }}
          minHeight={130}
          maxHeight={currentPopoverHeight}
          onResizeStop={this.onResizeStop}
          onResize={this.onResize}
        >
          {this.createTabs()}
          <div className={styles.tabContent} style={{ height: currentHeight }}>
            {tabDisplay}
          </div>
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
