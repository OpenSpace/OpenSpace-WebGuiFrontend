import React from 'react';
import { connect } from 'react-redux';
import { setActionsPath, setPopoverVisibility, triggerAction } from '../../api/Actions';
import subStateToProps from '../../utils/subStateToProps';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import styles from './ActionsPanel.scss';
import Picker from './Picker';
import { FilterList, FilterListData, FilterListFavorites } from '../common/FilterList/FilterList';
import { ObjectWordBeginningSubstring } from '../../utils/StringMatchers';

function ActionsPanel ({
  actionLevel,
  actionPath,
  allActions,
  displayedNavigationPath,
  level,
  luaApi,
  navigationPath,
  popoverVisible,
  setPopoverVisibility,
  singlewindow,
}) {
  function togglePopover() {
    setPopoverVisibility(!popoverVisible);
  }

  function addNavPath(e) {
    let navString = navigationPath;
    if (navigationPath == '/') {
      navString += e.currentTarget.getAttribute('foldername');
    } else {
      navString += `/${e.currentTarget.getAttribute('foldername')}`;
    }
    actionPath(navString);
  }

  function goBack(e) {
    let navString = navigationPath;
    navString = navString.substring(0, navString.lastIndexOf('/'));
    if (navString.length == 0) {
      navString = '/';
    }
    actionPath(navString);
  }

  function sendAction(e) {
    const actionId = e.currentTarget.getAttribute('actionid');
    luaApi.action.triggerAction(actionId);
  }

  function actionsButton(action, key) {
    const isLocal = (action.synchronization === false);
    return (
      <Button
        block
        smalltext
        onClick={sendAction}
        key={key}
        className={styles.actionButton}
        actionid={action.identifier}
      >
        <p><MaterialIcon className={styles.buttonIcon} icon="launch" /></p>
        {action.name} {' '}
        {action.documentation && <InfoBox text={action.documentation} />}
        {isLocal && <p className={styles.localText}>(Local)</p>}
      </Button>
    );
  }

  function getActionContent(level) {
    return level.actions.map((action) => actionsButton(action, action.identifier));
  }

  function getChildrenContent(level) {
    return Object.keys(level.children).map((key) => (
      <Button
        block
        smalltext
        onClick={addNavPath}
        key={key}
        foldername={key}
        className={`${styles.actionButton} ${styles.folderButton}`}
      >
        <p><MaterialIcon className={styles.buttonIcon} icon="folder" /></p>
        {key}
      </Button>
    ));
  }

  function getAllActions() {
    return allActions.map((action) => actionsButton(action, `${action.identifier}Filtered`));
  }

  function getBackButton() {
    if (navigationPath != '/') {
      return (
        <Button block className={styles.backButton} onClick={goBack} key="backbtn">
          <MaterialIcon className={styles.buttonIcon} icon="arrow_back" />
        </Button>
      );
    }
  }

  function matcher(test, search) {
    return ObjectWordBeginningSubstring(test.children, search);
  }

  function windowContent() {
    if (level == undefined) {
      return <div>Loading</div>;
    }

    return (
      <div id="actionscroller" className={`${styles.windowContainer}`}>
        <hr className={Popover.styles.delimiter} />
        <Row>
          {getBackButton()}
          <div className={styles.navPathTitle}>
            {`${displayedNavigationPath}`}
          </div>
        </Row>
        <hr className={Popover.styles.delimiter} />
        <FilterList matcher={matcher} height={'80%'}>
          <FilterListFavorites className={styles.Grid}>
            {getActionContent(level)}
            {getChildrenContent(level)}
          </FilterListFavorites>
          <FilterListData className={styles.Grid}>
            {getAllActions()}
          </FilterListData>
        </FilterList>
      </div>
    );
  }

  function popover() {
    const isEmpty = (actionLevel.length === 0);
    const actionsContent = isEmpty ? <div>No Actions</div> : getActionContent(actionLevel);
    const childrenContent = isEmpty ? <div>No Children</div> : getChildrenContent(actionLevel);
    const backButton = getBackButton();

    return (
      <Popover
        className={`${Picker.Popover} ${styles.actionsPanel}`}
        title="Actions"
        closeCallback={togglePopover}
        detachable
        attached
      >
        <div id="actionscroller" className={`${Popover.styles.content}`}>
          <hr className={Popover.styles.delimiter} />
          <Row className={styles.navPathRow}>
            {backButton}
            <div className={styles.navPathTitle}>
              {`${displayedNavigationPath}`}
            </div>
          </Row>
          <hr className={Popover.styles.delimiter} />
          <FilterList matcher={matcher} height={backButton ? '280px' : '320px'}>
            <FilterListFavorites className={styles.Grid}>
              {childrenContent}
              {actionsContent}
            </FilterListFavorites>
            <FilterListData className={styles.Grid}>
              {getAllActions()}
            </FilterListData>
          </FilterList>
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
          <MaterialIcon className={styles.bottomBarIcon} icon="dashboard" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

const mapSubStateToProps = ({ popoverVisible, luaApi, actions }) => {
  const actionsMapped = { '/': { actions: [], children: {} } };
  if (!actions.isInitialized) {
    return {
      actions: actionsMapped,
      popoverVisible,
      luaApi,
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
      action.guiPath = '/' + action.guiPath;
    }

    let splits = action.guiPath.split('/');
    // Remove all empty strings: which is what we get before initial slash and
    // if the path is just a slash
    splits = splits.filter((s) => s !== "");

    let parent = actionsMapped['/'];

    // Add to top level actions (no gui path)
    if (splits.length == 0) {
      parent.actions.push(action);
    }

    // Add actions of other levels
    while (splits.length > 0) {
      var index = splits.shift();
      if (parent.children[index] == undefined) {
        parent.children[index] = { actions: [], children: {} };
      }
      if (splits.length == 0) {
        parent.children[index].actions.push(action);
      } else {
        parent = parent.children[index];
      }
    }
  }

  const navPath = actions.navigationPath;
  let actionsForPath = actionsMapped['/'];
  if (navPath.length > 1) {
    var splits = navPath.split('/');
    splits.shift();
    while (splits.length > 0) {
      var index = splits.shift();
      actionsForPath = actionsForPath.children[index];
    }
  }

  const allActions = actions.data.shortcuts.filter(action => {
    if (navPath.length === 1) {
      return true;
    }
    else {
      var navPathGui = navPath.split('/');
      var actionPathGui = action.guiPath?.split('/');
      for (let i = 0; i < navPathGui.length; i++) {
        if (actionPathGui?.[i] !== navPathGui[i]) {
          return false;
        }
      }
      return true;
    }
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
    let pieces = originalPath.split('/');
    if (pieces.length > 1) {
      // TODO: maybe keep more pieces of the path, if possible?
      truncatedPath = `/${pieces[0]}/.../${pieces[pieces.length - 1]}`;
    } else {
      truncatedPath = navPath.substring(0, NAVPATH_LENGTH_LIMIT);
    }
  }

  return {
    actionLevel: actionsForPath,
    popoverVisible,
    luaApi,
    navigationPath: actions.navigationPath,
    displayedNavigationPath: truncatedPath,
    allActions: allActions,
  };
};

const mapStateToSubState = (state) => ({
  popoverVisible: state.local.popovers.actions.visible,
  luaApi: state.luaApi,
  actions: state.shortcuts,
});

const mapDispatchToProps = (dispatch) => ({
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'actions',
      visible,
    }));
  },
  trigger: (action) => {
    dispatch(triggerAction(action));
  },
  actionPath: (action) => {
    dispatch(setActionsPath(action));
  },
});

ActionsPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(ActionsPanel);

export default ActionsPanel;
