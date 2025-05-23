import React from 'react';
import { MdHdrStrong, MdPublic } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import { loadExoplanetsData, removeExoplanets, setPopoverVisibility } from '../../api/Actions';
import { NavigationAimKey, NavigationAnchorKey } from '../../api/keys';
import propertyDispatcher from '../../api/propertyDispatcher';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import { FilterList, FilterListData } from '../common/FilterList/FilterList';
import HorizontalDelimiter from '../common/HorizontalDelimiter/HorizontalDelimiter';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import PropertyOwner from '../Sidebar/Properties/PropertyOwner';

import FocusEntry from './Origin/FocusEntry';
import Picker from './Picker';

import styles from './ExoplanetsPanel.scss';

const UNCERTAINTY_DISC_TAG = 'exoplanet_uncertainty_disc';
const UNCERTAINTY_DISC_PROPERTY = 'Modules.Exoplanets.ShowOrbitUncertainty';
const HABITABLE_ZONE_TAG = 'exoplanet_habitable_zone';
const HABITABLE_ZONE_PROPERTY = 'Modules.Exoplanets.ShowHabitableZone';
const SIZE_1AU_RING_TAG = 'exoplanet_1au_ring';
const SIZE_1AU_RING_PROPERTY = 'Modules.Exoplanets.ShowComparisonCircle';

function ExoplanetsPanel() {
  const [starName, setStarName] = React.useState(undefined);
  const [isSettingsExpanded, setSettingsExpanded] = React.useState(false);

  const popoverVisible = useSelector((state) => state.local.popovers.exoplanets.visible);
  const luaApi = useSelector((state) => state.luaApi);
  const propertyOwners = useSelector((state) => state.propertyTree.propertyOwners);

  // Find already existing exoplent systems among the property owners
  const systems = Object.values(propertyOwners).filter((owner) =>
    owner.tags.includes('exoplanet_system')
  );
  const exoplanetSystems = systems.map((owner) => `Scene.${owner.identifier}`);

  const isDataInitialized = useSelector((state) => state.exoplanets.isInitialized);
  const systemList = useSelector((state) => state.exoplanets.data);
  const aim = useSelector((state) => {
    const aimProp = state.propertyTree.properties[NavigationAimKey];
    return aimProp && aimProp.value;
  });
  const anchor = useSelector((state) => {
    const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
    return anchorProp && anchorProp.value;
  });

  const hasSystems = systemList && systemList.length > 0;

  const showHabitableZone = useSelector(
    (state) => state.propertyTree.properties[HABITABLE_ZONE_PROPERTY]?.value
  );

  const showOrbitUncertainty = useSelector(
    (state) => state.propertyTree.properties[UNCERTAINTY_DISC_PROPERTY]?.value
  );

  const show1AuRing = useSelector(
    (state) => state.propertyTree.properties[SIZE_1AU_RING_PROPERTY]?.value
  );

  const dispatch = useDispatch();

  const showHabitableZoneDispatcher = propertyDispatcher(dispatch, HABITABLE_ZONE_PROPERTY);
  const showOrbitUncertaintyDispatcher = propertyDispatcher(dispatch, UNCERTAINTY_DISC_PROPERTY);
  const show1AuRingDispatcher = propertyDispatcher(dispatch, SIZE_1AU_RING_PROPERTY);

  React.useEffect(() => {
    if (!isDataInitialized && luaApi) {
      dispatch(loadExoplanetsData(luaApi));
    }
  }, [luaApi, isDataInitialized, dispatch]);

  React.useEffect(() => {
    showHabitableZoneDispatcher.subscribe();
    showOrbitUncertaintyDispatcher.subscribe();
    show1AuRingDispatcher.subscribe();
    return () => {
      showHabitableZoneDispatcher.unsubscribe();
      showOrbitUncertaintyDispatcher.unsubscribe();
      show1AuRingDispatcher.unsubscribe();
    };
  }, []);

  function togglePopover() {
    dispatch(
      setPopoverVisibility({
        popover: 'exoplanets',
        visible: !popoverVisible
      })
    );
  }

  function toggleShowHabitableZone() {
    const shouldShow = !showHabitableZone;
    showHabitableZoneDispatcher.set(shouldShow);
    // Also disable all previously enabled exoplanet habitable zones
    if (exoplanetSystems?.length > 0) {
      luaApi.setPropertyValue(`{${HABITABLE_ZONE_TAG}}.Renderable.Enabled`, shouldShow);
    }
  }

  function toggleShowOrbitUncertainty() {
    const shouldShow = !showOrbitUncertainty;
    showOrbitUncertaintyDispatcher.set(shouldShow);
    // Also disable all previously enabled exoplanet orbit uncertainty discs
    if (exoplanetSystems?.length > 0) {
      luaApi.setPropertyValue(`{${UNCERTAINTY_DISC_TAG}}.Renderable.Enabled`, shouldShow);
    }
  }

  function toggleShow1AuRing() {
    const shouldShow = !show1AuRing;
    show1AuRingDispatcher.set(shouldShow);
    // Also disable all previously enabled exoplanet orbit uncertainty discs
    if (exoplanetSystems?.length > 0) {
      luaApi.setPropertyValue(`{${SIZE_1AU_RING_TAG}}.Renderable.Enabled`, shouldShow);
    }
  }

  function removeExoplanetSystem(systemName) {
    const matchingAnchor = anchor.indexOf(systemName) === 0;
    const matchingAim = aim.indexOf(systemName) === 0;
    if (matchingAnchor || matchingAim) {
      propertyDispatcher(dispatch, NavigationAnchorKey).set('Sun');
      propertyDispatcher(dispatch, NavigationAimKey).set('');
    }

    dispatch(removeExoplanets({ system: systemName }));
  }

  function addSystem() {
    luaApi.exoplanets.addExoplanetSystem(starName);
  }

  function popover() {
    const noContentLabel = <CenteredLabel>No active systems</CenteredLabel>;
    const renderables = exoplanetSystems;
    let panelContent;

    if (renderables.length === 0) {
      panelContent = noContentLabel;
    } else {
      panelContent = renderables.map((prop) => (
        <PropertyOwner
          key={prop}
          uri={prop}
          trashAction={removeExoplanetSystem}
          expansionIdentifier={`P:${prop}`}
        />
      ));
    }
    return (
      <Popover
        className={Picker.Popover}
        title='Exoplanet Systems'
        closeCallback={togglePopover}
        detachable
        attached
      >
        <div className={Popover.styles.content}>
          <Row>
            {hasSystems ? (
              <FilterList className={styles.list} searchText='Star name...'>
                <FilterListData>
                  {systemList.map((system) => (
                    <FocusEntry
                      key={system.name}
                      onSelect={setStarName}
                      active={starName}
                      {...system}
                    />
                  ))}
                </FilterListData>
              </FilterList>
            ) : (
              <CenteredLabel className={styles.redText}>No exoplanet data was loaded</CenteredLabel>
            )}
            <div className={Popover.styles.row}>
              <Button
                onClick={addSystem}
                title='Add system'
                style={{ width: 90 }}
                disabled={!starName}
              >
                <MdPublic alt='add_system' />
                <span style={{ marginLeft: 5 }}>Add System</span>
              </Button>
            </div>
          </Row>
        </div>
        <HorizontalDelimiter />
        <ToggleContent
          title='Settings'
          expanded={isSettingsExpanded}
          setExpanded={setSettingsExpanded}
        >
          <Checkbox
            checked={showHabitableZone}
            name='showHabitableZone'
            setChecked={toggleShowHabitableZone}
          >
            <span className={styles.checkboxLabel}>Show Habitable Zones</span>
            <InfoBox
              className={styles.infoBox}
              text={`Show/Hide the habitable zone visualizations. Setting the value
              automatically updates the visibility for all added exoplanet systems`}
            />
          </Checkbox>
          <Checkbox
            checked={showOrbitUncertainty}
            name='showOrbitUncertainty'
            setChecked={toggleShowOrbitUncertainty}
          >
            <span className={styles.checkboxLabel}>Show Orbit Uncertainty</span>
            <InfoBox
              className={styles.infoBox}
              text={`Show/Hide disc visualization of the uncertainty of the planetary
              orbits. Setting the value automatically updates the visibility for all
              added exoplanet systems`}
            />
          </Checkbox>
          <Checkbox checked={show1AuRing} name='show1AuRing' setChecked={toggleShow1AuRing}>
            <span className={styles.checkboxLabel}>Show 1 AU Size Ring</span>
            <InfoBox
              className={styles.infoBox}
              text={`If true, show a ring with the radius 1 AU around the host star of
              each system, to use for size comparison. Setting the value automatically
              updates the visibility for all added exoplanet systems`}
            />
          </Checkbox>
        </ToggleContent>
        <HorizontalDelimiter />
        <div className={Popover.styles.title}>Added Systems </div>
        <div className={styles.slideList}>
          <ScrollOverlay>{panelContent}</ScrollOverlay>
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        className={`${popoverVisible && Picker.Active}`}
        onClick={togglePopover}
        refKey='Exoplanets'
      >
        <div>
          <MdHdrStrong className={Picker.Icon} alt='exoplanets' />
        </div>
      </Picker>
      {popoverVisible && popover()}
    </div>
  );
}

export default ExoplanetsPanel;
