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
        <InfoBox inpanel panelscroll="actionscroller" text={action.documentation} />
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

  getBackButton() {
    if (this.props.navigationPath != '/') {
      return <Button block smalltext className={styles.backButton} onClick={this.goBack} key="backbtn">&lt;- Back</Button>;
    }
  }

  get windowContent() {
    const level = this.props.actionLevel;

    if (level == undefined) {
      return <div>Loading</div>;
    }
    const actionsContent = this.getActionContent(level);
    const childrenContent = this.getChildrenContent(level);
    const backButton = this.getBackButton();
    return (
      <div id="actionscroller" className={styles.windowContainer}>
        <hr className={Popover.styles.delimiter} />
        <Row>
          <div>
            {this.props.navigationPath}
            {' '}
          </div>
        </Row>
        <hr className={Popover.styles.delimiter} />
        <div className={styles.Grid}>
          {backButton}
          {actionsContent}
          {childrenContent}
        </div>
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
          <p><MaterialIcon className={styles.buttonIcon} icon="launch" /></p>
          Show Keybindings
          <InfoBox inpanel panelscroll="actionscroller" text="Shows the keybinding vieiwer" />
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
        <div id="actionscroller" className={`${Popover.styles.content} ${styles.scroller}`}>
          <hr className={Popover.styles.delimiter} />
          <Row>
            <div className={Popover.styles.title}>
              {navPathString}
              {' '}
            </div>
          </Row>
          <hr className={Popover.styles.delimiter} />
          <div className={styles.Grid}>
            {backButton}
            {actionsContent}
            {childrenContent}
            {keybindsContent}
          </div>
        </div>
      </Popover>
    );
  }

  render() {
    const {
      popoverVisible, actionLevel, navigationPath, singlewindow,
    } = this.props;
    if (singlewindow) {
      return (
        <div>
          { this.windowContent }
        </div>
      );
    }
    return (
      <div className={Picker.Wrapper}>
        <Picker
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

  return {
    actionLevel: actionsForPath,
    popoverVisible,
    luaApi,
    navigationPath: actions.navigationPath,
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
