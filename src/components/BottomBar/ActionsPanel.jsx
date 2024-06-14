import React from 'react';
import { MdArrowBack, MdDashboard, MdFolder } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import { setActionsPath, setPopoverVisibility } from '../../api/Actions';
import { ObjectWordBeginningSubstring } from '../../utils/StringMatchers';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import { FilterList, FilterListData, FilterListFavorites } from '../common/FilterList/FilterList';
import HorizontalDelimiter from '../common/HorizontalDelimiter/HorizontalDelimiter';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import ActionsButton from './Actions/ActionsButton';
import Picker from './Picker';

import buttonStyles from './Actions/ActionsButton.scss';
import styles from './ActionsPanel.scss';

function actionsForLevel(actions, navigationPath, isInitialized) {
  const actionsMapped = { '/': { actions: [], folders: {} } };
  if (!isInitialized) {
    return actionsMapped['/'];
  }
  for (const action of actions) {
    if (action.key) {
      continue;
    }

    // If there is no backslash at beginning of GUI path, add that manually
    // (there should always be though)
    if (action.guiPath.length > 0 && action.guiPath[0] !== '/') {
      action.guiPath = `/${action.guiPath}`;
    }

    let guiFolders = action.guiPath.split('/');
    // Remove all empty strings: which is what we get before initial slash and
    // if the path is just a slash
    guiFolders = guiFolders.filter((s) => s !== '');

    // Add to top level actions (no gui path)
    if (guiFolders.length === 0) {
      actionsMapped['/'].actions.push(action);
    }

    // Add actions of other levels
    let parent = actionsMapped['/'];
    while (guiFolders.length > 0) {
      const folderName = guiFolders.shift();
      if (parent.folders[folderName] === undefined) {
        parent.folders[folderName] = { actions: [], folders: {} };
      }
      if (guiFolders.length === 0) {
        parent.folders[folderName].actions.push(action);
      } else {
        parent = parent.folders[folderName];
      }
    }
  }
  const navPath = navigationPath;
  let actionsForPath = actionsMapped['/'];
  if (navPath.length > 1) {
    const folders = navPath.split('/');
    folders.shift();
    while (folders.length > 0) {
      const folderName = folders.shift();
      actionsForPath = actionsForPath.folders[folderName];
    }
  }
  return actionsForPath;
}

// Truncate navigation path if too long
function truncatePath(navigationPath) {
  const NAVPATH_LENGTH_LIMIT = 60;
  const shouldTruncate = navigationPath > NAVPATH_LENGTH_LIMIT;

  let truncatedPath = navigationPath;
  if (shouldTruncate) {
    let originalPath = navigationPath;
    if (originalPath[0] === '/') {
      originalPath = originalPath.substring(1);
    }
    const pieces = originalPath.split('/');
    if (pieces.length > 1) {
      // TODO: maybe keep more pieces of the path, if possible?
      truncatedPath = `/${pieces[0]}/.../${pieces[pieces.length - 1]}`;
    } else {
      truncatedPath = navigationPath.substring(0, NAVPATH_LENGTH_LIMIT);
    }
  }

  return truncatedPath;
};

function getDisplayedActions(allActions, navPath) {
  return allActions.filter((action) => {
    // Don't display the shortcuts when searching
    if (action.key) {
      return false;
    }
    if (navPath.length === 1) {
      return true;
    }
    const navPathGui = navPath.split('/');
    const actionPathGui = action.guiPath?.split('/');
    for (let i = 0; i < navPathGui.length; i++) {
      if (actionPathGui?.[i] !== navPathGui[i]) {
        return false;
      }
    }
    return true;
  });
}

function ActionsPanel({
  singlewindow
}) {
  const popoverVisible = useSelector((state) => state.local.popovers.actions.visible);
  const navigationPath = useSelector((state) => state.shortcuts.navigationPath);
  const isInitialized = useSelector((state) => state.shortcuts.isInitialized);
  const allActions = useSelector(state => state.shortcuts.data);

  const actionLevel = actionsForLevel(allActions, navigationPath, isInitialized);
  const displayedNavigationPath = truncatePath(navigationPath);
  const displayedActions = getDisplayedActions(allActions, navigationPath);

  const dispatch = useDispatch();

  function togglePopover() {
    dispatch(setPopoverVisibility({
      popover: 'actions',
      visible: !popoverVisible
    }));
  }

  function actionPath(action) {
    dispatch(setActionsPath(action));
  }

  function addNavPath(e) {
    let navString = navigationPath;
    if (navigationPath === '/') {
      navString += e.currentTarget.getAttribute('foldername');
    } else {
      navString += `/${e.currentTarget.getAttribute('foldername')}`;
    }
    actionPath(navString);
  }

  function goBack() {
    let navString = navigationPath;
    navString = navString.substring(0, navString.lastIndexOf('/'));
    if (navString.length === 0) {
      navString = '/';
    }
    actionPath(navString);
  }

  function folderButton(key) {
    return (
      <Button
        block
        smalltext
        onClick={addNavPath}
        key={key}
        foldername={key}
        className={`${buttonStyles.actionButton} ${styles.button} ${styles.folderButton}`}
      >
        <p>
          <MdFolder className={buttonStyles.buttonIcon} alt="folder" />
        </p>
        {key}
      </Button>
    );
  }

  function getFoldersContent(level) {
    return Object.keys(level.folders).sort().map((key) => folderButton(key));
  }

  function getActionContent(level) {
    if (level.actions.length === 0) {
      return null;
    }
    return level.actions.map(
      (action) => (
        <ActionsButton
          className={`${styles.button}`}
          action={action}
          key={`${action.identifier}Action`}
        />
      )
    );
  }

  function getAllActions() {
    return displayedActions.map(
      (action) => (
        <ActionsButton
          className={`${styles.button}`}
          action={action}
          key={`${action.identifier}Filtered`}
        />
      )
    );
  }

  function getBackButton() {
    if (navigationPath !== '/') {
      return (
        <Button block className={styles.backButton} onClick={goBack} key="backbtn">
          <MdArrowBack className={styles.buttonIcon} alt="arrow_back" />
        </Button>
      );
    }
    return null;
  }

  function matcher(test, search) {
    return ObjectWordBeginningSubstring(test.action, search);
  }

  function actionsContent(filterListHeight) {
    if (actionLevel === undefined) {
      return <CenteredLabel>Loading...</CenteredLabel>;
    }
    const isEmpty = (actionLevel.length === 0);
    const actions = isEmpty ? <div>No Actions</div> : getActionContent(actionLevel);
    const folders = isEmpty ? <div>No Folders</div> : getFoldersContent(actionLevel);
    const backButton = getBackButton();

    return (
      <>
        <HorizontalDelimiter />
        <Row className={styles.navPathRow}>
          {backButton}
          <div className={styles.navPathTitle}>
            {`${displayedNavigationPath}`}
          </div>
        </Row>
        <HorizontalDelimiter />
        <FilterList matcher={matcher} height={filterListHeight}>
          <FilterListFavorites className={styles.Grid}>
            {folders}
            {actions}
          </FilterListFavorites>
          <FilterListData className={styles.Grid}>
            {getAllActions()}
          </FilterListData>
        </FilterList>
      </>
    );
  }

  function windowContent() {
    const height = '80%';
    return (
      <div id="actionscroller" className={`${styles.windowContainer}`}>
        {actionLevel ? actionsContent(height) : <div>Loading...</div> }
      </div>
    );
  }

  function popover() {
    const height = '310px'; // A bit ugly, but makes filterlist size correctly
    return (
      <Popover
        className={`${Picker.Popover} ${styles.actionsPanel}`}
        title="Actions"
        closeCallback={togglePopover}
        detachable
        attached
      >
        <div id="actionscroller" className={`${Popover.styles.content}`}>
          {actionsContent(height)}
        </div>
      </Popover>
    );
  }

  if (singlewindow) {
    return windowContent();
  }
  return (
    <div className={Picker.Wrapper}>
      <Picker
        refKey="Actions"
        className={`${popoverVisible && Picker.Active}`}
        onClick={togglePopover}
      >
        <div>
          <MdDashboard className={Picker.Icon} alt="dashboard" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

ActionsPanel.defaultProps = {
  singlewindow: false
};

export default ActionsPanel;
