import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Input/Button/Button';
import Row from '../common/Row/Row';
import NumericInput from '../common/Input/NumericInput/NumericInput';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import ColorPickerPopup from '../common/ColorPicker/ColorPickerPopup';
import TooltipSkybrowser from './TooltipSkybrowser';
import styles from './SkybrowserTabs.scss';

class SkybrowserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSettingsRaeInfo: false,
    };
    this.valueToColor = this.valueToColor.bind(this);
    this.toggleFaceCamera = this.toggleFaceCamera.bind(this);
    this.toggleRadiusAzimuthElevation = this.toggleRadiusAzimuthElevation.bind(this);
    this.setRef = this.setRef.bind(this);
  }

  setRef(what) {
    return (element) => {
      this[what] = element;
    };
  }

  toggleFaceCamera() {
    const {
      api, isFacingCamera, selectedBrowser, selectedTarget,
    } = this.props;
    const uriBrowser = `ScreenSpace.${selectedBrowser}.FaceCamera`;
    api.setPropertyValueSingle(uriBrowser, !isFacingCamera);
  }

  toggleRadiusAzimuthElevation() {
    const {
      api, isUsingRae, selectedBrowser, selectedTarget,
    } = this.props;
    const uriBrowser = `ScreenSpace.${selectedBrowser}.UseRadiusAzimuthElevation`;
    api.setPropertyValueSingle(uriBrowser, !isUsingRae);
  }

  get positionRae() {
    if (!this.raeInfo) {
      return { top: '0px', left: '0px' };
    }
    const { top, right } = this.raeInfo.getBoundingClientRect();
    return { top: `${top}`, left: `${right}` };
  }

  valueToColor(color) {
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: 1.0,
    };
  }

  render() {
      const { isUsingRae, isFacingCamera, selectedBrowser, target } = this.props;
      if (!target) {
        return '';
      }
      // Take half to display in ranges [0,1] instead of [0,2]
      const size = target.size;
      const colors = target.color;
      const colorData = ['Border Color: Red', 'Green', 'Blue'];
      const sizeData = ['Browser Width', 'Browser Height'];
      const positionData = ['Radius', 'Azimuth', 'Elevation'];
      const maxPosition = [10, 3.14, 3.14];
      const minPosition = [0, -3.14, -3.14];
      const precisionHigh = 10;
      const precisionLow = 2;
      const { api } = this.props;
      const { skybrowserApi } = this.props;
      const renderCopies = target.renderCopies;

      const renderCopiesButtons = renderCopies ? Object.values(renderCopies).map((entry, indexCopy) => {
              return <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
                {entry.map((number, index) => {
                  return <NumericInput
                    className={positionData[index]}
                    label={positionData[index]}
                    max={maxPosition[index]}
                    min={minPosition[index]}
                    onValueChanged={(newValue) => {
                      const newVector = entry;
                      newVector[index] = newValue;
                      skybrowserApi.moveRenderCopy(selectedBrowser, indexCopy, newVector);
                    }}
                    step={0.1}
                    value={parseFloat((number).toFixed(precisionLow))}
                    placeholder={`value ${index}`}
                  />;
                })}
              </Row>;
            }) : "";

      const renderCopiesSection = (
        <div>
          <Row className={styles.buttonContainer}>
            <Button
              onClick={() => {
                skybrowserApi.addRenderCopy(selectedBrowser);
              }}
              className={styles.renderCopyButton}
              transparent
            >
              Add Copy
            </Button>
            <Button
              onClick={() => {
                skybrowserApi.removeRenderCopy(selectedBrowser);
              }}
              className={styles.renderCopyButton}
              transparent
            >
              Remove Copy
            </Button>
          </Row>
          {renderCopies && renderCopiesButtons}
        </div>);

      // TODO: Fix color picker
      const colorPicker = (
        <ColorPickerPopup
          disableAlpha
          color={this.valueToColor(target.color)}
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
            disabled={!skybrowserApi.setVerticalFov}
            onValueChanged={(fov) => {
              skybrowserApi.setVerticalFov(selectedBrowser, fov);
            }}
            step={1}
            value={parseFloat(target.FOV.toFixed(precisionHigh))}
            placeholder="value 0"
          />
          <Row>
            {size.map((value, index) => (
              <NumericInput
                className={sizeData[index]}
                label={sizeData[index]}
                max={1}
                min={0.1}
                onValueChanged={(newValue) => {
                  size[index] = newValue * 2;
                  skybrowserApi.setScreenSpaceSize(selectedBrowser, size[0], size[1]);
                }}
                step={0.1}
                value={parseFloat((value * 0.5).toFixed(precisionLow))}
                placeholder={`value ${index}`}
              />
            ))}
          </Row>
          <Row>
            <NumericInput
              className="Right Ascension"
              label="Right Ascension"
              max={360}
              min={0}
              disabled={!skybrowserApi.setVerticalFov}
              onValueChanged={value => skybrowserApi.setEquatorialAim(selectedBrowser, value, target.dec)
              }
              step={0.1}
              value={parseFloat(target.ra.toFixed(precisionHigh))}
              placeholder="value 1"
            />
            <NumericInput
              className="Declination"
              label="Declination"
              max={90}
              min={-90}
              disabled={!skybrowserApi.setVerticalFov}
              onValueChanged={value => skybrowserApi.setEquatorialAim(selectedBrowser, target.ra, value)
              }
              step={0.1}
              value={parseFloat(target.dec.toFixed(precisionHigh))}
              placeholder="value 2"
            />
          </Row>
          <div
            ref={this.setRef('raeInfo')}
            onMouseEnter={() => this.setState({ showSettingsRaeInfo : true})}
            onMouseLeave={() => this.setState({ showSettingsRaeInfo : false})}
          >
          <Checkbox
            label="Use Radius Azimuth Elevation"
            checked={isUsingRae}
            left={false}
            disabled={false}
            setChecked={this.toggleRadiusAzimuthElevation}
            wide
            style={{ width: '100%'}}
          />
          {
            this.state.showSettingsRaeInfo && (
              <TooltipSkybrowser placement="bottom-right" style={this.positionRae}>
                {"Using RAE coordinates is going to disable interaction with the sky browser."}
              </TooltipSkybrowser>
            )
          }
          </div>
          <Checkbox
            label="Face Camera"
            checked={isFacingCamera}
            left={false}
            disabled={false}
            setChecked={this.toggleFaceCamera}
            wide
          />
          <Row className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
            {colors.map((color, index) => (
              <NumericInput
                className={colorData[index]}
                label={colorData[index]}
                max={255}
                min={0}
                onValueChanged={(value) => {
                  const newColor = colors;
                  newColor[index] = value;
                  skybrowserApi.setBorderColor(
                    selectedBrowser,
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

SkybrowserSettings.propTypes = {
  isUsingRae: PropTypes.bool,
  isFacingCamera: PropTypes.bool,
  selectedBrowser: PropTypes.string,
  target: PropTypes.object
};

SkybrowserSettings.defaultProps = {
};

export default SkybrowserSettings;
