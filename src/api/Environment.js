// In most cases, this file should not have to be changed.
// Instead, the parameters should be overridden by
// window.OpenSpaceEnvironment or window.DevelopmentEnvironment.

// window.OpenSpaceEnvironment is set by a http request to `./environment.js`.
// In production mode, this allows OpenSpace to serve a custom address and port through
// the backend nodejs application.

// window.DevelopmentEnvironment will automatically be set by the inclusion of
// `devmode.js` which only happens when this application is hosted by the
// webpack dev server, see webpack.config.js.

const defaults = {
  wsAddress: '52.54.32.164',
  wsPort: 4682,
  developmentMode: false,
  signalingAddress: '52.54.32.164',
  signalingPort: 8443,
};

const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
let id = urlParams.get('id');
if (id) {
    defaults.wsPort += parseInt(id);
}

const openSpaceOverrides = window.OpenSpaceEnvironment || {};
const devOverrides = window.DevelopmentEnvironment || {};
const env = { ...defaults, ...devOverrides, ...openSpaceOverrides };

export default env;
