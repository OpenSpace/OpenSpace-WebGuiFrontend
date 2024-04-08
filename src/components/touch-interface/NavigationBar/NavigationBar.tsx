import React from 'react';
import styles from './NavigationBar.scss';
import OriginPicker from '../../BottomBar/Origin/OriginPicker';
import TimePicker from '../../BottomBar/TimePicker';
import GeoPositionPanel from '../../BottomBar/GeoPositionPanel';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import SystemMenu from './SystemMenu/SystemMenu';
import { Md10K, MdLayers, MdOutlineAddBox, MdSettings } from 'react-icons/md';

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

  return (
    <div className={styles.NavigationBar}>
      <div className={styles.row}>
        <div className={styles.item}></div>
        <div className={styles.item} onClick={handleOpenSystemDrawer}>
          <MdSettings className={styles.icon} />
          <span>Settings</span>
          <SystemMenu showMenu={showMenu} showTutorial={showTutorial} setShowMenu={setShowMenu} />
        </div>
        <div className={styles.item}>
          <MdLayers className={styles.icon} />
          <span>Scene</span>
        </div>
        <div className={styles.item}>
          <MdLayers className={styles.icon} />
          <span>Action</span>
        </div>
        <div className={styles.item}>
          <OriginPicker />
        </div>
        <TimePicker />
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
