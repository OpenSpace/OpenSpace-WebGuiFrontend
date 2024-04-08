import React from 'react';
import { MdExitToApp, MdKeyboard, MdMoreVert, MdSettings } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import { setPopoverVisibility, setShowAbout } from '../../../../api/Actions';
import api from '../../../../api/api';
import environment from '../../../../api/Environment';
import Popover from '../../../common/Popover/Popover';
import { useContextRefs } from '../../../GettingStartedTour/GettingStartedContext';

import styles from './SystemMenu.scss';

function SystemMenu({
  showTutorial,
  showMenu,
  setShowMenu
}: {
  showTutorial: boolean;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
}) {
  const refs = useContextRefs();

  // TODO: Change any type
  const luaApi = useSelector((state: any) => state.luaApi);
  const keybindsIsVisible = useSelector((state: any) => state.local.popovers.keybinds.visible);

  const dispatch = useDispatch();

  const openlinkScript = (url: string) => {
    let startString = 'open';
    if (navigator.platform === 'Win32') {
      startString = 'start';
    }
    const script = `os.execute('${startString} ${url}')`;
    return script;
  };

  // TODO: Change type any
  function onClick(func: (value?: any) => void, value?: any) {
    setShowMenu(!showMenu);
    func(value);
  }

  function quit() {
    if (!luaApi) {
      return;
    }
    luaApi.toggleShutdown();
  }

  async function console() {
    if (!luaApi) {
      return;
    }
    const data = await luaApi.propertyValue('LuaConsole.IsVisible');
    const visible = data[1] || false;
    luaApi.setPropertyValue('LuaConsole.IsVisible', !visible);
  }

  async function nativeGui() {
    if (!luaApi) {
      return;
    }
    const data = await luaApi.propertyValue('Modules.ImGUI.Enabled');
    const visible = data[1] || false;
    luaApi.setPropertyValue('Modules.ImGUI.Enabled', !visible);
  }

  function openTutorials() {
    const script = openlinkScript('http://wiki.openspaceproject.com/docs/tutorials/users/');
    api.executeLuaScript(script);
  }

  function openFeedback() {
    const script = openlinkScript('http://data.openspaceproject.com/feedback');
    api.executeLuaScript(script);
  }

  function showAbout() {
    dispatch(setShowAbout(true));
  }

  function setShowKeybinds(visible: boolean) {
    dispatch(
      setPopoverVisibility({
        popover: 'keybinds',
        visible
      })
    );
  }

  // function saveChange() {
  //   if (!luaApi) { return; }
  //   luaApi.saveSettingsToProfile();
  // }

  return (
    <div className={styles.SystemMenu}>
      {showMenu && (
        <Popover className={styles.popover} arrow='arrow bottom leftside' attached>
          <nav className={styles.links}>
            <button type='button' onClick={() => onClick(showAbout)}>
              About OpenSpace
            </button>
            <button
              type='button'
              onClick={() => {
                onClick(openTutorials);
              }}
            >
              Open Web Tutorials
            </button>
            {showTutorial && (
              <button
                type='button'
                style={{ position: 'relative' }}
                onClick={() => {
                  onClick(showTutorial, true);
                }}
                ref={(el) => {
                  refs.current.Tutorial = el;
                }}
              >
                Open Getting Started Tour
              </button>
            )}
            <button type='button' onClick={() => onClick(openFeedback)}>
              Send Feedback
            </button>
            <hr className={Popover.styles.delimiter} />
            <button
              type='button'
              onClick={() => {
                onClick(setShowKeybinds, !keybindsIsVisible);
              }}
            >
              <MdKeyboard className={styles.linkIcon} />
              {keybindsIsVisible ? 'Hide' : 'Show'} keybindings
            </button>
            {environment.developmentMode && (
              <div>
                <hr className={Popover.styles.delimiter} />
                <div className={styles.devModeNotifier}>GUI running in dev mode</div>
              </div>
            )}
            <hr className={Popover.styles.delimiter} />

            <button type='button' onClick={() => onClick(console)}>
              Toggle console <span className={styles.shortcut}>~</span>
            </button>
            <button
              type='button'
              onClick={() => {
                onClick(nativeGui);
              }}
            >
              Toggle native GUI <span className={styles.shortcut}>F1</span>
            </button>
            {/*              <button onClick={saveChange}>
              Save settings to profile
            </button> */}
            <hr className={Popover.styles.delimiter} />
            <button
              type='button'
              onClick={() => {
                onClick(quit);
              }}
            >
              <MdExitToApp className={styles.linkIcon} />
              Quit OpenSpace <span className={styles.shortcut}>ESC</span>
            </button>
          </nav>
        </Popover>
      )}
    </div>
  );
}

export default SystemMenu;
