import * as React from 'react';

import contents from './GettingStartedContent.json';

const RefsContext = React.createContext();

// This context provides refs to the components that are shown in the
// Getting Started Tour. They are stored in a context so they can
// be inserted into the context from wherever.
// They are stored in one ref which stores an object with all keys
// and their assigned html element
function RefsProvider(props) {
  const allRefKeys = {};
  contents.forEach((content) => {
    if (content.key) {
      content.key.forEach((key) => {
        if (!Object.keys(allRefKeys).includes(key)) {
          allRefKeys[key] = undefined;
        }
      });
    }
  });
  const newRef = React.useRef(allRefKeys);
  return <RefsContext.Provider value={newRef} {...props} />;
}

function useContextRefs() {
  const context = React.useContext(RefsContext);
  if (!context) {
    throw new Error('The hook \'useContextRefs\' must be used within a RefsProvider');
  }
  return context;
}

export { RefsProvider, useContextRefs };
