import React, { Component } from 'react';
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

class ActionsPanel extends Component {
  constructor(props) {
    super(props);
    this.togglePopover = this.togglePopover.bind(this);
    this.sendAction = this.sendAction.bind(this);
    this.addNavPath = this.addNavPath.bind(this);
    this.goBack = this.goBack.bind(this);
    this.getActionContent = this.getActionContent.bind(this);
    this.getChildrenContent = this.getChildrenContent.bind(this);
    this.getBackButton = this.getBackButton.bind(this);
    this.getAllActions = this.getAllActions.bind(this);
    this.matcher = this.matcher.bind(this);
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
  }

  addNavPath(e) {
    const { navigationPath } = this.props;
    let navString = navigationPath;
    if (navigationPath == '/') {
      navString += e.currentTarget.getAttribute('foldername');
    } else {
      navString += `/${e.currentTarget.getAttribute('foldername')}`;
    }
    this.props.actionPath(navString);
  }

  goBack(e) {
    const { navigationPath } = this.props;
    let navString = navigationPath;
    navString = navString.substring(0, navString.lastIndexOf('/'));
    if (navString.length == 0) {
      navString = '/';
    }
    this.props.actionPath(navString);
  }

  sendAction(e) {
    const { luaApi } = this.props;
    const actionId = e.currentTarget.getAttribute('actionid');
    luaApi.action.triggerAction(actionId);
  }

  getActionContent(level) {
    return level.actions.map((action) => (
      <Button
        block
        smalltext
        onClick={this.sendAction}
        key={action.identifier}
        className={styles.actionButton}
        actionid={action.identifier}
      >
        <p><MaterialIcon className={styles.buttonIcon} icon="launch" /></p>
        {action.name}
        {action.documentation && <InfoBox text={action.documentation} />}
      </Button>
    ));
  }

  getChildrenContent(level) {
    return Object.keys(level.children).map((key) => (
      <Button
        block
        smalltext
        onClick={this.addNavPath}
        key={key}
        foldername={key}
        className={`${styles.actionButton} ${styles.folderButton}`}
      >
        <p><MaterialIcon className={styles.buttonIcon} icon="folder" /></p>
        {key}
      </Button>
    ));
  }

  getAllActions() {
    const { allActions } = this.props;
    return allActions.map((action) => (
      <Button
        block
        smalltext
        onClick={this.sendAction}
        key={`${action.identifier}Filtered`}
        className={styles.actionButton}
        actionid={action.identifier}
        name={action.name}
      >
        <p><MaterialIcon className={styles.buttonIcon} icon="launch" /></p>
        {action.name}
      </Button>
    ));
  }

  getBackButton() {
    const { navigationPath } = this.props;
    if (navigationPath != '/') {
      return <Button block className={styles.backButton} onClick={this.goBack} key="backbtn">
        <MaterialIcon className={styles.buttonIcon} icon="arrow_back" />
      </Button>;
    }
  }

  matcher(test, search) {
    return ObjectWordBeginningSubstring(test.children, search);
  }

  get windowContent() {
    const { displayedNavigationPath, level } = this.props;

    if (level == undefined) {
      return <div>Loading</div>;
    }
    const actionsContent = this.getActionContent(level);
    const childrenContent = this.getChildrenContent(level);
    const backButton = this.getBackButton();
    
    return (
      <div id="actionscroller" className={`${styles.windowContainer}`}>
        <hr className={Popover.styles.delimiter} />
          <Row>
            {backButton}
            <div className={styles.navPathTitle}>
              {`${displayedNavigationPath}`}
            </div>
          </Row>
        <hr className={Popover.styles.delimiter} />
        <FilterList matcher={this.matcher} height={'80%'}>
          <FilterListFavorites className={styles.Grid}>
            {actionsContent}
            {childrenContent}
          </FilterListFavorites>
          <FilterListData className={styles.Grid}>
            {this.getAllActions()}
          </FilterListData>
        </FilterList>
      </div>
    );
  }

  get popover() {
    const { actionLevel, displayedNavigationPath } = this.props;
    let actionsContent;
    let childrenContent;
    let backButton;

    if (actionLevel.length == 0) {
      actionsContent = <div>No Actions</div>;
      childrenContent = <div>No Children</div>;
    } else {
      const level = actionLevel;
      actionsContent = this.getActionContent(level);
      childrenContent = this.getChildrenContent(level);
      backButton = this.getBackButton();
    }

    return (
      <Popover
        className={`${Picker.Popover} ${styles.actionsPanel}`}
        title="Actions"
        closeCallback={this.togglePopover}
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
          <FilterList matcher={this.matcher} height={backButton ? '280px' : '320px'}>
            <FilterListFavorites className={styles.Grid}>
              {childrenContent}
              {actionsContent}
            </FilterListFavorites>
            <FilterListData className={styles.Grid}>
              {this.getAllActions()}
            </FilterListData>
          </FilterList>
        </div>
      </Popover>
    );
  }

  render() {
    const { popoverVisible, singlewindow } = this.props;
    if (singlewindow) {
      return (this.windowContent);
    }
    return (
      <div className={Picker.Wrapper}>
        <Picker
          refKey="Actions"
          className={`${popoverVisible && Picker.Active}`}
          onClick={this.togglePopover}
        >
          <div>
            <MaterialIcon className={styles.bottomBarIcon} icon="dashboard" />
          </div>
        </Picker>
        { popoverVisible && this.popover }
      </div>
    );
  }
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

    // If there is no backslach at beginning of GUI path, add that manually
    if (action.guiPath.length > 0 && action.guiPath[0] !== '/') {
      action.guiPath = '/' + action.guiPath;
    }

    var splits = action.guiPath.split('/');
    splits.shift();
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
