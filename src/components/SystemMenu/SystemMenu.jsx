import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Button from '../common/Input/Button/Button';
import styles from './SystemMenu.scss';
import Popover from '../common/Popover/Popover';
import subStateToProps from '../../utils/subStateToProps';
import { connect } from 'react-redux';
import { setShowAbout } from '../../api/Actions'
import environment from '../../api/Environment';

class SystemMenu extends Component {
  constructor(props) {
    super(props);
    this.state = { showMenu: false };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({ showMenu: !this.state.showMenu });
  }

  render() {
    return (
      <div className={styles.SystemMenu}>
        { this.state.showMenu && (
          <Popover className={styles.popover} arrow="arrow bottom leftside" attached={true}>
            <nav className={styles.links} onClick={this.toggleMenu}>

              <button onClick={this.props.showAbout}>
                About OpenSpace
              </button>
              {
                environment.developmentMode ?
                  <div>
                    <hr className={Popover.styles.delimiter} />
                    <div className={styles.devModeNotifier}>GUI running in dev mode</div>
                  </div> : null
              }
              <hr className={Popover.styles.delimiter} />

              <button onClick={this.props.console}>
                Toggle console <span className={styles.shortcut}>~</span>
              </button>
              <button onClick={this.props.nativeGui}>
                Toggle native GUI <span className={styles.shortcut}>F1</span>
              </button>

              <button onClick={this.props.saveChange}>
                Save settings to profile
              </button>


              <hr className={Popover.styles.delimiter} />

              <button onClick={this.props.quit}>
                <MaterialIcon icon="exit_to_app" className={styles.linkIcon} />
                Quit OpenSpace <span className={styles.shortcut}>ESC</span>
              </button>
            </nav>
          </Popover>
        )}

        <Button className={styles.button} transparent onClick={this.toggleMenu}>
          <MaterialIcon icon="more_vert" className={styles.icon} />
        </Button>
      </div>
    );
  }
}

const mapStateToSubState = (state) => ({
  luaApi: state.luaApi,
});

const mapSubStateToProps = ({ luaApi }) => {
  if (!luaApi) {
    return {};
  }
  return {
    quit: () => luaApi.toggleShutdown(),
    console: async () => {
      const data = await luaApi.getPropertyValue("LuaConsole.IsVisible");
      const visible = data[1] || false;
      luaApi.setPropertyValue("LuaConsole.IsVisible", !visible);
    },
    nativeGui: async () => {
      const data = await luaApi.getPropertyValue("Modules.ImGUI.Main.Enabled");
      const visible = data[1] || false;
      luaApi.setPropertyValue("Modules.ImGUI.Main.Enabled", !visible);
    },
    saveChange: async () => {
      luaApi.saveSettingsToProfile();
    },
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showAbout: () => dispatch(setShowAbout(true))
  }
}

SystemMenu = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(SystemMenu);

export default SystemMenu;
