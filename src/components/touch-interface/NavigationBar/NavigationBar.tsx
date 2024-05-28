import React from 'react';
import styles from './NavigationBar.scss';
// import OriginPicker from '../../BottomBar/Origin/OriginPicker';
import OriginPicker from './Origin/OriginPicker';
import TimePicker from './Time/TimePicker';
import GeoPositionPanel from '../../BottomBar/GeoPositionPanel';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import {
  Md10K,
  MdLayers,
  MdOutlineAddBox,
  MdSettings,
  MdGridView,
  MdDashboard
} from 'react-icons/md';

import TabMenu from '../../Sidebar/TabMenu/TabMenu';
import TabMenuItem from '../../Sidebar/TabMenu/TabMenuItem';

import { connect, useDispatch, useSelector } from 'react-redux';
import { openDrawer } from '../../../api/Actions';

interface NavigationBarProps {
  showTutorial: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ showTutorial }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const dispatch = useDispatch();

  const handleOpenSystemDrawer = () => {
    dispatch(openDrawer('SystemDrawer'));
  };

  const handleOpenSceneDrawer = () => {
    dispatch(openDrawer('SceneDrawer'));
  };

  const handleOpenNavigationDrawer = () => {
    dispatch(openDrawer('NavigationDrawer'));
  };

  const handleOpenActionDrawer = () => {
    dispatch(openDrawer('ActionDrawer'));
  };

  const handleOpenTimeDrawer = () => {
    dispatch(openDrawer('TimeDrawer'));
  };

  return (
    <div className={styles.NavigationBar}>
      <div className={styles.row}>
        <div className={styles.itemContainer} onClick={handleOpenSystemDrawer}>
          <MdSettings className={styles.icon} />
          <span>SETTINGS</span>
        </div>
        <div className={styles.itemContainer} onClick={handleOpenSceneDrawer}>
          <MdLayers className={styles.icon} />
          <span>SCENE</span>
        </div>
        <div className={styles.itemContainer} onClick={handleOpenActionDrawer}>
          <MdDashboard className={styles.icon} />
          <span>ACTION</span>
        </div>
        <div className={styles.itemContainer} onClick={handleOpenNavigationDrawer}>
          <OriginPicker />
        </div>
        <div className={styles.itemContainer} onClick={handleOpenTimeDrawer}>
          <TimePicker />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
{
  /* <TabMenu>
        <TabMenuItem active={isActive('settings')}>
          <SystemMenu showTutorial={showTutorial} />
        </TabMenuItem>
        <TabMenuItem active={isActive('scene')} onClick={selectView('scene')}>
          <MdLayers className={styles.icon} />
          <SmallLabel refKey='scene'>Scene</SmallLabel>
        </TabMenuItem>
        <TabMenuItem active={isActive('action')} onClick={selectView('action')}>
          <MdOutlineAddBox className={styles.icon} />
          <SmallLabel refKey='action'>Action</SmallLabel>
        </TabMenuItem>
        <OriginPicker />
        <TimePicker />
      </TabMenu> */
}
