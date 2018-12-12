const defaults = {
  wsAddress: 'localhost',
  wsPort: 4682
}

const overrides = window.OpenSpaceEnvironment || {};
const env = {...defaults, ...overrides};

export default env;
