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
/*
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
  console.log(node);
  const subowner = node.subowners.find(element => {
    return element.identifier === splittedUri[0]
  })

  if (!subowner) {
    return;
  }

  const slicedUri = splittedUri.slice(1);
  return findSubtree(subowner, slicedUri);
};
*/
export const jsonToLuaString = json => `"${json}"`;

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
