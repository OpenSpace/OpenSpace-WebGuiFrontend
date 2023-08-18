import React from 'react';
import { MdLocationOn } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import * as geometry from 'spherical-geometry-js';

import {
  reloadPropertyTree,
  setPopoverVisibility
} from '../../api/Actions';
import { useLocalStorageState } from '../../utils/customHooks';
import AnimatedCheckmark from '../common/AnimatedCheckmark/AnimatedCheckmark';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Dropdown from '../common/DropDown/Dropdown';
import { FilterList, FilterListData } from '../common/FilterList/FilterList';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import Input from '../common/Input/Input/Input';
import NumericInput from '../common/Input/NumericInput/NumericInput';
import Popover from '../common/Popover/Popover';

import Picker from './Picker';

import styles from './GeoPositionPanel.scss';

// @TODO: Put in its own file, somewhere in common
function MultiStateToggle({
  labels, checked, setChecked, infoText
}) {
  return (
    <div className={styles.wrapper}>
      <p
        className={`${styles.toggleTitle} ${styles.resultsTitle}`}
        id="multiStateToggle"
      >
        Mode
      </p>
      {infoText && (
        <InfoBox
          panelscroll="multiStateToggle"
          text={infoText}
          style={{ paddingTop: '3px', paddingRight: '3px' }}
        />
      )}
      <div className={styles.toggles}>
        {labels.map((label) => (
          <React.Fragment key={`${label}fragment`}>
            <input
              id={label}
              key={label}
              className={styles.toggle_option}
              name="state-d"
              type="radio"
              onChange={() => setChecked(label)}
              checked={label === checked ? 'checked' : ''}
            />
            <label
              htmlFor={label}
              key={`${label}label`}
            >
              {label}
            </label>
          </React.Fragment>
        ))}
        <div className={styles.toggle_option_slider} />
      </div>
    </div>
  );
}

MultiStateToggle.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
  checked: PropTypes.string.isRequired,
  setChecked: PropTypes.func,
  infoText: PropTypes.string
};

MultiStateToggle.defaultProps = {
  setChecked: () => {},
  infoText: undefined
};

const Interaction = {
  flyTo: 'Fly To',
  jumpTo: 'Jump To',
  addFocus: 'Add Focus'
};

function createSceneGraphNodeTable(globe, label, lat, long, alt) {
  const table = {
    Identifier: label,
    Parent: globe,
    Transform: {
      Translation: {
        Type: 'GlobeTranslation',
        Globe: globe,
        Latitude: Number(lat),
        Longitude: Number(long),
        Altitude: 0
      }
    },
    InteractionSphere: Number(alt),
    GUI: {
      Path: '/GeoLocation'
    }
  };
  return table;
}

function Place({ address, onClick, found }) {
  return (
    <Button
      onClick={onClick}
      className={styles.place}
    >
      <div className={styles.placeButton}>
        <p>{address}</p>
        {found && (
          <div style={{ width: '20px', height: '20px' }}>
            <AnimatedCheckmark style={{ width: '20px', height: '20px' }} color="transparent" isAnimated={false} />
          </div>
        )}
      </div>
    </Button>
  );
}

Place.propTypes = {
  address: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  found: PropTypes.bool.isRequired
};

function GeoPositionPanel() {
  const [inputValue, setInputValue] = useLocalStorageState('inputValue', '');
  const [places, setPlaces] = useLocalStorageState('places', undefined);
  const [addedSceneGraphNodes, setAddedSceneGraphNodes] = useLocalStorageState('addedSceneGraphNodes', undefined);
  const [latitude, setLatitude] = useLocalStorageState('latitude', 0);
  const [longitude, setLongitude] = useLocalStorageState('longitude', 0);
  const [altitude, setAltitude] = useLocalStorageState('altitude', '300');
  const [interaction, setInteraction] = useLocalStorageState('interaction', Interaction.flyTo);
  const [currentAnchor, setCurrentAnchor] = useLocalStorageState('anchor', 'Earth');
  const [customNodeCounter, setCustomNodeCounter] = useLocalStorageState('counter', 0);
  const options = ['Earth'];

  const luaApi = useSelector((state) => state.luaApi);
  const popoverVisible = useSelector((state) => state.local.popovers.geoposition.visible);

  const dispatch = useDispatch();

  function refresh() {
    dispatch(reloadPropertyTree());
  }

  function togglePopover() {
    dispatch(setPopoverVisibility({
      popover: 'geoposition',
      visible: !popoverVisible
    }));
  }

  function calculateAltitude(extent) {
    // Get lat long corners of polygon
    const nw = new geometry.LatLng(extent.ymax, extent.xmin);
    const ne = new geometry.LatLng(extent.ymax, extent.xmax);
    const sw = new geometry.LatLng(extent.ymin, extent.xmin);
    const se = new geometry.LatLng(extent.ymin, extent.xmax);
    // Distances are in meters
    const height = geometry.computeDistanceBetween(nw, sw);
    const lengthBottom = geometry.computeDistanceBetween(sw, se);
    const lengthTop = geometry.computeDistanceBetween(nw, ne);
    const maxLength = Math.max(lengthBottom, lengthTop);
    const largestDist = Math.max(height, maxLength);
    // 0.61 is the radian of 35 degrees - half of the standard horizontal field of view in OpenSpace
    return (0.5 * largestDist) / Math.tan(0.610865238);
  }

  function getPlaces() {
    if (inputValue === '') {
      setPlaces([]);
      return;
    }
    const searchString = inputValue.replaceAll(' ', '+');

    fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${searchString}&category=&outFields=*&forStorage=false&f=json`)
      .then((response) => response.json())
      .then((json) => {
        // Remove duplicates
        const uniqueLabels = [];
        const unique = json?.candidates.filter((place) => {
          const isDuplicate = uniqueLabels.includes(place.attributes.LongLabel);

          if (!isDuplicate) {
            uniqueLabels.push(place.attributes.LongLabel);
            return true;
          }
          return false;
        });
        setPlaces(unique);
      })
      .catch((error) => console.error('Error fetching: ', error));
  }

  function pushSceneGraphNode(nodeId) {
    // Deep copy
    const nodes = [...addedSceneGraphNodes];
    nodes.push(nodeId);
    setAddedSceneGraphNodes(nodes);
  }

  function selectCoordinate(location, address, extent) {
    const lat = location.y;
    const long = location.x;
    const alt = extent ? calculateAltitude(extent) : altitude * 1000;
    switch (interaction) {
      case Interaction.flyTo: {
        luaApi?.globebrowsing?.flyToGeo(currentAnchor, lat, long, alt);
        break;
      }
      case Interaction.jumpTo: {
        luaApi?.globebrowsing?.goToGeo(currentAnchor, lat, long, alt);
        break;
      }
      case Interaction.addFocus: {
      // Don't add if it is already added
        if (addedSceneGraphNodes.indexOf(address) > -1) {
          break;
        }
        pushSceneGraphNode(address);
        let addressUtf8 = '';
        for (let i = 0; i < address.length; i++) {
          if (address.charCodeAt(i) <= 127) {
            addressUtf8 += address.charAt(i);
          }
        }
        addressUtf8 = addressUtf8.replaceAll(' ', '_');
        addressUtf8 = addressUtf8.replaceAll(',', '');
        luaApi?.addSceneGraphNode(
          createSceneGraphNodeTable(currentAnchor, addressUtf8, lat, long, alt)
        );
        // TODO: Once we have a proper way to subscribe to additions and removals
        // of property owners, this 'hard' refresh should be removed.
        setTimeout(() => refresh(), 300);
        break;
      }
      default: {
        luaApi?.globebrowsing?.flyToGeo(currentAnchor, lat, long, alt);
        break;
      }
    }
  }

  function enterLatLongAlt() {
    if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(altitude)) {
      console.warn('Coordinate is not a number');
      return;
    }
    const place = { y: latitude, x: longitude };
    selectCoordinate(place, `Custom Coordinate ${customNodeCounter}`);
    setCustomNodeCounter(customNodeCounter + 1);
  }

  function anchorPanel(anchor) {
    switch (anchor) {
      case 'Earth':
        return (
          <>
            <hr className={Popover.styles.delimiter} />
            <div className={styles.searchField}>
              <Input
                placeholder="Search places..."
                onEnter={() => getPlaces()}
                onChange={(e) => {
                  setInputValue(e.target.value);
                }}
                clearable
              />
              <Button onClick={() => getPlaces()}>Search</Button>
            </div>
            <p className={styles.resultsTitle}>Results</p>
            {places && (
              (places.length < 4) ? places?.map?.((place) => {
                const address = place.attributes.LongLabel;
                const found = Boolean(addedSceneGraphNodes.indexOf(address) > -1);
                return (
                  <Place
                    key={place.attributes.LongLabel}
                    onClick={() => selectCoordinate(place.location, address, place.extent)}
                    address={address}
                    found={found}
                  />
                );
              }) :
                (
                  <FilterList
                    searchText="Filter results..."
                    height="210px"
                  >
                    <FilterListData>
                      {places?.map?.((place) => {
                        const address = place.attributes.LongLabel;
                        const found = Boolean(addedSceneGraphNodes.indexOf(address) > -1);
                        return (
                          <Place
                            key={place.attributes.LongLabel}
                            onClick={() => selectCoordinate(place.location, address, place.extent)}
                            address={address}
                            found={found}
                          />
                        );
                      })}
                    </FilterListData>
                  </FilterList>
                )
            )}
            <div
              className={styles.content}
              style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%'
              }}
            >
              <hr className={Popover.styles.delimiter} />
              <p className={styles.resultsTitle} style={{ padding: '5px 0px' }}>
                Custom Coordinate
              </p>
              <div className={styles.latLongInput}>
                <NumericInput
                  placeholder="Latitude"
                  onValueChanged={(value) => {
                    setLatitude(value);
                  }}
                  value={latitude}
                  min={-90}
                  max={90}
                />
                <NumericInput
                  placeholder="Longitude"
                  onValueChanged={(value) => {
                    setLongitude(value);
                  }}
                  value={longitude}
                  min={-180}
                  max={180}
                />
                <NumericInput
                  placeholder="Altitude (km)"
                  onValueChanged={(value) => {
                    setAltitude(value);
                  }}
                  value={altitude}
                  min={0}
                  max={1000}
                />
                <Button
                  onClick={() => enterLatLongAlt()}
                  className={styles.latLongButton}
                >
                  {interaction}
                </Button>
              </div>
            </div>
          </>
        );
      default:
        return (
          <CenteredLabel>
            {`Currently there is no data for locations on ${currentAnchor}`}
          </CenteredLabel>
        );
    }
  }

  function popover() {
    return (
      <Popover
        className={`${Picker.Popover} ${styles.geoPositionPanel}`}
        title="Geo location"
        closeCallback={() => togglePopover()}
        detachable
        attached
      >
        <div className={styles.content}>
          <MultiStateToggle
            title="Mode"
            labels={Object.values(Interaction)}
            checked={interaction}
            setChecked={setInteraction}
            infoText={"'Fly to' will fly the camera to the position, " +
                "'Jump to' will place the camera at the position instantaneously and " +
                "'Add Focus' will add a scene graph node at the position."}
          />
          <Dropdown
            options={options}
            onChange={(anchor) => setCurrentAnchor(anchor.value)}
            value={currentAnchor}
            placeholder="Select an anchor"
          />
          {anchorPanel(currentAnchor)}
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        className={`${popoverVisible && Picker.Active}`}
        onClick={() => togglePopover()}
        refKey="GeoLocationPanel"
      >
        <MdLocationOn className={Picker.Icon} alt="geo-location" />
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

export default GeoPositionPanel;
