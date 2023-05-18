import React from 'react';
import { connect } from 'react-redux';

import { setPopoverVisibility, setShowAbout } from '../../api/Actions';
import api from '../../api/api';
import environment from '../../api/Environment';
import subStateToProps from '../../utils/subStateToProps';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import { useContextRefs } from '../GettingStartedTour/GettingStartedContext';

import styles from './SystemMenu.scss';

function SystemMenu({
  console,
  keybindsIsVisible,
  nativeGui,
  openTutorials,
  openFeedback,
  showAbout,
  showTutorial,
  setShowKeybinds,
  quit
}) {
  const [showMenu, setShowMenu] = React.useState(false);
  const refs = useContextRefs();

  function onClick(func, value) {
    setShowMenu(!showMenu);
    func(value);
  }

  return (
    <div className={styles.SystemMenu}>
      { showMenu && (
        <Popover className={styles.popover} arrow="arrow bottom leftside" attached>
          <nav className={styles.links}>
            <button type="button" onClick={() => { onClick(showAbout); }}>
              About OpenSpace
            </button>
            <button type="button" onClick={() => { onClick(openTutorials); }}>
              Open Web Tutorials
            </button>
            <button
              type="button"
              style={{ position: 'relative' }}
              onClick={() => { onClick(showTutorial, true); }}
              ref={(el) => { refs.current.Tutorial = el; }}
            >
              Open Getting Started Tour
            </button>
            <button type="button" onClick={() => onClick(openFeedback)}>
              Send Feedback
            </button>
            <hr className={Popover.styles.delimiter} />
            <button type="button" onClick={() => { onClick(setShowKeybinds, !keybindsIsVisible); }}>
              <MaterialIcon className={styles.linkIcon} icon="keyboard" />
              {keybindsIsVisible ? 'Hide' : 'Show'}
              {' '}
              keybindings
            </button>
            {
              environment.developmentMode && (
                <div>
                  <hr className={Popover.styles.delimiter} />
                  <div className={styles.devModeNotifier}>GUI running in dev mode</div>
                </div>
              )
            }
            <hr className={Popover.styles.delimiter} />

            <button type="button" onClick={() => onClick(console)}>
              Toggle console
              {' '}
              <span className={styles.shortcut}>~</span>
            </button>
            <button type="button" onClick={() => { onClick(nativeGui); }}>
              Toggle native GUI
              {' '}
              <span className={styles.shortcut}>F1</span>
            </button>
            {/*              <button onClick={saveChange}>
              Save settings to profile
            </button> */}
            <hr className={Popover.styles.delimiter} />
            <button type="button" onClick={() => { onClick(quit); }}>
              <MaterialIcon icon="exit_to_app" className={styles.linkIcon} />
              Quit OpenSpace
              {' '}
              <span className={styles.shortcut}>ESC</span>
            </button>
          </nav>
        </Popover>
      )}
      <Button
        ref={(el) => { refs.current.System = el; }}
        className={styles.button}
        transparent
        onClick={() => setShowMenu(!showMenu)}
      >
        <MaterialIcon icon="more_vert" className={styles.icon} />
      </Button>
    </div>
  );
}

const mapStateToSubState = (state) => ({
  luaApi: state.luaApi,
  keybindsIsVisible: state.local.popovers.keybinds.visible
});

const mapSubStateToProps = ({ luaApi, keybindsIsVisible }) => {
  if (!luaApi) {
    return {};
  }

  const openlinkScript = (url) => {
    let startString = 'open';
    if (navigator.platform === 'Win32') {
      startString = 'start';
    }
    const script = `os.execute('${startString} ${url}')`;
    return script;
  };

  return {
    quit: () => luaApi.toggleShutdown(),
    console: async () => {
      const data = await luaApi.getPropertyValue('LuaConsole.IsVisible');
      const visible = data[1] || false;
      luaApi.setPropertyValue('LuaConsole.IsVisible', !visible);
    },
    nativeGui: async () => {
      const data = await luaApi.getPropertyValue('Modules.ImGUI.Enabled');
      const visible = data[1] || false;
      luaApi.setPropertyValue('Modules.ImGUI.Enabled', !visible);
    },
    openTutorials: () => {
      const script = openlinkScript('http://wiki.openspaceproject.com/docs/tutorials/users/');
      api.executeLuaScript(script);
    },
    openFeedback: () => {
      const script = openlinkScript('http://data.openspaceproject.com/feedback');
      api.executeLuaScript(script);
    },
    saveChange: async () => {
      luaApi.saveSettingsToProfile();
    },
    keybindsIsVisible
  };
};

const mapDispatchToProps = (dispatch) => ({
  showAbout: () => dispatch(setShowAbout(true)),
  setShowKeybinds: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'keybinds',
      visible
    }));
  }
});

SystemMenu = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(SystemMenu);

export default SystemMenu;
