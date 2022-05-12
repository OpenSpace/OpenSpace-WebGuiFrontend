// TODO: Revisit these functions and determine if any should be
// kept since most of this functionality is now more easily handled
// by the lua API
import { LayerGroupKeys } from '../api/keys';

export const getIdOfProperty = (uri) => {
  const a = splitUri(uri);
  return a[a.length - 1];
};

// Function to return a deep copy of an object
export const keepCloning = (objectpassed) => {
  if (objectpassed === null || typeof objectpassed !== 'object') {
    return objectpassed;
  }
  // give temporary-storage the original obj's constructor
  const temporaryStorage = objectpassed.constructor();
  for (const key in objectpassed) {
    temporaryStorage[key] = keepCloning(objectpassed[key]);
  }
  return temporaryStorage;
};

export const getBoolPropertyValue = (state, uri) => {
  const properties = state.propertyTree.properties;
  const property = properties[uri];
  return property ? property.value : false;
}

// TODO: Delete unused function
export function findSubtree(node, uri) {
  const splittedUri = splitUri(uri);
  if (splittedUri.length === 0) {
    return node;
  }
  if (splittedUri.length === 1) {
    return node.properties.find(element => {
      return element.id === splittedUri[0]
    }) || node.subowners.find(element => {
      return element.identifier === splittedUri[0]
    });
  }

  const subowner = node.subowners.find(element => {
    return element.identifier === splittedUri[0]
  })

  if (!subowner) {
    return;
  }

  const slicedUri = splittedUri.slice(1);
  return findSubtree(subowner, slicedUri);
};

// TODO: Delete unused function
export function traverseTreeForTag(node, tag) {
  let data;
  node.subowners.map(element => {
    data = traverseTreeForTag(element, tag);
      if( element.tag.includes(tag)) {
        data = element;
      }
    });
  return data;
};

export function findAllNodesWithTag(state, tag) {
  let nodes = [];
  state.map(element => {
      const data = traverseTreeForTag(element, tag);
      if(data !== undefined) {
        const returnValue = {
          data,
          identifier: element.identifier
        }
        nodes.push(returnValue);
      }
  })
  return nodes;
};

// Convert envelopes in transfer function property to back end compatible format
export function convertEnvelopes(envelopes) {
  let convertedEnvelopes = keepCloning(envelopes);
  convertedEnvelopes = convertedEnvelopes.map(envelope =>
    Object.assign({},
      { points: envelope.points.map(point =>
        Object.assign({},
          { color: point.color,
            position: point.position,
          }),
      ),
      },
    ),
  );
  return JSON.stringify(convertedEnvelopes);
};

// Get the word after the last dot in the uri, or the full uri if it has no dot
export function getLastWordOfUri(uri) {
  const index = uri.lastIndexOf('.');
  return (index === -1) ? uri : uri.substring(index + 1);
}

// Get the uri without the last word, or the full uri if it has no dot
export function removeLastWordFromUri(uri) {
  const index = uri.lastIndexOf('.');
  return (index === -1) ? uri : uri.substring(0, index);
}

// Returns whether a property should be visible in the gui
export function isPropertyVisible(properties, uri) {
  const property = properties[uri];
  const visibility = properties['OpenSpaceEngine.Visibility'];

  const splitUri = uri.split('.');
  if (splitUri.length > 1) {
    if (splitUri[splitUri.length - 1] === 'Enabled')
      return false;
  }

  if (property && property.description && property.description.MetaData &&
      property.description.MetaData.Visibility) {
    let propertyVisibility = "";
    switch(property.description.MetaData.Visibility) {
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
  else {
    return false;
  }
}

// Returns whether a property owner should be hidden in the gui
export function isPropertyOwnerHidden(properties, uri) {
  if (uri === undefined) return false;
  const prop = properties[uri + '.GuiHidden'];
  if(prop && prop.value) {
    return true;
  }
  else return false;
}

// Returns true if a property owner has no visible children
export function isDeadEnd(propertyOwners, properties, uri) {
  const node = propertyOwners[uri];
  const subowners = node.subowners || [];
  const subproperties = node.properties || [];

  const visibleProperties = subproperties.filter(
    childUri => isPropertyVisible(properties, childUri)
  );
  if (visibleProperties.length > 0) {
    return false;
  }

  const nonDeadEndSubowners = subowners.filter(childUri => {
    return !isPropertyOwnerHidden(properties, childUri) && !isDeadEnd(propertyOwners, properties, childUri);
  });
  return nonDeadEndSubowners.length === 0;
}

// Returns true if the URI has the correct format of a scene graph node.
// OBS! Does not actually check if the SGN exists
export function isSceneGraphNode(uri) {
  if (!uri) return false;

  const splitUri = uri.split('.');
  // A scene graph node URI har the format 'Scene.<NodeIdentifier>'
  return (splitUri.length == 2 && splitUri[0] === 'Scene');
}

// Returns true if the URI has the correct format of a globe browsing layer
export function isGlobeBrowsingLayer(uri) {
  if (!uri) return false;

  const splitUri = uri.split('.');

  var found = false;
  LayerGroupKeys.forEach( layerGroup => {
    if ((uri.indexOf(layerGroup) > -1) && !(uri.endsWith(layerGroup))) {
      found = true;
    }
  });

  return found && (splitUri.length == 6);
}

// Returns the name of the layer group from a URI corresponding to a
// globe browsing layer
export function getLayerGroupFromUri(uri) {
  if (!isGlobeBrowsingLayer(uri)) {
    return undefined;
  }
  const splitUri = uri.split('.');
  // The layer group comes after "Layers" in the uri
  let index = splitUri.indexOf('Layers') + 1;
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
