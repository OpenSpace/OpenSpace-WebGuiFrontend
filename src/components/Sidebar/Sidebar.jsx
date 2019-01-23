import React from 'react';

import TabMenu from './TabMenu/TabMenu';
import SystemMenu from '../SystemMenu/SystemMenu';
import TabMenuItem from './TabMenu/TabMenuItem';
import Icon from '../common/Icon/Icon';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import ScenePane from './ScenePane';
import SettingsPane from './SettingsPane';
import Resizable from 're-resizable';

import styles from './Sidebar.scss';

const RightHandle = () => (
  <div className={styles.rightHandle}/>
)

const views = {
  settings: SettingsPane,
  scene: ScenePane,
};

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: null,
      width: 300
    };

    this.selectView = this.selectView.bind(this);
    this.isActive = this.isActive.bind(this);
    this.onResizeStop = this.onResizeStop.bind(this);
  }

  onResizeStop(e, direction, ref, delta) {
    this.setState({
      width: this.state.width + delta.width
    })
  }

  selectView(selectedView) {
    return () => {
      this.setState((previous) => {
        const view = (previous.view === selectedView ? null : selectedView);
        return Object.assign({}, previous, { view });
      });
    };
  }

  isActive(view) {
    return this.state.view === view;
  }

  render() {
    const { view } = this.state;
    const SelectedView = views[view];

    const size = {height: this.state.view ? '100%' : 60, width: this.state.width};

    return (
      <Resizable
        size={size}
        minHeight={size.height}
        maxHeight={size.height}
        minWidth={200}
        maxWidth={window.innerWidth - 50}
        handleComponent={{right: RightHandle}}
        onResizeStop={this.onResizeStop}
      >
        <section className={`${styles.Sidebar} ${view ? styles.active : ''}`}>
          { SelectedView && (<SelectedView closeCallback={this.selectView} />)}
          <TabMenu>
            <SystemMenu />
            <TabMenuItem active={this.isActive('scene')} onClick={this.selectView('scene')}>
              <Icon className={styles.icon} icon="layers" />
              <SmallLabel>Scene</SmallLabel>
            </TabMenuItem>
            <TabMenuItem active={this.isActive('settings')} onClick={this.selectView('settings')}>
              <Icon className={styles.icon} icon="settings" />
              <SmallLabel>Settings</SmallLabel>
            </TabMenuItem>
          </TabMenu>
        </section>
      </Resizable>
    );
  }
}

export default Sidebar;
