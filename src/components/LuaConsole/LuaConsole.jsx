import React from 'react';
import { connect } from 'react-redux';
import Input from '../common/Input/Input/Input';
import styles from './LuaConsole.scss'

function LuaConsole({luaApi}) {
    const [buffer, setBuffer] = React.useState(""); 
    const [suggestion, setSuggestion] = React.useState("");
    const [history, setHistory] = React.useState([]);

    const consoleRef = React.useRef(null);

    React.useEffect(()=> {
        consoleRef.current.focus();
    }, []);

    React.useEffect(() => {
        setBuffer("");  
    }, []);

    function parse(currentBuffer) {
        // Split at . and remove first item "openspace"
        const input = currentBuffer.split(".") ?? currentBuffer;
        if (typeof input === 'object') {
            const functionAndArgs = input.pop(); // remove function and args
            const [functionName, args] = functionAndArgs?.split("(") ?? [undefined, undefined];
            const result = args?.replace?.(/[()"]/g, "");
            const parameters = result?.split(",");
            const namespaces = input;
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
        } else {
            setBuffer(suggestion)
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
                if(e.target.value === "`") {
                    return;
                }
                setBuffer(e.target.value);
                updateSuggestion(e.target.value);
            }}
            onKeyPress={event => {
                if (event.key === 'Enter') {
                    parseAndCall(event.target.value);
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