import openspaceApi from 'openspace-api-wss-js';

import Environment from './Environment';

export default openspaceApi(Environment.wsAddress, Environment.wsPort, true);
