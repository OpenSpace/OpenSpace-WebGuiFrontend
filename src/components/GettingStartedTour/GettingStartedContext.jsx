import * as React from 'react'
import contents from './GettingStartedContent.json'

const TutorialContext = React.createContext()

function TutorialProvider(props) {
  let allRefKeys = {};
  contents.map(content => {
    if(content.key) { 
      content.key.map(key => {
        if(!allRefKeys.hasOwnProperty(key)) {
          allRefKeys[key] = undefined
        }
      });
    }
  });
  const newRef = React.useRef(allRefKeys);
  return <TutorialContext.Provider value={newRef} {...props} />
}

function useTutorial() {
  const context = React.useContext(TutorialContext)
  if (!context) {
    throw new Error('The hook \'useTutorial\' must be used within a TutorialProvider')
  }
  return context
}

export { TutorialProvider, useTutorial };