import React from 'react';
import { connect } from 'react-redux';
import styles from './LuaConsole.scss'

function LuaConsole({luaApi}) {
  const [buffer, setBuffer] = React.useState(""); 
  const [suggestion, setSuggestion] = React.useState("");
  const [history, setHistory] = React.useState([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);

  const consoleRef = React.useRef(null);

  React.useEffect(()=> {
    consoleRef.current.focus();
  }, []);

  React.useEffect(() => {
    setBuffer("");  
  }, []);

  function parse(currentBuffer) {
    // Split at . and remove first item "openspace"
    const [input, args] = currentBuffer?.split("(") ?? [currentBuffer, undefined];
    const functionNameArray = input.split(".") ?? currentBuffer;
    if (typeof functionNameArray === 'object') {
      const result = args?.replace?.(/[()"]/g, "");
      const parameters = result?.split(",").map(parameter => {
        if(parameter === "true") {
          return true;
        }
        if(parameter === "false") {
          return false;
        }
        if(Number(parameter)) {
          return Number(parameter);
        }
        else return parameter;
      });
      const functionName = functionNameArray.pop();
      const namespaces = functionNameArray;
      return [namespaces, functionName, parameters];
    }
    return [[], input, undefined];
  }

  function getNamespace(namespaces) {
    let namespacesCopy = [...namespaces]; 
    namespacesCopy.shift(); // remove "openspace"
    let functionObject = luaApi;
    for(let i = 0; i < namespacesCopy.length; i++) {
      functionObject = functionObject?.[namespacesCopy[i]];
    }
    return functionObject;
  }

  async function parseAndCall(currentBuffer) {
    const [namespaces, functionName, parameters] = parse(currentBuffer);
    const functionObject = getNamespace(namespaces);
    // Call function if it exists
    if(functionObject[functionName]) {
      const response = await functionObject?.[functionName]?.(...parameters);
      let historyCopy = [...history];
      historyCopy.push(currentBuffer);
      setHistory(historyCopy);
      setBuffer("");
      setSuggestion("");
    }
    else {
      console.error('No function called ' + functionName);
    }
  }

  function updateSuggestion(currentBuffer) {
    const [namespaces, functionName, parameters] = parse(currentBuffer);
    const functionObject = getNamespace(namespaces);
    let suggestionList;
    if(namespaces.length > 0) {
      suggestionList = [...Object.keys(functionObject)];
    } else {
      suggestionList = ["openspace", ...Object.keys(functionObject)];
    }
    try {
      const regex =  new RegExp(`^${functionName}`,''); // correct way
      let found = suggestionList.find(word => regex.test(word));
      let namespacesString = "";
      namespaces.map(namespace => namespacesString += namespace + ".");
      if(found === undefined) {
          found = "";
      }
      setSuggestion(namespacesString + found);
    } catch(e) { 
      console.error("Console couldn't read character: " + e);
    }
  }

    return <div className={styles.luaConsole}>
      <div className={styles.historyWrapper}>
          <p className={styles.history}>
              {history?.[history.length - 1]}
        </p>
      </div>
      <input 
        spellCheck={false}
        className={styles.consoleInput}
        placeholder={""} 
        value={buffer} onChange={(e) => {
          if(e.target.value === "`" || e.target.value === '§') {
              return;
          }
          setBuffer(e.target.value);
          updateSuggestion(e.target.value);
        }}
        onKeyDown={ (e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            setBuffer(suggestion);
            setHistoryIndex(-1); 
          }
          else if(e.key === 'Enter') {
            parseAndCall(e.target.value);
            setHistoryIndex(-1);
          }
          else if(e.key === "ArrowUp" || e.key === "ArrowDown") {
            let index = e.key === "ArrowUp" ? historyIndex + 1 : historyIndex - 1;
            index = Math.min(Math.max(index, 0), history.length - 1)
            setHistoryIndex(index);
            setBuffer(history?.[history.length - 1 - index]);
            e.preventDefault();
          }
        }}
        ref={consoleRef}
      />
      <p className={styles.suggestion}>{suggestion}</p>
    </div>
}

const mapStateToProps = state => ({
  luaApi: state.luaApi,
});

const mapDispatchToProps = dispatch => ({

});

LuaConsole = connect(mapStateToProps, mapDispatchToProps,
)(LuaConsole);

export default LuaConsole;