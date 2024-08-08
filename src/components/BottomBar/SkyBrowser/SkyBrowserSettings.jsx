import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import {
  SkyBrowserAllowCameraRotationKey,
  SkyBrowserBrowserAnimationSpeedKey,
  SkyBrowserCameraRotationSpeedKey,
  SkyBrowserHideTargetsBrowsersWithGuiKey,
  SkyBrowserInverseZoomDirectionKey,
  SkyBrowserShowTitleInBrowserKey,
  SkyBrowserSpaceCraftAnimationTimeKey,
  SkyBrowserTargetAnimationSpeedKey
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
import { subscribeToProperty, unsubscribeToProperty } from '../../../api/Actions';
import { useSubscribeToProperty } from '../../../utils/customHooks';

function SkyBrowserSettings({

}) {
  const [showExpandedCopies, setShowExpandedCopies] = React.useState(false);
  const [showExpandedSettings, setShowExpandedSettings] = React.useState(false);
  const [generalSettingsExpanded, setGeneralSettingsExpanded] = React.useState(false);
  const [newPosition, setNewPosition] = React.useState([0, 0, -2]);
  const [noOfCopies, setNoOfCopies] = React.useState(1);
  const api = useSelector((state) => state.luaApi);

  const selectedBrowserId = useSubscribeToProperty(`Modules.SkyBrowser.SelectedPairId`);
  const dispatch = useDispatch();

/*
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

  function createDisplayCopiesSection() {
    const { displayCopies } = browser;
    const positionData = browser.isUsingRae ? RaeLabels : CartesianLabels;
    const maxPosition = browser.isUsingRae ? RaeRange.max : CartesianRange.max;
    const minPosition = browser.isUsingRae ? RaeRange.min : CartesianRange.min;
    const newPositionVector = newPosition;

    const displayCopiesButtons = Object.values(displayCopies).map((entry, i) => (
      <Row key={entry.idShowProperty} className={styles.vectorProperty}>
        <Checkbox
          checked={entry.show}
          left={false}
          disabled={false}
          setChecked={(value) => {
            const uriBrowser = `ScreenSpace.${selectedBrowserId}.${entry.idShowProperty}`;
            luaApi.setPropertyValueSingle(uriBrowser, value);
          }}
          wide
        />
        {entry.position.map((number, j) => (
          <NumericInput
            key={`${displayCopies[i]}${positionData[j]}`}
            className={positionData[j]}
            label={positionData[j]}
            max={maxPosition[j]}
            min={minPosition[j]}
            onValueChanged={(newValue) => {
              const newVector = entry.position;
              newVector[j] = newValue;
              const displayCopyId = Object.keys(displayCopies)[i];
              const uriBrowser = `ScreenSpace.${selectedBrowserId}.${displayCopyId}`;
              luaApi.setPropertyValueSingle(uriBrowser, newVector);
            }}
            step={0.1}
            value={parseFloat((number).toFixed(PrecisionLow))}
            placeholder={`value ${j}`}
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
          checked={browser.isFacingCamera}
          left={false}
          disabled={false}
          setChecked={toggleFaceCamera}
          wide
        >
          <p>Face Camera</p>
        </Checkbox>
        <Checkbox
          checked={browser.isUsingRae}
          left={false}
          disabled={false}
          setChecked={toggleRadiusAzimuthElevation}
          wide
          style={{ width: '100%' }}
        >
          <p>Use Radius Azimuth Elevation</p>
        </Checkbox>
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
                key={`firstCopy${positionData[index]}`}
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

  const displayDisplaySection = createDisplayCopiesSection();

  );
*/
  return (
    <div>
      <Property uri={`Modules.SkyBrowser.${selectedBrowserId}.Roll`} />
      <Property uri={`Modules.SkyBrowser.${selectedBrowserId}.EquatorialAim`} />
      <Property uri={`Modules.SkyBrowser.${selectedBrowserId}.Color`} />
      <Property uri={`Modules.SkyBrowser.${selectedBrowserId}.PointSpacecraft`} />
      <Property uri={`Modules.SkyBrowser.${selectedBrowserId}.ApplyRoll`} />
      {/*
      {displayDisplaySection}
      */}
      <ToggleContent
        title="General Settings"
        expanded={generalSettingsExpanded}
        setExpanded={setGeneralSettingsExpanded}
      >
        <Property uri={`Modules.SkyBrowser.${selectedBrowserId}.BorderRadius`} />
        <Property uri={SkyBrowserShowTitleInBrowserKey} />
        <Property uri={SkyBrowserAllowCameraRotationKey} />
        <Property uri={SkyBrowserCameraRotationSpeedKey} />
        <Property uri={SkyBrowserTargetAnimationSpeedKey} />
        <Property uri={SkyBrowserBrowserAnimationSpeedKey} />
        <Property uri={SkyBrowserHideTargetsBrowsersWithGuiKey} />
        <Property uri={SkyBrowserInverseZoomDirectionKey} />
        <Property uri={SkyBrowserSpaceCraftAnimationTimeKey} />
      </ToggleContent>
    </div>
  );
}

SkyBrowserSettings.propTypes = {
};

export default SkyBrowserSettings;
