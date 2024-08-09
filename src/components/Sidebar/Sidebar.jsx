import React from 'react';
import { MdLayers, MdSettings } from 'react-icons/md';
import PropTypes from 'prop-types';
import { Resizable } from 're-resizable';

import SmallLabel from '../common/SmallLabel/SmallLabel';
import SystemMenu from '../SystemMenu/SystemMenu';

import TabMenu from './TabMenu/TabMenu';
import TabMenuItem from './TabMenu/TabMenuItem';
import ScenePane from './ScenePane';
import SettingsPane from './SettingsPane';

import styles from './Sidebar.scss';

const views = {
  settings: SettingsPane,
  scene: ScenePane
};

function Sidebar({ showTutorial = undefined }) {
  const [view, setView] = React.useState(null);
  const [width, setWidth] = React.useState(300);

  function onResizeStop(e, direction, ref, delta) {
    setWidth((current) => current + delta.width);
  }

  function selectView(selectedView) {
    return () => {
      setView((previous) => (previous === selectedView ? null : selectedView));
    };
  }

  function isActive(viewName) {
    return view === viewName;
  }

  const SelectedView = views[view];

  const size = { height: view ? '100%' : 60, width };

  return (
    <Resizable
      enable={{
        top: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
        right: !!view
      }}
      size={size}
      minHeight={size.height}
      maxHeight={size.height}
      minWidth={200}
      maxWidth={window.innerWidth - 50}
      handleClasses={{ right: styles.rightHandle }}
      onResizeStop={onResizeStop}
    >
      <section className={`${styles.Sidebar} ${view ? styles.active : ''}`}>
        { SelectedView && (<SelectedView closeCallback={selectView} />)}
        <TabMenu>
          <SystemMenu showTutorial={showTutorial} />
          <TabMenuItem active={isActive('scene')} onClick={selectView('scene')}>
            <MdLayers className={styles.icon} />
            <SmallLabel refKey="Scene">Scene</SmallLabel>
          </TabMenuItem>
          <TabMenuItem active={isActive('settings')} onClick={selectView('settings')}>
            <MdSettings className={styles.icon} />
            <SmallLabel>Settings</SmallLabel>
          </TabMenuItem>
        </TabMenu>
      </section>
    </Resizable>
  );
}

Sidebar.propTypes = {
  showTutorial: PropTypes.func
};

export default Sidebar;
