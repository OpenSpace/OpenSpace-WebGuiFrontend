import openspaceApi from 'openspace-api-js';
import Environment from './Environment';

export default openspaceApi(Environment.wsAddress, Environment.wsPort);
