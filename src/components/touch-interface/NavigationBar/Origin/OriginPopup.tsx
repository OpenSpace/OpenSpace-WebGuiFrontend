import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import Aim from 'svg-react-loader?name=Aim!../../../../icons/aim.svg';
// import Anchor from 'svg-react-loader?name=Anchor!../../../../icons/anchor.svg';
// import Focus from 'svg-react-loader?name=Focus!../../../../icons/focus.svg';

import { RiFocus3Line } from 'react-icons/ri';
import { IoTelescopeOutline } from 'react-icons/io5';
import { LiaAnchorSolid } from 'react-icons/lia';
import {
  sendFlightControl,
  setNavigationAction,
  subscribeToCameraPath,
  subscribeToEngineMode,
  unsubscribeToCameraPath,
  unsubscribeToEngineMode,
  subscribeToSessionRecording,
  unsubscribeToSessionRecording
} from '../../../../api/Actions';
import {
  NavigationAimKey,
  NavigationAnchorKey,
  RetargetAimKey,
  RetargetAnchorKey
} from '../../../../api/keys';
import propertyDispatcher from '../../../../api/propertyDispatcher';

import {
  FilterList,
  FilterListData,
  FilterListFavorites,
  FilterListShowMoreButton
} from '../../common/FilterList/FilterList';

import FocusEntry from './FocusEntry';
import styles from './OriginPicker.scss';

interface PropertyOwner {
  name: string;
  identifier: string;
  subowners?: string[];
  tags?: string[];
}

interface Property {
  value?: string;
}

interface State {
  propertyTree: {
    properties: Record<string, Property>;
    propertyOwners: Record<string, PropertyOwner>;
  };
  local: {
    originPicker: {
      action: string;
    };
  };
}

interface NavigationActionPayload {
  type: string;
  focus: string;
  aim: string;
  anchor: string;
  retargetAim?: boolean;
  retargetAnchor?: boolean;
  resetVelocities?: boolean;
}

const NavigationActions = {
  Focus: 'Focus',
  Anchor: 'Anchor',
  Aim: 'Aim'
};

const InterestingTag = 'GUI.Interesting';

function OriginPopup() {
  const propertyOwners = useSelector((state: State) => state.propertyTree.propertyOwners);
  const properties = useSelector((state: State) => state.propertyTree.properties);
  const dispatch = useDispatch();

  const scene = propertyOwners.Scene;
  const uris = scene ? scene.subowners || [] : [];

  const allNodes = uris.map((uri) => ({
    ...propertyOwners[uri],
    key: uri
  }));

  function hasInterestingTag(uri: string) {
    return propertyOwners[uri].tags?.some((tag) => tag.includes(InterestingTag));
  }

  const urisWithTags = uris.filter((uri) => hasInterestingTag(uri));
  const favorites = urisWithTags.map((uri) => ({
    ...propertyOwners[uri],
    key: uri
  }));

  const searchableNodes = allNodes.filter((node) => {
    const isHiddenProp = properties[`${node.key}.GuiHidden`];
    const isHidden = isHiddenProp && isHiddenProp.value;
    return !isHidden;
  });

  const anchor = useSelector((state: State) => {
    const anchorProp = state.propertyTree.properties[NavigationAnchorKey];
    return anchorProp && anchorProp.value;
  });

  const aim = useSelector((state: State) => {
    const aimProp = state.propertyTree.properties[NavigationAimKey];
    return aimProp && aimProp.value;
  });
  // const aimName = useSelector((state) => {
  //   const aimNode = state.propertyTree.propertyOwners[ScenePrefixKey + aim];
  //   return aimNode ? aimNode.name : aim;
  // });

  const navigationAction = useSelector((state: State) => state.local.originPicker.action);

  // Use refs so these aren't recalculated each render and trigger useEffect
  const anchorDispatcher = React.useRef(propertyDispatcher(dispatch, NavigationAnchorKey));
  const aimDispatcher = React.useRef(propertyDispatcher(dispatch, NavigationAimKey));
  const retargetAnchorDispatcher = React.useRef(propertyDispatcher(dispatch, RetargetAnchorKey));
  const retargetAimDispatcher = React.useRef(propertyDispatcher(dispatch, RetargetAimKey));

  React.useEffect(() => {
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
    dispatch(subscribeToCameraPath());
    return () => {
      dispatch(unsubscribeToSessionRecording());
      dispatch(unsubscribeToEngineMode());
      dispatch(unsubscribeToCameraPath());
    };
  }, []);

  React.useEffect(() => {
    anchorDispatcher.current.subscribe();
    return () => anchorDispatcher.current.unsubscribe();
  }, [anchorDispatcher.current]);

  React.useEffect(() => {
    aimDispatcher.current.subscribe();
    return () => aimDispatcher.current.unsubscribe();
  }, [aimDispatcher.current]);

  function hasDistinctAim() {
    return aim !== '' && aim !== anchor;
  }

  const onSelect = (identifier: string, evt: React.MouseEvent<HTMLDivElement>) => {
    const updateViewPayload: NavigationActionPayload = {
      type: 'updateView',
      focus: '',
      aim: '',
      anchor: ''
    };

    if (navigationAction === NavigationActions.Focus) {
      updateViewPayload.aim = '';
      updateViewPayload.focus = identifier;
      updateViewPayload.anchor = '';
    } else if (navigationAction === NavigationActions.Anchor) {
      if (aim === '') {
        updateViewPayload.aim = anchor || '';
      }
      updateViewPayload.anchor = identifier;
    } else if (navigationAction === NavigationActions.Aim) {
      updateViewPayload.aim = identifier;
      updateViewPayload.aim = anchor || '';
    }

    if (!evt.shiftKey) {
      if (navigationAction === NavigationActions.Aim) {
        retargetAimDispatcher.current.set(null);
      } else {
        retargetAnchorDispatcher.current.set(null);
      }
    }

    const shouldRetargetAim = !evt.shiftKey && updateViewPayload.aim != null;
    const shouldRetargetAnchor = !evt.shiftKey && updateViewPayload.aim == null;

    updateViewPayload.retargetAim = shouldRetargetAim;
    updateViewPayload.retargetAnchor = shouldRetargetAnchor;
    updateViewPayload.resetVelocities = !evt.ctrlKey;

    dispatch(sendFlightControl(updateViewPayload));

    if (updateViewPayload.aim) {
      anchorDispatcher.current.set(updateViewPayload.anchor);
      aimDispatcher.current.set(updateViewPayload.aim);
    } else if (updateViewPayload.anchor !== '') {
      anchorDispatcher.current.set(updateViewPayload.anchor);
    } else {
      anchorDispatcher.current.set(updateViewPayload.focus);
      aimDispatcher.current.set(updateViewPayload.aim);
    }
  };

  function dispatchSetNavigationAction(action: string) {
    dispatch(setNavigationAction(action));
  }

  const defaultList = favorites.slice();

  // Make sure current anchor is in the default list
  if (anchor !== undefined && !defaultList.find((node) => node.identifier === anchor)) {
    const anchorNode = allNodes.find((node) => node.identifier === anchor);
    if (anchorNode) {
      defaultList.push(anchorNode);
    }
  }

  // Make sure current aim is in the default list
  if (hasDistinctAim() && !defaultList.find((node) => node.identifier === aim)) {
    const aimNode = allNodes.find((node) => node.identifier === aim);
    if (aimNode) {
      defaultList.push(aimNode);
    }
  }

  const sortedDefaultList = defaultList.slice(0).sort((a, b) => a.name.localeCompare(b.name));
  const sortedNodes = searchableNodes.slice(0).sort((a, b) => a.name.localeCompare(b.name));

  const searchPlaceholder =
    {
      Focus: 'Search for a new focus...',
      Anchor: 'Search for a new anchor...',
      Aim: 'Search for a new aim...'
    }[navigationAction] || 'Search...';

  const isInFocusMode = navigationAction === NavigationActions.Focus;
  const active = navigationAction === NavigationActions.Aim ? aim : anchor;

  return (
    <div>
      <div className={styles.row}>
        <div
          className={styles.NavigationButton}
          onClick={() => dispatchSetNavigationAction(NavigationActions.Focus)}
          title='Select focus'
        >
          <div className={styles.TabIcon}>
            <RiFocus3Line />
          </div>

          <span className={styles.TabText}>Focus</span>
        </div>
        <div
          className={styles.NavigationButton}
          onClick={() => dispatchSetNavigationAction(NavigationActions.Anchor)}
          title='Select anchor'
        >
          <div className={styles.TabIcon}>
            <LiaAnchorSolid />
          </div>
          <span className={styles.TabText}>Anchor</span>
        </div>
        <div
          className={styles.NavigationButton}
          onClick={() => dispatchSetNavigationAction(NavigationActions.Aim)}
          title='Select aim'
        >
          <div className={styles.TabIcon}>
            <IoTelescopeOutline />
          </div>
          <span className={styles.TabText}>Aim</span>
        </div>
      </div>

      <FilterList className={styles.list} searchText={searchPlaceholder}>
        <FilterListShowMoreButton id='' toggleShowDataInstead={() => {}} showDataInstead={true} />

        <FilterListFavorites className={styles.grid}>
          {sortedDefaultList.map((entry) => (
            <FocusEntry
              onSelect={onSelect}
              active={active}
              showNavigationButtons={isInFocusMode}
              {...entry}
            />
          ))}
        </FilterListFavorites>
        <FilterListData searchString='' ignorePropsFilter={[]} className={styles.grid}>
          {sortedNodes.map((entry) => (
            <FocusEntry
              onSelect={onSelect}
              active={active}
              showNavigationButtons={isInFocusMode}
              {...entry}
            />
          ))}
        </FilterListData>
      </FilterList>
    </div>
  );
}

export default OriginPopup;
