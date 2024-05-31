import { throttle } from 'lodash/function';

import {
  addProperties,
  addPropertyOwners,
  refreshGroups,
  reloadPropertyTree,
  updatePropertyValue
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';
import { rootOwnerKey } from '../keys';

// The property tree middleware is designed to populate the react store's
// copy of the property tree when the frontend is connected to OpenSpace.
// The middleware also supports subscribing and setting properties
// regardless of whether they are present in the redux store or not.
// However, for values to propagate to the subscribing client,
// the property needs to exist in the tree.
// React components retrieve property values from the property tree by using
// react-redux `connect`.
//
// When subscribing to and setting a property, there are four cases:
// 1) We're connected to the backend. Property exists in the property tree:
//      This is the happy path.
//      Subscribing: The subscription is registered and
//      the subscriber will get updates through redux.
//      Setting: The data is sent to the backend.
//
// 2) We're not connected to backend. Property exists in the property tree:
//      This means that OpenSpace was once connected but lost connection.
//      Subscribing: Subscriptions are then stored as `pending`, so they can be
//      resumed once the connection is established again.
//      Setting: Properties are considered read-only in disconnected state.
//      The property will not be set.
//
// 3) We're connected to backend. Property does not exist in the property tree:
//      Subscribing: We are trying to subscribe a property that is not yet loaded
//      into the frontend, or the property does not exist at all.
//      There is no way for the frontend to know which of the two cases are true,
//      so the subscription is stored as `orphan`, and will kick in as soon as the
//      property can be located in the redux state.
//      Setting: We will send the update to the backend, which will accept the
//      setting if the property exists.
//
// 4) We're not connected to backend and the property does not exist in the property tree:
//      Subscribing: We store the subscription as `pending` and will try to promote it to
//      an active subscription when we are connected.
//      If it still does not exist, it will be marked `orphan` as in case 3.
//      Setting: We are not connected, so the property tree is considered read-only.
//      The property will not be set.

// At this point, we do not support addition and removal
// of properties in the backend at runtime.

const PendingState = 0;
const OrphanState = 1;
const ActiveState = 2;

// Map from uri to { state, nSubscribers, subscription }
const subscriptionInfos = {};

const handleUpdatedValues = (store, uri, value) => {
  // Update the value in the redux property tree, based on the
  // value from the backend.
  store.dispatch(updatePropertyValue(uri, value));

  // "Lazy unsubscribe":
  // Cancel the subscription whenever there is an update from the
  // server, and there are no more active subscibers on the client.
  // (As opposed to cancelling the subscription immediately when the
  //  number of subscribers hits zero)
  const subscriptionInfo = subscriptionInfos[uri];
  if (subscriptionInfo &&
      subscriptionInfo.state === ActiveState &&
      subscriptionInfo.nSubscribers < 1) {
    subscriptionInfo.subscription.cancel();
    delete subscriptionInfos[uri];
  }
};

const createSubscription = (store, uri) => {
  const subscription = api.subscribeToProperty(uri);
  const handleUpdates = (value) => handleUpdatedValues(store, uri, value);
  const throttledHandleUpdates = throttle(handleUpdates, 200);

  (async () => {
    // eslint-disable-next-line no-restricted-syntax
    for await (const data of subscription.iterator()) {
      throttledHandleUpdates(data.Value);
    }
  })();
  return subscription;
};

const tryPromoteSubscription = (store, uri) => {
  const state = store.getState();
  const { isConnected } = state.connection;
  const subscriptionInfo = subscriptionInfos[uri];

  if (!isConnected) {
    return;
  }

  if (subscriptionInfo.state === PendingState) {
    subscriptionInfo.state = OrphanState;
  }

  const propertyInTree = !!state.propertyTree.properties[uri];

  if (subscriptionInfo.state === OrphanState && propertyInTree) {
    subscriptionInfo.subscription = createSubscription(store, uri);
    subscriptionInfo.state = ActiveState;
  }
};

const promoteSubscriptions = (store) => {
  Object.keys(subscriptionInfos).forEach((uri) => {
    tryPromoteSubscription(store, uri);
  });
};

const markAllSubscriptionsAsPending = () => {
  Object.keys(subscriptionInfos).forEach((uri) => {
    subscriptionInfos[uri].state = PendingState;
  });
};

const flattenPropertyTree = (propertyOwner) => {
  let propertyOwners = [];
  let properties = [];
  
  if (propertyOwner.uri) {
    propertyOwners.push({
      uri: propertyOwner.uri,
      identifier: propertyOwner.identifier,
      name: propertyOwner.guiName ?? propertyOwner.identifier,
      properties: propertyOwner.properties.map((p) => p.Description.Identifier),
      subowners: propertyOwner.subowners.map((p) => p.uri),
      tags: propertyOwner.tag,
      description: propertyOwner.description
    });
  }

  propertyOwner.subowners.forEach((subowner) => {
    const childData = flattenPropertyTree(subowner);

    propertyOwners = propertyOwners.concat(childData.propertyOwners);
    properties = properties.concat(childData.properties);
  });

  propertyOwner.properties.forEach((property) => {
    properties.push({
      uri: property.Description.Identifier,
      description: property.Description,
      value: property.Value
    });
  });

  return {
    propertyOwners,
    properties
  };
};

const addPropertyOwner = async (dispatch, uri) => {
  const value = await api.getProperty(uri);
  if (!value) {
    console.error("Error retrieving property with uri ", uri);
    return;
  }

  // Extract the data from the property owner
  const { propertyOwners, properties } = flattenPropertyTree(value);
  
  dispatch(addPropertyOwners(propertyOwners));
  dispatch(addProperties(properties));
  dispatch(refreshGroups());
};

const setBackendValue = (uri, value) => {
  api.setProperty(uri, value);
};

const propertyTree = (store) => (next) => (action) => {
  let result;

  if (action.type === actionTypes.setPropertyValue) {
    // Optimization: Capture the setPropertyValue action, and don't let other middleware or
    // reducers act on that action, since they shouldn't act on it anyways.
    result = store;
  } else {
    result = next(action);
  }

  switch (action.type) {
    case actionTypes.onOpenConnection: {
      store.dispatch(reloadPropertyTree());
      break;
    }
    case actionTypes.addPropertyOwner: {
      addPropertyOwner(store.dispatch, action.payload.uri)
      break;
    }
    case actionTypes.reloadPropertyTree: {
      addPropertyOwner(store.dispatch, rootOwnerKey);
      break;
    }
    case actionTypes.onCloseConnection: {
      markAllSubscriptionsAsPending();
      break;
    }
    case actionTypes.addProperties: {
    // The added properteis may include properties whose
    // uri is marked as a `pending`/`orphan` subscription, so
    // we check if any subscriptions can be promoted to `active`.
      promoteSubscriptions(store);
      break;
    }
    case actionTypes.setPropertyValue: {
      setBackendValue(action.payload.uri, action.payload.value);
      break;
    }
    case actionTypes.subscribeToProperty: {
      const { uri } = action.payload;
      const subscriptionInfo = subscriptionInfos[uri];
      if (subscriptionInfo) {
        ++subscriptionInfo.nSubscribers;
      } else {
        subscriptionInfos[uri] = {
          state: PendingState,
          nSubscribers: 1
        };
      }
      tryPromoteSubscription(store, uri);
      break;
    }
    case actionTypes.unsubscribeToProperty: {
      const { uri } = action.payload;
      const subscriptionInfo = subscriptionInfos[uri];
      if (subscriptionInfo) {
        --subscriptionInfo.nSubscribers;
      }
      break;
    }
    default:
      break;
  }
  return result;
};

export default propertyTree;
