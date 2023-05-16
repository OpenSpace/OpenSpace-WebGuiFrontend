import * as React from 'react';
import contents from './GettingStartedContent.json';

const RefsContext = React.createContext();

function RefsProvider(props) {
  const allRefKeys = {};
  contents.map((content) => {
    if (content.key) {
      content.key.map((key) => {
        if (!allRefKeys.hasOwnProperty(key)) {
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
