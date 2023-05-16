import { Resizable } from 're-resizable';
import React, { Component } from 'react';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import SystemMenu from '../SystemMenu/SystemMenu';
import ScenePane from './ScenePane';
import SettingsPane from './SettingsPane';
import styles from './Sidebar.scss';
import TabMenu from './TabMenu/TabMenu';
import TabMenuItem from './TabMenu/TabMenuItem';

const views = {
  settings: SettingsPane,
  scene: ScenePane
};

class Sidebar extends Component {
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
    });
  }

  selectView(selectedView) {
    return () => {
      this.setState((previous) => {
        const view = (previous.view === selectedView ? null : selectedView);
        return { ...previous, view };
      });
    };
  }

  isActive(view) {
    return this.state.view === view;
  }

  render() {
    const { view } = this.state;
    const SelectedView = views[view];

    const size = { height: this.state.view ? '100%' : 60, width: this.state.width };

    return (
      <Resizable
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
          right: !!this.state.view
        }}
        size={size}
        minHeight={size.height}
        maxHeight={size.height}
        minWidth={200}
        maxWidth={window.innerWidth - 50}
        handleClasses={{ right: styles.rightHandle }}
        onResizeStop={this.onResizeStop}
      >
        <section className={`${styles.Sidebar} ${view ? styles.active : ''}`}>
          { SelectedView && (<SelectedView closeCallback={this.selectView} />)}
          <TabMenu>
            <SystemMenu showTutorial={this.props.showTutorial} />
            <TabMenuItem active={this.isActive('scene')} onClick={this.selectView('scene')}>
              <MaterialIcon className={styles.icon} icon="layers" />
              <SmallLabel refKey="Scene">Scene</SmallLabel>
            </TabMenuItem>
            <TabMenuItem active={this.isActive('settings')} onClick={this.selectView('settings')}>
              <MaterialIcon className={styles.icon} icon="settings" />
              <SmallLabel>Settings</SmallLabel>
            </TabMenuItem>
          </TabMenu>
        </section>
      </Resizable>
    );
  }
}

export default Sidebar;
