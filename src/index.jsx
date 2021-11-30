import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, compose } from 'redux';
// AppContainer is a necessary wrapper component for hot module reloading
import { AppContainer } from 'react-hot-loader';
import openspaceApp from './api/Reducers';
import middleware from './api/Middleware';
import App from './App';

/* global document */

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;    // Redux DevTools Extension courtesy of https://github.com/zalmoxisus/redux-devtools-extension

const store = createStore(
  openspaceApp,
  composeEnhancers(
    middleware,
  )
);

const render = (Component) => {
  ReactDOM.render(
    <Provider store={store} >
      <AppContainer>
        <Component />
      </AppContainer>
    </Provider>,
    document.getElementById('root'),
  );
};

render(App);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./App', () => render(App));
}
