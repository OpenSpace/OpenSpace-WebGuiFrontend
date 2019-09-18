const defaults = {
  wsAddress: 'localhost',
  wsPort: 4682,
  developmentMode: true
}

const openSpaceOverrides = window.OpenSpaceEnvironment || {};
const devOverrides = window.DevelopmentEnvironment || {};
const env = {...defaults, ...devOverrides, ...openSpaceOverrides};

export default env;
