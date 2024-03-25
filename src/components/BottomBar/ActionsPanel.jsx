import React from 'react';
import { MdArrowBack, MdDashboard, MdFolder } from 'react-icons/md';
import { connect, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { setActionsPath, setPopoverVisibility, triggerAction } from '../../api/Actions';
import { ObjectWordBeginningSubstring } from '../../utils/StringMatchers';
import subStateToProps from '../../utils/subStateToProps';
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

function ActionsPanel({
  actionLevel,
  actionPath,
  allActions,
  displayedNavigationPath,
  navigationPath,
  singlewindow
}) {
  const popoverVisible = useSelector((state) => state.local.popovers.actions.visible);

  const dispatch = useDispatch();

  function togglePopover() {
    dispatch(setPopoverVisibility({
      popover: 'actions',
      visible: !popoverVisible
    }));
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
    return Object.keys(level.children).sort().map((key) => folderButton(key));
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
    return allActions.map(
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
    const folders = isEmpty ? <div>No Children</div> : getFoldersContent(actionLevel);
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

const mapSubStateToProps = ({ actions }) => {
  const actionsMapped = { '/': { actions: [], children: {} } };
  if (!actions.isInitialized) {
    return {
      actions: actionsMapped,
      navigationPath: '/',
      displayedNavigationPath: '/'
    };
  }

  for (let i = 0; i < actions.data.shortcuts.length; i++) {
    const action = actions.data.shortcuts[i];
    if (action.key) {
      continue;
    }

    // If there is no backslash at beginning of GUI path, add that manually
    // (there should always be though)
    if (action.guiPath.length > 0 && action.guiPath[0] !== '/') {
      action.guiPath = `/${action.guiPath}`;
    }

    let splits = action.guiPath.split('/');
    // Remove all empty strings: which is what we get before initial slash and
    // if the path is just a slash
    splits = splits.filter((s) => s !== '');

    let parent = actionsMapped['/'];

    // Add to top level actions (no gui path)
    if (splits.length === 0) {
      parent.actions.push(action);
    }

    // Add actions of other levels
    while (splits.length > 0) {
      const index = splits.shift();
      if (parent.children[index] === undefined) {
        parent.children[index] = { actions: [], children: {} };
      }
      if (splits.length === 0) {
        parent.children[index].actions.push(action);
      } else {
        parent = parent.children[index];
      }
    }
  }

  const navPath = actions.navigationPath;
  let actionsForPath = actionsMapped['/'];
  if (navPath.length > 1) {
    const splits = navPath.split('/');
    splits.shift();
    while (splits.length > 0) {
      const index = splits.shift();
      actionsForPath = actionsForPath.children[index];
    }
  }

  const allActions = actions.data.shortcuts.filter((action) => {
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

  // Truncate navigation path if too long
  const NAVPATH_LENGTH_LIMIT = 60;
  const shouldTruncate = actions.navigationPath.length > NAVPATH_LENGTH_LIMIT;

  let truncatedPath = actions.navigationPath;
  if (shouldTruncate) {
    let originalPath = navPath;
    if (originalPath[0] === '/') {
      originalPath = originalPath.substring(1);
    }
    const pieces = originalPath.split('/');
    if (pieces.length > 1) {
      // TODO: maybe keep more pieces of the path, if possible?
      truncatedPath = `/${pieces[0]}/.../${pieces[pieces.length - 1]}`;
    } else {
      truncatedPath = navPath.substring(0, NAVPATH_LENGTH_LIMIT);
    }
  }

  return {
    actionLevel: actionsForPath,
    navigationPath: actions.navigationPath,
    displayedNavigationPath: truncatedPath,
    allActions
  };
};

const mapStateToSubState = (state) => ({
  actions: state.shortcuts
});

const mapDispatchToProps = (dispatch) => ({
  trigger: (action) => {
    dispatch(triggerAction(action));
  },
  actionPath: (action) => {
    dispatch(setActionsPath(action));
  }
});

ActionsPanel.propTypes = {
  actionLevel: PropTypes.object,
  actionPath: PropTypes.func.isRequired,
  allActions: PropTypes.arrayOf(PropTypes.object),
  displayedNavigationPath: PropTypes.string.isRequired,
  navigationPath: PropTypes.string.isRequired,
  singlewindow: PropTypes.bool
};

ActionsPanel.defaultProps = {
  actionLevel: undefined,
  allActions: undefined,
  singlewindow: false
};

ActionsPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(ActionsPanel);

export default ActionsPanel;
