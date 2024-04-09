import { Dispatch } from 'redux';
import { setPopoverVisibility, setShowAbout } from '../../../../api/Actions';
import api from '../../../../api/api';

export function showAbout(dispatch: Dispatch) {
  dispatch(setShowAbout(true));
}

const openlinkScript = (url: string) => {
  let startString = 'open';
  if (navigator.platform === 'Win32') {
    startString = 'start';
  }
  const script = `os.execute('${startString} ${url}')`;
  return script;
};

// TODO: Maybe add a toast to the app that sends a connection lost toast if something is not connected and the user tries to use a service which needs a connection?
export function openTutorials(connectionLost: boolean) {
  if (connectionLost) {
    return;
  }

  const script = openlinkScript('http://wiki.openspaceproject.com/docs/tutorials/users/');
  api.executeLuaScript(script);
}

export function openFeedback(connectionLost: boolean) {
  if (connectionLost) {
    return;
  }

  const script = openlinkScript('http://data.openspaceproject.com/feedback');
  api.executeLuaScript(script);
}

export function setShowKeybinds(dispatch: Dispatch, visible: boolean) {
  dispatch(
    setPopoverVisibility({
      popover: 'keybinds',
      visible
    })
  );
}

export async function console(luaApi: any) {
  if (!luaApi) {
    return;
  }

  // console.log('hej');
  const data = await luaApi.propertyValue('LuaConsole.IsVisible');
  const visible = data[1] || false;
  luaApi.setPropertyValue('LuaConsole.IsVisible', !visible);
}

export async function nativeGui(luaApi: any) {
  if (!luaApi) {
    return;
  }
  const data = await luaApi.propertyValue('Modules.ImGUI.Enabled');
  const visible = data[1] || false;
  luaApi.setPropertyValue('Modules.ImGUI.Enabled', !visible);
}

export function quit(luaApi: any) {
  if (!luaApi) {
    return;
  }
  luaApi.toggleShutdown();
}
