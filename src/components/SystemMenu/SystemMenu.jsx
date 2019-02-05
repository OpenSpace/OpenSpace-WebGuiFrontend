import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DataManager from '../../api/DataManager';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Button from '../common/Input/Button/Button';
import styles from './SystemMenu.scss';
import Popover from '../common/Popover/Popover';
import {
  ShutdownScript,
  ToggleConsoleScript,
  ToggleNativeGuiScript } from '../../api/keys';

class SystemMenu extends Component {
  static quit() {
    DataManager.runScript(ShutdownScript);
  }

  static console() {
    DataManager.runScript(ToggleConsoleScript);
  }

  static nativeGui() {
    DataManager.runScript(ToggleNativeGuiScript);
  }

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
          <Popover className={styles.popover} arrow="arrow bottom leftside">
            <nav className={styles.links} onClick={this.toggleMenu}>
              <button onClick={SystemMenu.console}>
                Toggle console <span className={styles.shortcut}>~</span>
              </button>
              <button onClick={SystemMenu.nativeGui}>
                Toggle native GUI <span className={styles.shortcut}>F3</span>
              </button>

              <hr className={Popover.styles.delimiter} />

              <button onClick={SystemMenu.quit}>
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

/*
TODO: Add link to About. Currently not working inside Cef Gui.
<hr className={Popover.styles.delimiter} />
<Link to="about">
  <Icon icon="info" className={styles.linkIcon} />
  About
</Link>
*/

export default SystemMenu;
