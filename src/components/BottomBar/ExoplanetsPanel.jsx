import React from 'react';
import { MdHdrStrong, MdPublic } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import {
  loadExoplanetsData,
  reloadPropertyTree,
  removeExoplanets,
  setPopoverVisibility
} from '../../api/Actions';
import { NavigationAimKey, NavigationAnchorKey } from '../../api/keys';
import propertyDispatcher from '../../api/propertyDispatcher';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import { FilterList, FilterListData } from '../common/FilterList/FilterList';
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
  const exoplanetSystems = useSelector((state) => {
    // Find already existing systems
    const systems = Object.values(state.propertyTree.propertyOwners).filter(
      (owner) => owner.tags.includes('exoplanet_system')
    );
    return systems.map((owner) => `Scene.${owner.identifier}`);
  });
  const isDataInitialized = useSelector((state) => state.exoplanets.isInitialized);
  const anchor = useSelector((state) => state.propertyTree.properties[NavigationAnchorKey]);
  const systemList = useSelector((state) => state.exoplanets.data);
  const aim = useSelector((state) => state.propertyTree.properties[NavigationAimKey]);

  const hasSystems = systemList && systemList.length > 0;

  const showHabitableZone = useSelector(
    (state) => state.propertyTree.properties[HABITABLE_ZONE_PROPERTY].value
  );

  const showOrbitUncertainty = useSelector(
    (state) => state.propertyTree.properties[UNCERTAINTY_DISC_PROPERTY].value
  );

  const show1AuRing = useSelector(
    (state) => state.propertyTree.properties[SIZE_1AU_RING_PROPERTY].value
  );

  const dispatch = useDispatch();

  const showHabitableZoneDispatcher = propertyDispatcher(dispatch, HABITABLE_ZONE_PROPERTY);
  const showOrbitUncertaintyDispatcher = propertyDispatcher(dispatch, UNCERTAINTY_DISC_PROPERTY);
  const show1AuRingDispatcher = propertyDispatcher(dispatch, SIZE_1AU_RING_PROPERTY);

  React.useEffect(() => {
    if (!isDataInitialized) {
      dispatch(loadExoplanetsData(luaApi));
    }
  }, []);

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
    dispatch(setPopoverVisibility({
      popover: 'exoplanets',
      visible: !popoverVisible
    }));
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
    const matchingAnchor = (anchor.value.indexOf(systemName) === 0);
    const matchingAim = (aim.value.indexOf(systemName) === 0);
    if (matchingAnchor || matchingAim) {
      propertyDispatcher(dispatch, NavigationAnchorKey).set('Sun');
      propertyDispatcher(dispatch, NavigationAimKey).set('');
    }

    dispatch(removeExoplanets({ system: systemName }));
  }

  function addSystem() {
    luaApi.exoplanets.addExoplanetSystem(starName);
    // TODO: Once we have a proper way to subscribe to additions and removals
    // of property owners, this 'hard' refresh should be removed.
    setTimeout(() => {
      dispatch(reloadPropertyTree());
    }, 500);
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
        title="Exoplanet Systems"
        closeCallback={togglePopover}
        detachable
        attached
      >
        <div className={Popover.styles.content}>
          <Row>
            { hasSystems ? (
              <FilterList
                className={styles.list}
                searchText="Star name..."
              >
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
              <CenteredLabel className={styles.redText}>
                No exoplanet data was loaded
              </CenteredLabel>
            )}
            <div className={Popover.styles.row}>
              <Button
                onClick={addSystem}
                title="Add system"
                style={{ width: 90 }}
                disabled={!starName}
              >
                <MdPublic alt="add_system" />
                <span style={{ marginLeft: 5 }}>Add System</span>
              </Button>
            </div>
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <ToggleContent
          title="Settings"
          expanded={isSettingsExpanded}
          setExpanded={setSettingsExpanded}
        >
          <Checkbox
            checked={showHabitableZone}
            name="showHabitableZone"
            setChecked={toggleShowHabitableZone}
          >
            <p>Show Habitable Zones</p>
            <InfoBox
              className={styles.infoBox}
              text={`Show/Hide the habitable zone visualizations. Setting the value
              automatically updates the visibility for all added exoplanet systems`}
            />
          </Checkbox>
          <Checkbox
            checked={showOrbitUncertainty}
            name="showOrbitUncertainty"
            setChecked={toggleShowOrbitUncertainty}
          >
            <p>Show Orbit Uncertainty</p>
            <InfoBox
              className={styles.infoBox}
              text={`Show/Hide disc visualization of the uncertainty of the planetary
              orbits. Setting the value automatically updates the visibility for all
              added exoplanet systems`}
            />
          </Checkbox>
          <Checkbox
            checked={show1AuRing}
            name="show1AuRing"
            setChecked={toggleShow1AuRing}
          >
            <p>Show 1 AU Size Ring</p>
            <InfoBox
              className={styles.infoBox}
              text={`If true, show a ring with the radius 1 AU around the host star of
              each system, to use for size comparison. Setting the value automatically
              updates the visibility for all added exoplanet systems`}
            />
          </Checkbox>
        </ToggleContent>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Added Systems </div>
        <div className={styles.slideList}>
          <ScrollOverlay>
            {panelContent}
          </ScrollOverlay>
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker
        className={`${popoverVisible && Picker.Active}`}
        onClick={togglePopover}
        refKey="Exoplanets"
      >
        <div>
          <MdHdrStrong className={Picker.Icon} alt="exoplanets" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

export default ExoplanetsPanel;
