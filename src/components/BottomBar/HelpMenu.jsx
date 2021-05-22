import React, { Component } from 'react';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import styles from './HelpMenu.scss';
import Popover from '../common/Popover/Popover';
import Picker from './Picker';
import { connect } from 'react-redux';

class HelpMenu extends Component {
  constructor(props) {
    super(props);
    this.state = { showMenu: false };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.openDocumentation = this.openDocumentation.bind(this);
    this.openUserGuides = this.openUserGuides.bind(this);
    this.openTutorials = this.openTutorials.bind(this);
    this.openSupport = this.openSupport.bind(this);
    this.openServerStatus = this.openServerStatus.bind(this);
  }

  toggleMenu() {
    this.setState({ showMenu: !this.state.showMenu });
  }

  openDocumentation() {
    const openspace = this.props.luaApi;
    openspace.openDocumentation();
  }

  openUserGuides() {
    const openspace = this.props.luaApi;
    openspace.openUserGuides();
  }

  openTutorials() {
    const openspace = this.props.luaApi;
    openspace.openTutorials();
  }

  openSupport() {
    const openspace = this.props.luaApi;
    openspace.openSupport();
  }

  openServerStatus() {
    const openspace = this.props.luaApi;
    openspace.openServerStatus();
  }

  render() {
    if (!this.props.luaApi) return null; // guard

    const { openDocumentation } = this.props.luaApi;

    if (!openDocumentation) return null; // guard - simple test if Lua functions are present - once Help functions are suported on all platforms this can be removed 

    return (
      <div className={Picker.Wrapper}>
        { this.state.showMenu && (
           
          <Popover className={`${Picker.Popover} ${styles.Popover}`} attached={true}>

            <nav onClick={this.toggleMenu}>
              <ul className={styles.links} >

                <li onClick={this.openDocumentation}>
                  Scene Documentation
                </li>
                <hr className={Popover.styles.delimiter} />
                <li onClick={this.openUserGuides}>
                  User Guide
                </li>
                <li onClick={this.openTutorials}>
                  Tutorials
                </li>
                <li onClick={this.openSupport}>
                  Support
                </li>
                <hr className={Popover.styles.delimiter} />
                <li onClick={this.openServerStatus}>
                  Server Status
                </li>
              </ul>
            </nav>

          </Popover>

        )}

        <Picker onClick={this.toggleMenu}>
          <div>
            <MaterialIcon className={styles.icon} icon="help" />
          </div>
        </Picker>


      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  luaApi: state.luaApi,
});

HelpMenu = connect(
  mapStateToProps
)(HelpMenu);

export default HelpMenu;
