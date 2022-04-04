import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Input/Button/Button';
import Row from '../common/Row/Row';
import NumericInput from '../common/Input/NumericInput/NumericInput';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import ColorPickerPopup from '../common/ColorPicker/ColorPickerPopup';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import TooltipSkybrowser from './TooltipSkybrowser';
import Popover from '../common/Popover/Popover';
import styles from './SkybrowserSettings.scss';

class SkybrowserSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSettingsRaeInfo: false,
      showExpandedCopies: false,
      showExpandedSettings: false,
      precisionLow: 2,
      precisionHigh: 10,
      newPosition: [2.1, 0, 0],
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

  showExpandedCopySettings() {
    this.setState({ showExpandedSettings: !this.state.showExpandedSettings });
  }

  createRenderCopiesSection(target, api, skybrowserApi, selectedBrowser) {
    const renderCopies = target.renderCopies;
    const positionData = ['Radius', 'Azimuth', 'Elevation'];
    const maxPosition = [10, 3.14, 3.14];
    const minPosition = [0, -3.14, -3.14];
    const newPositionVector = this.state.newPosition;

    const renderCopiesButtons = renderCopies ? Object.values(renderCopies).map((entry, indexCopy) => {
            return <Row key={indexCopy} className={`${styles.vectorProperty} ${this.disabled ? styles.disabled : ''}`}>
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
                    const uriBrowser = `ScreenSpace.${selectedBrowser}.${renderCopyId}`;
                    api.setPropertyValueSingle(uriBrowser, newVector);
                  }}
                  step={0.1}
                  value={parseFloat((number).toFixed(this.state.precisionLow))}
                  placeholder={`value ${index}`}
                />;
              })}
            </Row>;
          }) : "";

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
            onValueChanged={(newValue) => {
              this.setState({
                noOfCopies : newValue
              });
            }}
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
            onMouseEnter={() => this.setState({ showCopiesInfo : true})}
            onMouseLeave={() => this.setState({ showCopiesInfo : false})}
            style={{fontSize: '15px'}}>
          </MaterialIcon>
          {
            this.state.showCopiesInfo && (
              <TooltipSkybrowser placement="bottom-right" style={this.copiesPosition}>
                {"This sets the position of the first copy. The additional copies will be evenly spread out on the Azimuth."}
              </TooltipSkybrowser>
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
                  this.setState({
                    newPosition : newVector
                  });
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
              skybrowserApi.addRenderCopy(selectedBrowser, this.state.noOfCopies, this.state.newPosition);
            }}
            className={styles.renderCopyButton}
            transparent
          >
            Add
          </Button>
          <Button
            onClick={() => {
              skybrowserApi.removeRenderCopy(selectedBrowser);
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
      const { isUsingRae, isFacingCamera, selectedBrowser, target } = this.props;
      if (!target) {
        return '';
      }
      // Take half to display in ranges [0,1] instead of [0,2]
      const size = target.size;
      const colors = target.color;
      const colorData = ['Border Color: Red', 'Green', 'Blue'];
      const sizeData = ['Browser Width', 'Browser Height'];
      const { api } = this.props;
      const { skybrowserApi } = this.props;

      const renderCopiesSection = this.createRenderCopiesSection(target, api, skybrowserApi, selectedBrowser);
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
            value={parseFloat(target.FOV.toFixed(this.state.precisionHigh))}
            placeholder="value 0"
          />
          <Row>
            {size.map((value, index) => (
              <NumericInput
                key = {index}
                className={sizeData[index]}
                label={sizeData[index]}
                max={1}
                min={0.1}
                onValueChanged={(newValue) => {
                  size[index] = newValue * 2;
                  skybrowserApi.setScreenSpaceSize(selectedBrowser, size[0], size[1]);
                }}
                step={0.1}
                value={parseFloat((value * 0.5).toFixed(this.state.precisionLow))}
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
              value={parseFloat(target.ra.toFixed(this.state.precisionHigh))}
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
              value={parseFloat(target.dec.toFixed(this.state.precisionHigh))}
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
                key={index}
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
