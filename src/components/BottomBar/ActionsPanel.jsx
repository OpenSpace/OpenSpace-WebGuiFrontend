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
    let navString = this.props.navigationPath;
    if (this.props.navigationPath == '/') {
      navString += e.currentTarget.getAttribute('foldername');
    } else {
      navString += `/${e.currentTarget.getAttribute('foldername')}`;
    }
    this.props.actionPath(navString);
  }

  goBack(e) {
    let navString = this.props.navigationPath;
    navString = navString.substring(0, navString.lastIndexOf('/'));
    if (navString.length == 0) {
      navString = '/';
    }
    this.props.actionPath(navString);
  }

  sendAction(e) {
    const actionId = e.currentTarget.getAttribute('actionid');
    this.props.luaApi.action.triggerAction(actionId);
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
    return this.props.allActions.map((action) => (
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
    if (this.props.navigationPath != '/') {
      return <Button block smalltext className={styles.backButton} onClick={this.goBack} key="backbtn">
        <MaterialIcon className={styles.buttonIcon} icon="arrow_back" /> Back
      </Button>;
    }
  }

  matcher(test, search) {
    return ObjectWordBeginningSubstring(test.children, search);
  }

  get windowContent() {
    const level = this.props.actionLevel;

    if (level == undefined) {
      return <div>Loading</div>;
    }
    const actionsContent = this.getActionContent(level);
    const childrenContent = this.getChildrenContent(level);
    const backButton = this.getBackButton();
    const navPathString = this.props.navigationPath;
    
    return (
      <div id="actionscroller" className={`${styles.windowContainer}`}>
        <hr className={Popover.styles.delimiter} />
          <Row>
            {backButton}
            <div className={styles.navPathTitle}>
              {` ${navPathString} `}
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
    let actionsContent;
    let childrenContent;
    let backButton;
    let keybindsContent;

    if (this.props.actionLevel.length == 0) {
      actionsContent = <div>No Actions</div>;
      childrenContent = <div>No Children</div>;
    } else {
      const level = this.props.actionLevel;
      actionsContent = this.getActionContent(level);
      childrenContent = this.getChildrenContent(level);
      backButton = this.getBackButton();
    }

    const navPathString = this.props.navigationPath;

    if (navPathString == '/') {
      keybindsContent = (
        <Button
          block
          smalltext
          onClick={this.props.toggleKeybinds}
          key="showKeybinds"
          className={styles.actionButton}
        >
          <p><MaterialIcon className={styles.buttonIcon} icon="keyboard" /></p>
          Show Keybindings
          <InfoBox text="Shows the keybinding viewer" />
        </Button>
      );
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
          <Row>
            {backButton}
            <div className={styles.navPathTitle}>
              {` ${navPathString} `}
            </div>
          </Row>
          <hr className={Popover.styles.delimiter} />
          <FilterList matcher={this.matcher} height={backButton ? '280px' : '320px'}>
            <FilterListFavorites className={styles.Grid}>
              {actionsContent}
              {childrenContent}
              {keybindsContent}
            </FilterListFavorites>
            <FilterListData className={styles.Grid}>
              {this.getAllActions()}
              {keybindsContent}
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
    };
  }

  for (let i = 0; i < actions.data.shortcuts.length; i++) {
    const action = actions.data.shortcuts[i];
    if (action.key) {
      continue;
    }

    // If there is no backslack at beginning of GUI path, add that manually
    if (action.guiPath.length > 0 && action.guiPath[0] !== '/') {
      action.guiPath = '/' + action.guiPath;
    }

    var splits = action.guiPath.split('/');
    splits.shift();
    let parent = actionsMapped['/'];
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

  return {
    actionLevel: actionsForPath,
    popoverVisible,
    luaApi,
    navigationPath: actions.navigationPath,
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
  toggleKeybinds: (action) => {
    dispatch(setPopoverVisibility({
      popover: 'keybinds',
      visible: true,
    }));
  },
});

ActionsPanel = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(ActionsPanel);

export default ActionsPanel;
