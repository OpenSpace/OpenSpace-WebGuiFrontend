import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../common/Input/Button/Button';
import Row from '../../common/Row/Row';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import ColorPickerPopup from '../../common/ColorPicker/ColorPickerPopup';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import SkyBrowserTooltip from './SkyBrowserTooltip';
import Popover from '../../common/Popover/Popover';
import Property from '../../Sidebar/Properties/Property';
import {
  SkyBrowser_ShowTitleInBrowserKey,
  SkyBrowser_AllowCameraRotationKey,
  SkyBrowser_InverseZoomDirectionKey,
  SkyBrowser_CameraRotationSpeedKey,
  SkyBrowser_TargetAnimationSpeedKey,
  SkyBrowser_BrowserAnimationSpeedKey,
  SkyBrowser_HideTargetsBrowsersWithGuiKey,
  SkyBrowser_SpaceCraftAnimationTimeKey,
} from '../../../api/keys';
import styles from './SkyBrowserSettings.scss';

class SkyBrowserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showExpandedCopies: false,
      showExpandedSettings: false,
      generalSettingsExpanded: false,
      precisionLow: 2,
      precisionHigh: 10,
      newPosition: [0, 0, -2],
      noOfCopies: 1,
      showCopiesInfo: false,
    };
    this.valueToColor = this.valueToColor.bind(this);
    this.onColorPickerChange = this.onColorPickerChange.bind(this);
    this.toggleFaceCamera = this.toggleFaceCamera.bind(this);
    this.toggleRadiusAzimuthElevation = this.toggleRadiusAzimuthElevation.bind(this);
    this.setRef = this.setRef.bind(this);
    this.setExpandedCopies = this.setExpandedCopies.bind(this);
    this.createDisplayCopiesSection = this.createDisplayCopiesSection.bind(this);
    this.showExpandedCopySettings = this.showExpandedCopySettings.bind(this);
    this.setExpandedGeneralSettings = this.setExpandedGeneralSettings.bind(this);
  }

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  setExpandedCopies(expanded) {
    this.setState({ showExpandedCopies: expanded });
  }

  setExpandedGeneralSettings(expanded) {
    this.setState({ generalSettingsExpanded: expanded });
  }

  toggleFaceCamera() {
    const { luaApi, browser } = this.props;
    const uriBrowser = `ScreenSpace.${browser.id}.FaceCamera`;
    luaApi.setPropertyValueSingle(uriBrowser, !browser.isFacingCamera);
  }

  toggleRadiusAzimuthElevation() {
    const { luaApi, browser } = this.props;
    const uriBrowser = `ScreenSpace.${browser.id}.UseRadiusAzimuthElevation`;
    luaApi.setPropertyValueSingle(uriBrowser, !browser.isUsingRae);
  }

  valueToColor(color) {
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: 1.0,
    };
  }

  onColorPickerChange(color) {
    const { luaApi, selectedBrowserId } = this.props;
    const { rgb } = color;
    luaApi.skybrowser.setBorderColor(
      selectedBrowserId,
      rgb.r,
      rgb.g,
      rgb.b,
    );
  }

  showExpandedCopySettings() {
    this.setState({ showExpandedSettings: !this.state.showExpandedSettings });
  }

  createDisplayCopiesSection(browser, luaApi, selectedBrowserId) {
    const { displayCopies } = browser;
    const positionData = browser.isUsingRae ? ['Radius', 'Azimuth', 'Elevation'] : ['X', 'Y', 'Z'];
    const maxPosition = browser.isUsingRae ? [10, 3.14, 3.14] : [4, 4, 0];
    const minPosition = browser.isUsingRae ? [0, -3.14, -3.14] : [-4, -4, -10];
    const newPositionVector = this.state.newPosition;

    const displayCopiesButtons = displayCopies && Object.values(displayCopies).map((entry, indexCopy) => (
      <Row key={indexCopy} className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
        <Checkbox
          label=""
          checked={entry.show}
          left={false}
          disabled={false}
          setChecked={(value) => {
            const displayCopyId = Object.keys(displayCopies)[indexCopy];
            const uriBrowser = `ScreenSpace.${selectedBrowserId}.${entry.idShowProperty}`;
            luaApi.setPropertyValueSingle(uriBrowser, value);
          }}
          wide
        />
        {entry.position.map((number, index) => (
          <NumericInput
            key={index}
            className={positionData[index]}
            label={positionData[index]}
            max={maxPosition[index]}
            min={minPosition[index]}
            onValueChanged={(newValue) => {
              const newVector = entry.position;
              newVector[index] = newValue;
              const displayCopyId = Object.keys(displayCopies)[indexCopy];
              const uriBrowser = `ScreenSpace.${selectedBrowserId}.${displayCopyId}`;
              luaApi.setPropertyValueSingle(uriBrowser, newVector);
            }}
            step={0.1}
            value={parseFloat((number).toFixed(this.state.precisionLow))}
            placeholder={`value ${index}`}
          />
        ))}
      </Row>
    ));

    return (
      <ToggleContent
        title="Display Copies"
        expanded={this.state.showExpandedCopies}
        setExpanded={this.setExpandedCopies}
      >
        <NumericInput
          label="Scale"
          max={2}
          min={0.01}
          disabled={!browser.scale}
          onValueChanged={(value) => {
            const uriBrowser = `ScreenSpace.${browser.id}.Scale`;
            luaApi.setPropertyValueSingle(uriBrowser, value);
          }}
          step={0.1}
          value={parseFloat(browser.scale.toFixed(this.state.precisionLow))}
          placeholder="value 2"
        />
        <Checkbox
          label="Face Camera"
          checked={browser.isFacingCamera}
          left={false}
          disabled={false}
          setChecked={this.toggleFaceCamera}
          wide
        />
        <Checkbox
          label="Use Radius Azimuth Elevation"
          checked={browser.isUsingRae}
          left={false}
          disabled={false}
          setChecked={this.toggleRadiusAzimuthElevation}
          wide
          style={{ width: '100%' }}
        />
        <ToggleContent
          title="Add Copy Settings"
          expanded={this.state.showExpandedSettings}
          setExpanded={this.showExpandedCopySettings}
        >
          <NumericInput
            label="Number of Copies"
            max={5}
            min={1}
            onValueChanged={(newValue) => this.setState({ noOfCopies: newValue })}
            step={1}
            value={this.state.noOfCopies}
            placeholder="value"
          />
          <Row>
            <header>
              Position for first copy
            </header>
            <MaterialIcon
              icon="info"
              ref={this.setRef('copiesPosition')}
              onMouseOver={() => this.setState({ showCopiesInfo: true })}
              onMouseOut={() => this.setState({ showCopiesInfo: false })}
              style={{ fontSize: '15px' }}
            />
            {
            this.state.showCopiesInfo && (
              <SkyBrowserTooltip placement="bottom-right" style={this.copiesPosition}>
                This sets the position of the first copy. The additional copies will be evenly spread out on the Azimuth.
              </SkyBrowserTooltip>
            )
          }
          </Row>
          <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
            {newPositionVector.map((number, index) => (
              <NumericInput
                key={index}
                className={positionData[index]}
                label={positionData[index]}
                max={maxPosition[index]}
                min={minPosition[index]}
                onValueChanged={(newValue) => {
                  const newVector = this.state.newPosition;
                  newVector[index] = newValue;
                  this.setState({ newPosition: newVector });
                }}
                step={0.1}
                value={parseFloat((number).toFixed(this.state.precisionLow))}
                placeholder={`value ${index}`}
              />
            ))}
          </Row>
        </ToggleContent>
        <Row className={styles.buttonContainer}>
          <Button
            onClick={() => {
              luaApi.skybrowser.addDisplayCopy(selectedBrowserId, this.state.noOfCopies, this.state.newPosition);
            }}
            className={styles.displayCopyButton}
            transparent
          >
            Add
          </Button>
          <Button
            onClick={() => {
              luaApi.skybrowser.removeDisplayCopy(selectedBrowserId);
            }}
            className={styles.displayCopyButton}
            transparent
          >
            Remove
          </Button>
        </Row>
        {displayCopies && displayCopiesButtons}
      </ToggleContent>
    );
  }

  render() {
    const { selectedBrowserId, browser, luaApi } = this.props;
    if (!browser) {
      return '';
    }
    // Take half to display in ranges [0,1] instead of [0,2]
    const { size } = browser;
    const colorValues = browser.color;
    const colorLabels = ['Border Color: R', 'G', 'B'];
    const displayDisplaySection = this.createDisplayCopiesSection(browser, luaApi, selectedBrowserId);

    const colorPicker = (
      <ColorPickerPopup
        className={styles.colorPicker}
        disableAlpha
        color={this.valueToColor(browser.color)}
        onChange={this.onColorPickerChange}
        disabled={false}
      />
    );

    return (
      <div>
        <NumericInput
          label="Vertical Field of View"
          max={70}
          min={0}
          disabled={!luaApi.skybrowser.setVerticalFov}
          onValueChanged={(fov) => {
            luaApi.skybrowser.setVerticalFov(selectedBrowserId, fov);
          }}
          step={1}
          value={parseFloat(browser.fov.toFixed(this.state.precisionHigh))}
          placeholder="value 0"
        />
        <Row>
          <NumericInput
            label="Right Ascension"
            max={360}
            min={0}
            disabled={!luaApi.skybrowser.setVerticalFov}
            onValueChanged={(value) => luaApi.skybrowser.setEquatorialAim(selectedBrowserId, value, browser.dec)}
            step={0.1}
            value={parseFloat(browser.ra.toFixed(this.state.precisionHigh))}
            placeholder="value 1"
          />
          <NumericInput
            label="Declination"
            max={90}
            min={-90}
            disabled={!luaApi.skybrowser.setVerticalFov}
            onValueChanged={(value) => luaApi.skybrowser.setEquatorialAim(selectedBrowserId, browser.ra, value)}
            step={0.1}
            value={parseFloat(browser.dec.toFixed(this.state.precisionHigh))}
            placeholder="value 2"
          />
        </Row>
        <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
          {colorPicker}
          {colorValues.map((color, index) => (
            <NumericInput
              key={index}
              label={colorLabels[index]}
              max={255}
              min={0}
              onValueChanged={(value) => {
                const newColor = colorValues;
                newColor[index] = value;
                luaApi.skybrowser.setBorderColor(
                  selectedBrowserId,
                  newColor[0],
                  newColor[1],
                  newColor[2],
                );
              }}
              step={1}
              value={color}
              placeholder={`value ${index}`}
            />
          ))}
        </Row>
        {displayDisplaySection}
        <ToggleContent
          title="General Settings"
          expanded={this.state.generalSettingsExpanded}
          setExpanded={this.setExpandedGeneralSettings}
        >
          <Property uri={SkyBrowser_ShowTitleInBrowserKey} />
          <Property uri={SkyBrowser_AllowCameraRotationKey} />
          <Property uri={SkyBrowser_CameraRotationSpeedKey} />
          <Property uri={SkyBrowser_TargetAnimationSpeedKey} />
          <Property uri={SkyBrowser_BrowserAnimationSpeedKey} />
          <Property uri={SkyBrowser_HideTargetsBrowsersWithGuiKey} />
          <Property uri={SkyBrowser_InverseZoomDirectionKey} />
          <Property uri={SkyBrowser_SpaceCraftAnimationTimeKey} />
        </ToggleContent>
      </div>
    );
  }
}

SkyBrowserSettings.propTypes = {
  selectedBrowserId: PropTypes.string,
  browser: PropTypes.object,
};

SkyBrowserSettings.defaultProps = {
};

export default SkyBrowserSettings;
