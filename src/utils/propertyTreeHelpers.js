// TODO: Revisit these functions and determine if any should be
// kept since most of this functionality is now more easily handled
// by the lua API

export const splitUri = (uri) => {
  if (typeof uri == 'string') {
    if (uri === '') {
      return [];
    }
    return uri.split('.');
  } else {
    return uri;
  }
};

export const getIdOfProperty = (uri) => {
  const a = splitUri(uri);
  return a[a.length-1];
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


// TODO: Delete unused function
export const findSubtree = (node, uri) => {
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
export const jsonToLuaString = json => `"${json}"`;

// TODO: Delete unused function
export const traverseTreeForTag = (node, tag) => {
  let data;
  node.subowners.map(element => {
    data = traverseTreeForTag(element, tag);
      if( element.tag.includes(tag)) {
        data = element;
      }
    });
  return data;
};

export const findAllNodesWithTag = (state, tag) => {
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
export const convertEnvelopes = (envelopes) => {
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
export const getLastWordOfUri = (uri) => {
  const index = uri.lastIndexOf('.');
  return (index === -1) ? uri : uri.substring(index + 1);
}

// Get the uri without the last word, or the full uri if it has no dot
export const removeLastWordFromUri = (uri) => {
  const index = uri.lastIndexOf('.');
  return (index === -1) ? uri : uri.substring(0, index);
}

// Returns whether a property should be visible in the gui
export const isPropertyVisible = (properties, uri) => {
  const property = properties[uri];

  const splitUri = uri.split('.');
  if (splitUri.length > 1) {
    if (splitUri[splitUri.length - 1] === 'Enabled')
      return false;
  }

  return property &&
         property.description &&
         property.description.MetaData &&
         property.description.MetaData.Visibility !== 'Hidden';
}

// Returns whether a property owner should be hidden in the gui
export const isPropertyOwnerHidden = (properties, uri) => {
  const prop = properties[uri + '.GuiHidden'];
  return prop && prop.value;
}

// Returns true if a property owner has no visible children
export const isDeadEnd = (propertyOwners, properties, uri) => {
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
