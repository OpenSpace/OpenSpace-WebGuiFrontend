import React from 'react';
import { MdArrowBack, MdFolder, MdOutlineFolder } from 'react-icons/md';
import { connect } from 'react-redux';

import { setActionsPath, triggerAction } from '../../../../api/Actions';
import { ObjectWordBeginningSubstring } from '../../../../utils/StringMatchers';
import subStateToProps from '../../../../utils/subStateToProps';

import {
  FilterList,
  FilterListData,
  FilterListFavorites
} from '../../common/FilterList/FilterList';
import Button from '../../../common/Input/Button/Button';
import Popover from '../../../common/Popover/Popover';

import ActionsButton from './ActionsButton';
import Picker from '../../../BottomBar/Picker';

import buttonStyles from './ActionsButton.scss';
import styles from './ActionsPanel.scss';

interface Action {
  [key: string]: any;
  key?: any;
  guiPath: string;
}

interface ActionLevel {
  actions: Action[];
  children: Record<string, ActionLevel>;
}

interface ActionsPanelProps {
  actionLevel?: ActionLevel;
  actionPath: (path: string) => void;
  allActions?: Action[];
  displayedNavigationPath: string;
  navigationPath: string;
}

function ActionsPanel({
  actionLevel = undefined,
  actionPath,
  allActions = undefined,
  displayedNavigationPath,
  navigationPath
}: ActionsPanelProps) {
  function addNavPath(e: React.MouseEvent<HTMLButtonElement>) {
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

  function folderButton(key: string) {
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
          <MdOutlineFolder className={buttonStyles.buttonIcon} title='folder' />
        </p>
        {key}
      </Button>
    );
  }

  function getFoldersContent(level: ActionLevel) {
    return Object.keys(level.children)
      .sort()
      .map((key) => folderButton(key));
  }

  function getActionContent(level: ActionLevel) {
    if (level.actions.length === 0) {
      return null;
    }
    return level.actions.map((action) => (
      <ActionsButton
        className={`${styles.button}`}
        action={action}
        key={`${action.identifier}Action`}
      />
    ));
  }

  function getAllActions() {
    return allActions?.map((action) => (
      <ActionsButton
        className={`${styles.button}`}
        action={action}
        key={`${action.identifier}Filtered`}
      />
    ));
  }

  function getBackButton() {
    if (navigationPath !== '/') {
      return (
        <div className={styles.backButton} onClick={goBack} key='backbtn'>
          <MdArrowBack className={styles.buttonIcon} title='arrow_back' />
        </div>
      );
    }
    return null;
  }

  function matcher(test: any, search: string) {
    return ObjectWordBeginningSubstring(test.action, search);
  }

  function actionsContent(filterListHeight: string) {
    if (actionLevel === undefined) {
      return <div>Loading...</div>;
    }
    const isEmpty =
      actionLevel.actions.length === 0 && Object.keys(actionLevel.children).length === 0;
    const actions = isEmpty ? <div>No Actions</div> : getActionContent(actionLevel);
    const folders = isEmpty ? <div>No Children</div> : getFoldersContent(actionLevel);
    const backButton = getBackButton();

    return (
      <>
        <hr className={Popover.styles.delimiter} />
        <div className={styles.navPathRow}>
          {backButton}
          <div className={styles.navPathTitle}>{`${displayedNavigationPath}`}</div>
        </div>
        <hr className={Popover.styles.delimiter} />
        <FilterList matcher={matcher} height={filterListHeight} searchText='Search...'>
          <FilterListFavorites>
            <div className={styles.gridContainer}>
              {folders}
              {actions}
            </div>
          </FilterListFavorites>
          <FilterListData>{getAllActions()}</FilterListData>
        </FilterList>
      </>
    );
  }

  return <div className={Picker.Wrapper}>{actionsContent('310px')}</div>;
}

interface ActionsState {
  isInitialized: boolean;
  data: {
    shortcuts: {
      key?: any;
      guiPath: string;
      [key: string]: any;
    }[];
  };
  navigationPath: string;
}

const mapSubStateToProps = ({ actions }: { actions: ActionsState }) => {
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

interface RootState {
  shortcuts: ActionsState;
}

const mapStateToSubState = (state: RootState) => ({
  actions: state.shortcuts
});

interface DispatchProps {
  trigger: (action: any) => void;
  actionPath: (action: string) => void;
}

const mapDispatchToProps = (dispatch: any): DispatchProps => ({
  trigger: (action) => {
    dispatch(triggerAction(action));
  },
  actionPath: (action) => {
    dispatch(setActionsPath(action));
  }
});

export default connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(ActionsPanel);
