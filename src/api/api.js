  import Environment from './Environment';
  import openspaceApi from 'openspace-api-js';
  export default openspaceApi(Environment.wsAddress, Environment.wsPort);