import * as React from 'react'

const TutorialContext = React.createContext()

function TutorialProvider(props) {
  const [tutorial, setTutorial] = React.useState({})
  const value = [tutorial, setTutorial]
  return <TutorialContext.Provider value={value} {...props} />
}

function useTutorial() {
  const context = React.useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}

function useContextRef(id) {
  const newRef = React.useRef();
  const [tutorial, setTutorial] = useTutorial();
  
  React.useEffect(() => {
    const newTutorial = { ...tutorial };
    newTutorial[id] = newRef;
    setTutorial(newTutorial);
    return () => newTutorial[id] = null;
  }, [id]);

  return newRef;
}


export { TutorialProvider, useTutorial, useContextRef };