import React from 'react';
import ReactDOM from 'react-dom';
// AppContainer is a necessary wrapper component for hot module reloading
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { compose, createStore } from 'redux';
import middleware from './api/Middleware';
import openspaceApp from './api/Reducers';
import App from './App';

/* global document */

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;    // Redux DevTools Extension courtesy of https://github.com/zalmoxisus/redux-devtools-extension


//create store for redux system with all the information form the Reducers
const store = createStore(
  openspaceApp,
  composeEnhancers(
    middleware,
  )
);

//add store to provider
// nakes what in store avalible to our app openspaceApp

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
