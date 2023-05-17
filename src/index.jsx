import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { compose, createStore } from 'redux';

import middleware from './api/Middleware';
import openspaceApp from './api/Reducers';
import App from './App';

// global document

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // Redux DevTools Extension courtesy of https://github.com/zalmoxisus/redux-devtools-extension

const store = createStore(
  openspaceApp,
  composeEnhancers(
    middleware,
  )
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
