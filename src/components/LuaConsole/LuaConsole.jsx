import React from 'react';
import { connect } from 'react-redux';
import Input from '../common/Input/Input/Input';
import styles from './LuaConsole.scss'


function LuaConsole({luaApi}) {
    const [buffer, setBuffer] = React.useState(""); 
    async function parseAndCall(e) {
        console.log("Buffer " + buffer);
        const array = buffer.split(".");
        const [func, args] = array[array.length - 1].split("(");
        args.replace(/\)/, "");
        console.log(func, args);
        // First argument should be "openspace" - discard
        console.log(luaApi, array[1]);
        console.log(luaApi[func])
        const response = await func.call(1);
    }

    return <div className={styles.luaConsole}>
        Console
        <Input placeholder={"Script..."} onChange={(e) => {setBuffer(e.target.value)}}
        onKeyPress={event => {
            if (event.key === 'Enter') {
                parseAndCall();
                }
            }}></Input>
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