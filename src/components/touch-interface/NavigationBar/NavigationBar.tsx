import React from 'react';
import styles from './NavigationBar.scss';
import OriginPicker from '../../BottomBar/Origin/OriginPicker';
import TimePicker from '../../BottomBar/TimePicker';
import GeoPositionPanel from '../../BottomBar/GeoPositionPanel';
import SmallLabel from '../../common/SmallLabel/SmallLabel';
import SystemMenu from '../../SystemMenu/SystemMenu';
import { MdLayers, MdSettings } from 'react-icons/md';

import TabMenu from '../../Sidebar/TabMenu/TabMenu';
import TabMenuItem from '../../Sidebar/TabMenu/TabMenuItem';

export default function NavigationBar({ showTutorial }) {
  const [view, setView] = React.useState(null);
  function selectView(selectedView) {
    return () => {
      setView((previous) => (previous === selectedView ? null : selectedView));
    };
  }

  function isActive(viewName) {
    return view === viewName;
  }
  return (
    <div className={styles.NavigationBar}>
      <TabMenu>
        <SystemMenu showTutorial={showTutorial} />
        <TabMenuItem active={isActive('scene')} onClick={selectView('scene')}>
          <MdLayers className={styles.icon} />
          <SmallLabel refKey='Scene'>Scene</SmallLabel>
        </TabMenuItem>
        <TabMenuItem active={isActive('settings')} onClick={selectView('settings')}>
          <MdSettings className={styles.icon} />
          <SmallLabel>Settings</SmallLabel>
        </TabMenuItem>
        <OriginPicker />
        <TimePicker />
      </TabMenu>
    </div>
  );
}
