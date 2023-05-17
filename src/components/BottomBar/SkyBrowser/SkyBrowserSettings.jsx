import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  SkyBrowser_AllowCameraRotationKey,
  SkyBrowser_BrowserAnimationSpeedKey,
  SkyBrowser_CameraRotationSpeedKey,
  SkyBrowser_HideTargetsBrowsersWithGuiKey,
  SkyBrowser_InverseZoomDirectionKey,
  SkyBrowser_ShowTitleInBrowserKey,
  SkyBrowser_SpaceCraftAnimationTimeKey,
  SkyBrowser_TargetAnimationSpeedKey
} from '../../../api/keys';
import ColorPickerPopup from '../../common/ColorPicker/ColorPickerPopup';
import InfoBox from '../../common/InfoBox/InfoBox';
import Button from '../../common/Input/Button/Button';
import Checkbox from '../../common/Input/Checkbox/Checkbox';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';
import ToggleContent from '../../common/ToggleContent/ToggleContent';
import Property from '../../Sidebar/Properties/Property';

import styles from './SkyBrowserSettings.scss';

function SkyBrowserSettings({
  setBorderRadius
}) {
  const [showExpandedCopies, setShowExpandedCopies] = React.useState(false);
  const [showExpandedSettings, setShowExpandedSettings] = React.useState(false);
  const [generalSettingsExpanded, setGeneralSettingsExpanded] = React.useState(false);
  const [newPosition, setNewPosition] = React.useState([0, 0, -2]);
  const [noOfCopies, setNoOfCopies] = React.useState(1);

  const browser = useSelector((state) => state.skybrowser.browsers[state.skybrowser.selectedBrowserId]);
  const selectedBrowserId = useSelector((state) => state.skybrowser.selectedBrowserId);
  const luaApi = useSelector((state) => state.luaApi);

  const PrecisionLow = 2;
  const PrecisionHigh = 10;
  // Cartesian
  const CartesianStartVector = [0, 0, -2];
  const CartesianRange = { min: [-4, -4, -10], max: [4, 4, 0] };
  const CartesianLabels = ['X', 'Y', 'Z'];
  // Radius, Azimuth, Elevation
  const RaeStartVector = [2, 0, 0];
  const RaeRange = { min: [0, -3.14, -3.14], max: [10, 3.14, 3.14] };
  const RaeLabels = ['Radius', 'Azimuth', 'Elevation'];

  React.useEffect(() => {
    setNewPosition(browser.isUsingRae ? RaeStartVector : CartesianStartVector);
  }, []);

  if (!browser) {
    return null;
  }

  function toggleFaceCamera() {
    const uriBrowser = `ScreenSpace.${browser.id}.FaceCamera`;
    luaApi.setPropertyValueSingle(uriBrowser, !browser.isFacingCamera);
  }

  function toggleRadiusAzimuthElevation() {
    const uriBrowser = `ScreenSpace.${browser.id}.UseRadiusAzimuthElevation`;
    luaApi.setPropertyValueSingle(uriBrowser, !browser.isUsingRae);
    setNewPosition(browser.isUsingRae ? CartesianStartVector : RaeStartVector);
  }

  function valueToColor(color) {
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: 1.0
    };
  }

  function onColorPickerChange(color) {
    const { rgb } = color;
    luaApi.skybrowser.setBorderColor(
      selectedBrowserId,
      rgb.r,
      rgb.g,
      rgb.b,
    );
  }

  function createDisplayCopiesSection() {
    const { displayCopies } = browser;
    const positionData = browser.isUsingRae ? RaeLabels : CartesianLabels;
    const maxPosition = browser.isUsingRae ? RaeRange.max : CartesianRange.max;
    const minPosition = browser.isUsingRae ? RaeRange.min : CartesianRange.min;
    const newPositionVector = newPosition;

    const displayCopiesButtons = displayCopies && Object.values(displayCopies).map((entry, indexCopy) => (
      <Row key={indexCopy} className={styles.vectorProperty}>
        <Checkbox
          label=""
          checked={entry.show}
          left={false}
          disabled={false}
          setChecked={(value) => {
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
            value={parseFloat((number).toFixed(PrecisionLow))}
            placeholder={`value ${index}`}
          />
        ))}
      </Row>
    ));

    return (
      <ToggleContent
        title="Display Copies"
        expanded={showExpandedCopies}
        setExpanded={setShowExpandedCopies}
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
          value={parseFloat(browser.scale.toFixed(PrecisionLow))}
          placeholder="value 2"
        />
        <Checkbox
          label="Face Camera"
          checked={browser.isFacingCamera}
          left={false}
          disabled={false}
          setChecked={toggleFaceCamera}
          wide
        />
        <Checkbox
          label="Use Radius Azimuth Elevation"
          checked={browser.isUsingRae}
          left={false}
          disabled={false}
          setChecked={toggleRadiusAzimuthElevation}
          wide
          style={{ width: '100%' }}
        />
        <ToggleContent
          title="Add Copy Settings"
          expanded={showExpandedSettings}
          setExpanded={setShowExpandedSettings}
        >
          <NumericInput
            label="Number of Copies"
            max={5}
            min={1}
            onValueChanged={(newValue) => setNoOfCopies(newValue)}
            step={1}
            value={noOfCopies}
            placeholder="value"
          />
          <Row>
            <header>
              Position for first copy
            </header>
            <InfoBox
              text="This sets the position of the first copy. The additional copies will be evenly spread out on the Azimuth."
            />
          </Row>
          <Row className={styles.vectorProperty}>
            {newPositionVector.map((number, index) => (
              <NumericInput
                key={index}
                className={positionData[index]}
                label={positionData[index]}
                max={maxPosition[index]}
                min={minPosition[index]}
                onValueChanged={(newValue) => {
                  const newVector = newPosition;
                  newVector[index] = newValue;
                  setNewPosition(newVector);
                }}
                step={0.1}
                value={parseFloat((number).toFixed(PrecisionLow))}
                placeholder={`value ${index}`}
              />
            ))}
          </Row>
        </ToggleContent>
        <Row className={styles.buttonContainer}>
          <Button
            onClick={() => {
              luaApi.skybrowser.addDisplayCopy(selectedBrowserId, noOfCopies, newPosition);
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

  const colorValues = browser.color;
  const colorLabels = ['Border Color: R', 'G', 'B'];
  const displayDisplaySection = createDisplayCopiesSection();

  const colorPicker = (
    <ColorPickerPopup
      className={styles.colorPicker}
      disableAlpha
      color={valueToColor(browser.color)}
      onChange={onColorPickerChange}
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
        value={parseFloat(browser.fov.toFixed(PrecisionHigh))}
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
          value={parseFloat(browser.ra.toFixed(PrecisionHigh))}
          placeholder="value 1"
        />
        <NumericInput
          label="Declination"
          max={90}
          min={-90}
          disabled={!luaApi.skybrowser.setVerticalFov}
          onValueChanged={(value) => luaApi.skybrowser.setEquatorialAim(selectedBrowserId, browser.ra, value)}
          step={0.1}
          value={parseFloat(browser.dec.toFixed(PrecisionHigh))}
          placeholder="value 2"
        />
      </Row>
      <Row className={styles.vectorProperty}>
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
      <Property uri={`Scene.${browser.targetId}.Renderable.ApplyRoll`} />
      <Property uri={`ScreenSpace.${selectedBrowserId}.PointSpacecraft`} />
      {displayDisplaySection}
      <ToggleContent
        title="General Settings"
        expanded={generalSettingsExpanded}
        setExpanded={setGeneralSettingsExpanded}
      >
        <NumericInput
          label="Border Radius"
          max={1}
          min={0}
          onValueChanged={(value) => {
            luaApi.skybrowser.setBorderRadius(browser.id, value);
            setBorderRadius(value);
          }}
          step={0.01}
          value={browser.borderRadius}
          placeholder="value 2"
        />
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

SkyBrowserSettings.propTypes = {
  browser: PropTypes.object,
  luaApi: PropTypes.object,
  selectedBrowserId: PropTypes.string,
  setBorderRadius: PropTypes.func
};

export default SkyBrowserSettings;
