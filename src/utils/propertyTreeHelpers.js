// TODO: Revisit these functions and determine if any should be
// kept since most of this functionality is now more easily handled
// by the lua API
import { EnginePropertyVisibilityKey, InterestingTag, LayerGroupKeys } from '../api/keys';

// Function to return a deep copy of an object
export const keepCloning = (objectpassed) => {
  if (objectpassed === null || typeof objectpassed !== 'object') {
    return objectpassed;
  }
  // give temporary-storage the original obj's constructor
  const temporaryStorage = objectpassed.constructor();
  Object.keys(objectpassed).forEach((key) => {
    temporaryStorage[key] = keepCloning(objectpassed[key]);
  });
  return temporaryStorage;
};

export const getBoolPropertyValue = (state, uri) => {
  const { properties } = state.propertyTree;
  const property = properties[uri];
  return property ? property.value : false;
};

// TODO: Delete unused function
export function traverseTreeForTag(node, tag) {
  let data;
  node.subowners.forEach((element) => {
    data = traverseTreeForTag(element, tag);
    if (element.tag.includes(tag)) {
      data = element;
    }
  });
  return data;
}

export function findAllNodesWithTag(state, tag) {
  const nodes = [];
  state.forEach((element) => {
    const data = traverseTreeForTag(element, tag);
    if (data !== undefined) {
      const returnValue = {
        data,
        identifier: element.identifier
      };
      nodes.push(returnValue);
    }
  });
  return nodes;
}

// Convert envelopes in transfer function property to back end compatible format
export function convertEnvelopes(envelopes) {
  let convertedEnvelopes = keepCloning(envelopes);
  convertedEnvelopes = convertedEnvelopes.map((envelope) => ({
    points: envelope.points.map((point) => ({
      color: point.color,
      position: point.position
    }))
  }));
  return JSON.stringify(convertedEnvelopes);
}

// Get the word after the last dot in the uri, or the full uri if it has no dot
export function getLastWordOfUri(uri) {
  const index = uri.lastIndexOf('.');
  return index === -1 ? uri : uri.substring(index + 1);
}

// Get the uri without the last word, or the full uri if it has no dot
export function removeLastWordFromUri(uri) {
  const index = uri.lastIndexOf('.');
  return index === -1 ? uri : uri.substring(0, index);
}

// Returns whether a property should be visible in the gui
export function isPropertyVisible(properties, uri) {
  const property = properties[uri];
  if (!property?.metaData?.visibility) {
    return false;
  }

  // Only show properties matching the current visibility setting
  const visibility = properties[EnginePropertyVisibilityKey];
  let propertyVisibility = '';
  switch (property.metaData.visibility) {
    case 'Hidden':
      propertyVisibility = 5;
      break;
    case 'Developer':
      propertyVisibility = 4;
      break;
    case 'AdvancedUser':
      propertyVisibility = 3;
      break;
    case 'User':
      propertyVisibility = 2;
      break;
    case 'NoviceUser':
      propertyVisibility = 1;
      break;
    case 'Always':
      propertyVisibility = 0;
      break;
    default:
      propertyVisibility = 0;
      break;
  }
  return visibility.value >= propertyVisibility;
}

// Returns whether a property owner should be hidden in the gui
export function isPropertyOwnerHidden(properties, uri) {
  if (uri === undefined) return false;
  const prop = properties[`${uri}.GuiHidden`];
  if (prop && prop.value) {
    return true;
  }
  return false;
}

// Returns true if a property owner has no visible children
export function isDeadEnd(propertyOwners, properties, uri) {
  const node = propertyOwners[uri];
  const subowners = node.subowners || [];
  const subproperties = node.properties || [];

  const visibleProperties = subproperties.filter((childUri) =>
    isPropertyVisible(properties, childUri)
  );

  if (visibleProperties.length > 0) {
    return false;
  }

  function filterFunc(childUri) {
    const isHidden = isPropertyOwnerHidden(properties, childUri);
    const propertyOwnerIsDeadEnd = isDeadEnd(propertyOwners, properties, childUri);
    return !isHidden && !propertyOwnerIsDeadEnd;
  }

  const nonDeadEndSubowners = subowners.filter(filterFunc);
  return nonDeadEndSubowners.length === 0;
}

// Returns true if the URI has the correct format of a scene graph node.
// OBS! Does not actually check if the SGN exists
export function isSceneGraphNode(uri) {
  if (!uri) return false;

  const splitUri = uri.split('.');
  // A scene graph node URI har the format 'Scene.<NodeIdentifier>'
  return splitUri.length === 2 && splitUri[0] === 'Scene';
}

// Returns true if the URI has the correct format of a globe browsing layer
export function isGlobeBrowsingLayer(uri) {
  if (!uri) return false;

  const splitUri = uri.split('.');

  let found = false;
  LayerGroupKeys.forEach((layerGroup) => {
    if (uri.indexOf(layerGroup) > -1 && !uri.endsWith(layerGroup)) {
      found = true;
    }
  });

  return found && splitUri.length === 6;
}

// Returns the name of the layer group from a URI corresponding to a
// globe browsing layer
export function getLayerGroupFromUri(uri) {
  if (!isGlobeBrowsingLayer(uri)) {
    return undefined;
  }
  const splitUri = uri.split('.');
  // The layer group comes after "Layers" in the uri
  const index = splitUri.indexOf('Layers') + 1;
  return splitUri[index];
}

// Returns the name of the scene graph node from any URI
export function getSceneGraphNodeFromUri(uri) {
  const splitUri = uri.split('.');
  // The name of the scene graph node is always the second string. E.g 'Scene.Earth'
  if (splitUri.length < 2 || splitUri[0] !== 'Scene') {
    return undefined;
  }
  return splitUri[1];
}

export function isEnabledProperty(uri) {
  const splitUri = uri.split('.');
  return splitUri.length > 1 && splitUri[splitUri.length - 1] === 'Enabled';
}

// Return an identifier for the tree expansion state.
export function nodeExpansionIdentifier(uri) {
  const splitUri = uri.split('.');
  if (splitUri.length > 1) {
    return `O:${splitUri[splitUri.length - 1]}`;
  }
  return '';
}

export function displayName(propertyOwners, properties, uri) {
  // Check property for scene graph nodes
  let property = properties[`${uri}.GuiName`];

  // Other property owners with a given name
  if (!property && propertyOwners[uri] && propertyOwners[uri].name) {
    property = { value: propertyOwners[uri].name };
  }

  const guiName = property ? property.value : undefined;
  // If the gui name is found and not empty, use it. Otherwise, show identifier of node
  return guiName || propertyOwners[uri].identifier;
}

export function guiOrderingNumber(properties, uri) {
  let property = properties[`${uri}.UseGuiOrdering`];
  const shouldUseGuiOrderingNumber = property ? property.value : false;
  if (!shouldUseGuiOrderingNumber) {
    return undefined;
  }
  property = properties[`${uri}.GuiOrderingNumber`];
  return property ? property.value : undefined;
}

export function identifierFromUri(uri) {
  const splitUri = uri.split('.');
  return splitUri.length > 1 ? splitUri[1] : undefined;
}

export function isRenderable(uri) {
  const splitUri = uri.split('.');
  return splitUri.length > 1 && splitUri[splitUri.length - 1] === 'Renderable';
}

export function findFadePropertyUri(properties, ownerUri) {
  // Check if this property owner has a fade property, or a renderable with the property.
  // Note that a fadeable must have both the Fade and Enabled property, on the same level
  const notRenderable = !isRenderable(ownerUri);
  if (notRenderable && properties[`${ownerUri}.Fade`] && properties[`${ownerUri}.Enabled`]) {
    return `${ownerUri}.Fade`;
  }
  if (properties[`${ownerUri}.Renderable.Fade`] && properties[`${ownerUri}.Renderable.Enabled`]) {
    return `${ownerUri}.Renderable.Fade`;
  }
  return undefined;
}

export function findEnabledPropertyUri(properties, ownerUri) {
  // Check if this property owner has an enabled property, or a renderable with the property
  if (!isRenderable(ownerUri) && properties[`${ownerUri}.Enabled`]) {
    return `${ownerUri}.Enabled`;
  }
  if (properties[`${ownerUri}.Renderable.Enabled`]) {
    return `${ownerUri}.Renderable.Enabled`;
  }
  return undefined;
}

// Visible means that the object is enabled and has a fade value that's not zero
// ownerUri is the uri of the property owner that we want to check is visible or not
export function checkIfVisible(properties, ownerUri) {
  const enabledUri = findEnabledPropertyUri(properties, ownerUri);
  const fadeUri = findFadePropertyUri(properties, ownerUri);

  // Enabled is required. But fade can be optional
  if (!enabledUri) {
    return false;
  }

  const isEnabled = properties[enabledUri]?.value;

  // Make fade == 0 correspond to disabled, according to the checkbox
  if (fadeUri) {
    return isEnabled && properties[fadeUri]?.value > 0;
  }

  return isEnabled;
}

export function hasInterestingTag(uri, propertyOwners) {
  return propertyOwners[uri]?.tags?.some((tag) => tag.includes(InterestingTag));
}

// Filter based on show enabled/hidden
export function filterPropertyOwners(ownerUris, props, showOnlyEnabled, showHidden) {
  let result = ownerUris;
  if (showOnlyEnabled) {
    result = result.filter((uri) => checkIfVisible(props, uri));
  }
  if (!showHidden) {
    result = result.filter((uri) => !isPropertyOwnerHidden(props, uri));
  }
  return result;
}

// Sort a list of items in the scene menu. This is a bit complicated, since there are
// multiple alternative ways to specify the order.
export function sortSceneMenuList(listToSort, orderedNamesList) {
  // Split the list up into three: 1) Any custom sorted objects, 2) numerically sorted
  // objects, and 3) alphabetically sorted. In most cases, all will be alphabetical.

  const customOrder = [];
  const numericalOrder = [];
  const alphabeticalOrder = [];

  // Lua gives us an object with indexes as key, not an array. So first convert
  // the values to an array
  const sortOrderingList = orderedNamesList ? Object.values(orderedNamesList) : [];

  listToSort.forEach((entry) => {
    if (sortOrderingList.includes(entry.name)) {
      customOrder.push(entry);
    } else if (entry.guiOrder !== undefined) {
      numericalOrder.push(entry);
    } else {
      alphabeticalOrder.push(entry);
    }
  });

  // Sort based on custom sort ordering
  customOrder.sort((a, b) => {
    const left = sortOrderingList.indexOf(a.name);
    const right = sortOrderingList.indexOf(b.name);
    if (left === right) {
      return 0; // keep original order (alphabetical)
    }
    if (left === -1) {
      // left not in list => put last
      return 1;
    }
    if (right === -1) {
      // right not in list => put last
      return -1;
    }
    return left < right ? -1 : 1;
  });

  // Numerical sorting based on provided guiOrdering number per scene graph node
  numericalOrder.sort((a, b) => {
    if (a.guiOrder === b.guiOrder) {
      // Do alphabetic sort if number is the same
      return a.name.localeCompare(b.name, 'en');
    }
    return a.guiOrder > b.guiOrder;
  });

  // Alphabetical
  alphabeticalOrder.sort((a, b) => a.name.localeCompare(b.name, 'en'));

  return customOrder.concat(numericalOrder).concat(alphabeticalOrder);
}
