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
import styles from './SkyBrowserSettings.scss';

class SkyBrowserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showExpandedCopies: false,
      showExpandedSettings: false,
      precisionLow: 2,
      precisionHigh: 10,
      newPosition: [0, 0, -2],
      noOfCopies: 1,
      showCopiesInfo: false,
    };
    this.valueToColor = this.valueToColor.bind(this);
    this.toggleFaceCamera = this.toggleFaceCamera.bind(this);
    this.toggleRadiusAzimuthElevation = this.toggleRadiusAzimuthElevation.bind(this);
    this.setRef = this.setRef.bind(this);
    this.setExpandedCopies = this.setExpandedCopies.bind(this);
    this.createRenderCopiesSection = this.createRenderCopiesSection.bind(this);
    this.showExpandedCopySettings = this.showExpandedCopySettings.bind(this);
  }

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  setExpandedCopies(expanded) {
    this.setState({ showExpandedCopies: expanded });
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

  showExpandedCopySettings() {
    this.setState({ showExpandedSettings: !this.state.showExpandedSettings });
  }

  createRenderCopiesSection(browser, luaApi, selectedBrowserId) {
    const renderCopies = browser.renderCopies;
    const positionData = browser.isUsingRae ? ['Radius', 'Azimuth', 'Elevation'] : ['X', 'Y', 'Z'];
    const maxPosition = browser.isUsingRae ? [10, 3.14, 3.14] : [4, 4, 0];
    const minPosition = browser.isUsingRae ? [0, -3.14, -3.14] : [-4, -4, -10];
    const newPositionVector = this.state.newPosition;

    const renderCopiesButtons = renderCopies && Object.values(renderCopies).map((entry, indexCopy) => {
      return (
        <Row key={indexCopy} className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
          {entry.map((number, index) => {
            return <NumericInput
              key={index}
              className={positionData[index]}
              label={positionData[index]}
              max={maxPosition[index]}
              min={minPosition[index]}
              onValueChanged={(newValue) => {
                const newVector = entry;
                newVector[index] = newValue;
                const renderCopyId = Object.keys(renderCopies)[indexCopy];
                const uriBrowser = `ScreenSpace.${selectedBrowserId}.${renderCopyId}`;
                luaApi.setPropertyValueSingle(uriBrowser, newVector);
              }}
              step={0.1}
              value={parseFloat((number).toFixed(this.state.precisionLow))}
              placeholder={`value ${index}`}
            />;
          })}
        </Row>
      );
    });

    return (
      <ToggleContent
        title={"Display Copies"}
        expanded={this.state.showExpandedCopies}
        setExpanded={this.setExpandedCopies}
      >
        <ToggleContent
          title={"Add Copy Settings"}
          expanded={this.state.showExpandedSettings}
          setExpanded={this.showExpandedCopySettings}
        >
          <NumericInput
            label={"Number Of Copies"}
            max={5}
            min={1}
            onValueChanged={(newValue) => this.setState({ noOfCopies : newValue })}
            step={1}
            value={this.state.noOfCopies}
            placeholder={`value`}
          />
          <Row><header>
          Position for first copy
          </header>
          <MaterialIcon
            icon={'info'}
            ref={this.setRef('copiesPosition')}
            onMouseOver={() => this.setState({ showCopiesInfo : true})}
            onMouseOut={() => this.setState({ showCopiesInfo : false})}
            style={{fontSize: '15px'}}>
          </MaterialIcon>
          {
            this.state.showCopiesInfo && (
              <SkyBrowserTooltip placement="bottom-right" style={this.copiesPosition}>
                {"This sets the position of the first copy. The additional copies will be evenly spread out on the Azimuth."}
              </SkyBrowserTooltip>
            )
          }
          </Row>
          <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
          {newPositionVector.map((number, index) => {
              return <NumericInput
                key={index}
                className={positionData[index]}
                label={positionData[index]}
                max={maxPosition[index]}
                min={minPosition[index]}
                onValueChanged={(newValue) => {
                  const newVector = this.state.newPosition;
                  newVector[index] = newValue;
                  this.setState({ newPosition : newVector });
                }}
                step={0.1}
                value={parseFloat((number).toFixed(this.state.precisionLow))}
                placeholder={`value ${index}`}
              />
            })}
          </Row>
        </ToggleContent>
        <Row className={styles.buttonContainer}>
          <Button
            onClick={() => {
              luaApi.skybrowser.addRenderCopy(selectedBrowserId, this.state.noOfCopies, this.state.newPosition);
            }}
            className={styles.renderCopyButton}
            transparent
          >
            Add
          </Button>
          <Button
            onClick={() => {
              luaApi.skybrowser.removeRenderCopy(selectedBrowserId);
            }}
            className={styles.renderCopyButton}
            transparent
          >
            Remove
          </Button>
        </Row>
        {renderCopies && renderCopiesButtons}
      </ToggleContent>);
  }

  render() {
      const { selectedBrowserId, browser, luaApi } = this.props;
      if (!browser) {
        return '';
      }
      // Take half to display in ranges [0,1] instead of [0,2]
      const size = browser.size;
      const colors = browser.color;
      const colorData = ['Border Color: Red', 'Green', 'Blue'];
      const sizeData = ['Browser Width', 'Browser Height'];
      const renderCopiesSection = this.createRenderCopiesSection(browser, luaApi, selectedBrowserId);
      // TODO: Fix color picker
      const colorPicker = (
        <ColorPickerPopup
          disableAlpha
          color={this.valueToColor(browser.color)}
          onChange={(values) => {}}
          placement="right"
          disabled={false}
        />
      );

      return (
        <div>
          <NumericInput
            className="Vertical Field Of View"
            label="Vertical Field Of View"
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
              className="Right Ascension"
              label="Right Ascension"
              max={360}
              min={0}
              disabled={!luaApi.skybrowser.setVerticalFov}
              onValueChanged={value => luaApi.skybrowser.setEquatorialAim(selectedBrowserId, value, browser.dec)
              }
              step={0.1}
              value={parseFloat(browser.ra.toFixed(this.state.precisionHigh))}
              placeholder="value 1"
            />
            <NumericInput
              className="Declination"
              label="Declination"
              max={90}
              min={-90}
              disabled={!luaApi.skybrowser.setVerticalFov}
              onValueChanged={value => luaApi.skybrowser.setEquatorialAim(selectedBrowserId, browser.ra, value)
              }
              step={0.1}
              value={parseFloat(browser.dec.toFixed(this.state.precisionHigh))}
              placeholder="value 2"
            />
          </Row>
          <Checkbox
            label="Use Radius Azimuth Elevation"
            checked={browser.isUsingRae}
            left={false}
            disabled={false}
            setChecked={this.toggleRadiusAzimuthElevation}
            wide
            style={{ width: '100%'}}
          />
          <Checkbox
            label="Face Camera"
            checked={browser.isFacingCamera}
            left={false}
            disabled={false}
            setChecked={this.toggleFaceCamera}
            wide
          />
          <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
            {colors.map((color, index) => (
              <NumericInput
                key={index}
                className={colorData[index]}
                label={colorData[index]}
                max={255}
                min={0}
                onValueChanged={(value) => {
                  const newColor = colors;
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
          {renderCopiesSection}
        </div>
    );
  }
}

SkyBrowserSettings.propTypes = {
  selectedBrowserId: PropTypes.string,
  browser: PropTypes.object
};

SkyBrowserSettings.defaultProps = {
};

export default SkyBrowserSettings;
