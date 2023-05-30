import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  NavigationAnchorKey, RetargetAnchorKey, ScenePrefixKey
} from '../../../api/keys';
import propertyDispatcher from '../../../api/propertyDispatcher';
import { UpdateDeltaTimeNow } from '../../../utils/timeHelpers';

import FocusButton from './FocusButton';
import OverViewButton from './OverViewButton';

import styles from './FocusMenu.scss';

const DISTANCE_FACTOR = 4.0; // target radii
const SWITCH_FOCUS_DURATION = 5.0; // seconds

function FocusMenu() {
  const [origin, setOrigin] = React.useState('');

  const luaApi = useSelector((state) => state.luaApi);
  const overviewLimit = useSelector((state) => state.storyTree.story.overviewlimit);
  const anchor = useSelector((state) => state.propertyTree.properties[NavigationAnchorKey]);
  const focusNodes = useSelector((state) => {
    const buttons = state.storyTree.story.focusbuttons;
    let nodes = [];
    if (buttons) {
      nodes = buttons.map(
        (button) => state.propertyTree.propertyOwners[ScenePrefixKey + button]
      );
    }
    return nodes;
  });

  const dispatch = useDispatch();

  React.useEffect(() => {
    propertyDispatcher(dispatch, NavigationAnchorKey).subscribe();
    propertyDispatcher(dispatch, RetargetAnchorKey).subscribe();
    return () => {
      propertyDispatcher(dispatch, NavigationAnchorKey).unsubscribe();
      propertyDispatcher(dispatch, RetargetAnchorKey).unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (anchor !== undefined && origin !== anchor.value) {
      setOrigin(anchor.value);
    }
  }, [anchor]);


  function applyFlyTo() {
    luaApi.pathnavigation.zoomToDistanceRelative(DISTANCE_FACTOR, SWITCH_FOCUS_DURATION);
    // TODO: use camera path instead
  }

  async function onChangeFocus(newOrigin) {
    luaApi.pathnavigation.stopPath();

    // Reset time controls
    luaApi.time.setPause(false);
    UpdateDeltaTimeNow(luaApi, 1);

    propertyDispatcher(dispatch, NavigationAnchorKey).set(newOrigin);
    propertyDispatcher(dispatch, RetargetAnchorKey).set(null);
    applyFlyTo();
  }

  function applyOverview() {
    // TODO: Handle an interpolation of SetNavigationState to be able to have a
    // smooth navigation to a pre-defined overview location
    luaApi.pathnavigation.zoomToDistance(overviewLimit, SWITCH_FOCUS_DURATION);
  }

  function createFocusButtons() {
    const focusPicker = focusNodes.map((node) => (
      <FocusButton
        key={node.identifier}
        identifier={node.identifier}
        active={anchor.value}
        onChangeFocus={(o) => onChangeFocus(o)}
      />
    ));
    return (focusPicker);
  }

  return (
    <div className={styles.FocusMenu}>
      {anchor !== undefined && <OverViewButton onClick={applyOverview} /> }
      {focusNodes.length > 0 && createFocusButtons()}
    </div>
  );
}

export default FocusMenu;
