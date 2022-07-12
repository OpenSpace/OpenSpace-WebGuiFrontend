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
  wsAddress: 'localhost',
  wsPort: 4682,
  developmentMode: false,
};

const openSpaceOverrides = window.OpenSpaceEnvironment || {};
const devOverrides = window.DevelopmentEnvironment || {};
const env = { ...defaults, ...devOverrides, ...openSpaceOverrides };

export default env;
