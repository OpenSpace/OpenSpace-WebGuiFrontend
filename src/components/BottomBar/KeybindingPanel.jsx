import React, { Component } from 'react';
import { connect } from 'react-redux';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import { setPopoverVisibility } from '../../api/Actions';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import styles from './KeybindingPanel.scss';
import './KeybindingPanelKeyboard.css';
import Picker from './Picker';

// Cleaned up the imports a but and removed unused ones. Wasn't sure if this
// would be useful to keep around, but did so just in case // Emma
// import englishLayout from "simple-keyboard-layouts/build/layouts/english";

class KeybindingPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeModifiers: [],
      input: '',
      actionName: "Select a key to see it's action.",
      actionDescription: 'A description of the action will appear here',
      actionPath: 'The actions path will appear here',
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.handleModifier = this.handleModifier.bind(this);
    this.getActionForKey = this.getActionForKey.bind(this);
    this.specialKeyMatch = this.specialKeyMatch.bind(this);
    this.reverseSpecialKey = this.reverseSpecialKey.bind(this);
    this.checkForModifiers = this.checkForModifiers.bind(this);
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible);
  }

  onKeyPress = (button) => {
    let action;
    let hadModifier = false;
    if ((button === '{shift}') || (button === '{alt}') || (button === '{control}') || (button === '{super}')) {
      /**
        * handle modifiers
      */
      const strippedModifier = button.substr(1, button.length - 2);
      this.handleModifier(strippedModifier);
      hadModifier = true;
    } else {
      const mappedActions = this.getActionForKey(button);
      if (mappedActions.length == 0) {
        let modifier = '';
        if (this.state.activeModifiers.length > 0) {
          this.state.activeModifiers.map((am) => {
            modifier += `${am} + `;
          });
        }
        action = {
          name: `No action for: ${modifier}${button}`,
          documentation: '',
          guiPath: '',
        };
      } else {
        action = {
          name: '',
          documentation: '',
          guiPath: '',
        };

        for (let i = 0; i < mappedActions.length; i++) {
          const mappedAction = mappedActions[i];
          action.name += mappedAction.name;
          action.documentation += mappedAction.documentation;
          action.guiPath += mappedAction.guiPath;
          if (i != (mappedActions.length - 1)) {
            action.name += '  &&  ';
            action.documentation += '  &&  ';
            action.guiPath += '   && ';
          }
        }
      }

      if (action) {
        this.setState({
          ...this.state,
          input: button,
          actionName: action.name,
          actionDescription: action.documentation,
          actionPath: action.guiPath,
        });
      }
    }
  };

  reverseSpecialKey = (key) => {
    if (key == 'Right') {
      return '{arrowright}';
    } if (key == 'Left') {
      return '{arrowleft}';
    }
    if (key.indexOf('Keypad') == 0) {
      const number = key.substring(7);
      if (!isNaN(number - parseFloat(number))) {
        return `{numpad${number}}`;
      }
      // keypad but not number
      let keyswap = '';
      switch (number) {
        case '*':
          keyswap = 'multiply';
          break;
        case '/':
          keyswap = 'divide';
          break;
        case '-':
          keyswap = 'minus';
          break;
        case '+':
          keyswap = 'add';
          break;
        case 'Enter':
          keyswap = 'enter';
          break;
        default:
          keyswap = number;
          break;
      }
      return `{numpad${keyswap}}`;
    } if (!isNaN(key - parseFloat(key))) {
      // is a number
      return key;
    }
    return `{${key.toLowerCase()}}`;

    return '';
  };

  specialKeyMatch = (key, actionKey) => {
    let strippedKey = key.substr(1, key.indexOf('}') - 1);
    if (strippedKey.indexOf('arrow') == 0) {
      strippedKey = strippedKey.substring(5);
    }
    strippedKey = strippedKey.charAt(0).toUpperCase() + strippedKey.slice(1);
    if (strippedKey.indexOf('Numpad') == 0) {
      strippedKey = `Keypad ${strippedKey.substring(6)}`;
    }
    if (strippedKey.indexOf('lock') > -1) {
      strippedKey = `${strippedKey.substring(0, strippedKey.indexOf('lock'))}Lock`;
    }

    return actionKey.toLowerCase() == strippedKey.toLowerCase();
  };

  checkForModifiers = (action) => {
    let showForModifiers = false;
    const modifierObject = {
      alt: this.state.activeModifiers.includes('alt'),
      control: this.state.activeModifiers.includes('control'),
      shift: this.state.activeModifiers.includes('shift'),
    };
    modifierObject.super = this.state.activeModifiers.includes('super');
    let hadModifier = (action.modifiers.super == false) && (action.modifiers.alt == false) && (action.modifiers.control == false) && (action.modifiers.shift == false);
    hadModifier = !hadModifier;
    showForModifiers = Object.entries(modifierObject).toString() === Object.entries(action.modifiers).toString();
    if (showForModifiers || (!hadModifier && this.state.activeModifiers.length == 0)) {
      return true;
    }
    return false;
  };

  getActionForKey = (key) => {
    const keyActions = [];

    for (let i = 0; i < this.props.actions.data.shortcuts.length; i++) {
      const action = this.props.actions.data.shortcuts[i];
      if (action.key) {
        if (this.checkForModifiers(action)) {
          if ((action.key.toLowerCase() == key) || this.specialKeyMatch(key, action.key)) {
            keyActions.push(action);
          }
        }
      }
    }

    let actionActions = [];
    for (var keyAction of keyActions) {
      const matched = this.props.actions.data.shortcuts.filter((action) => (action.identifier == keyAction.action));
      actionActions = actionActions.concat(matched);
    }
    return actionActions;
  };

  handleModifier = (modifier) => {
    let modifiers = this.state.activeModifiers;
    if (modifiers.includes(modifier)) {
      modifiers = modifiers.filter((e) => e != modifier);
    } else {
      modifiers.push(modifier);
    }

    const newState = {
      activeModifiers: modifiers,
      actionName: '',
      actionDescription: '',
      input: '',
      actionPath: '',
    };
    this.setState(newState);
  };

  commonKeyboardOptions = {
    onKeyPress: (button) => this.onKeyPress(button),
    theme: 'simple-keyboard hg-theme-default hg-layout-default',
    physicalKeyboardHighlight: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    debug: false,
  };

  keyboardOptions = {
    ...this.commonKeyboardOptions,
    /**
     * Layout by:
     * Sterling Butters (https://github.com/SterlingButters)
     */
    layout: {
      default: [
        '{escape} {f1} {f2} {f3} {f4} {f5} {f6} {f7} {f8} {f9} {f10} {f11} {f12}',
        '` 1 2 3 4 5 6 7 8 9 0 - = {backspace}',
        '{tab} q w e r t y u i o p [ ] \\',
        "{capslock} a s d f g h j k l ; ' {enter}",
        '{shift} z x c v b n m , . / {shift}',
        '{control} {alt} {space} {super}',
      ],
    },
    display: {
      '{escape}': 'esc ⎋',
      '{tab}': 'tab ⇥',
      '{backspace}': 'backspace ⌫',
      '{enter}': 'enter ↵',
      '{capslock}': 'caps lock ⇪',
      '{shift}': 'shift ⇧',
      '{control}': 'ctrl ⌃',
      '{alt}': 'alt ⌥',
      '{super}': 'super',
    },
  };

  keyboardControlPadOptions = {
    ...this.commonKeyboardOptions,
    layout: {
      default: [
        '{prtscr} {scrolllock} {pause}',
        '{insert} {home} {pageup}',
        '{delete} {end} {pagedown}',
      ],
    },
  };

  keyboardArrowsOptions = {
    ...this.commonKeyboardOptions,
    layout: {
      default: ['{arrowup}', '{arrowleft} {arrowdown} {arrowright}'],
    },
  };

  keyboardNumPadOptions = {
    ...this.commonKeyboardOptions,
    layout: {
      default: [
        '{numlock} {numpaddivide} {numpadmultiply}',
        '{numpad7} {numpad8} {numpad9}',
        '{numpad4} {numpad5} {numpad6}',
        '{numpad1} {numpad2} {numpad3}',
        '{numpad0} {numpaddecimal}',
      ],
    },
  };

  keyboardNumPadEndOptions = {
    ...this.commonKeyboardOptions,
    layout: {
      default: ['{numpadsubtract}', '{numpadadd}', '{numpadenter}'],
    },
  };

  get popover() {
    // TODO @micahnyc fix colors not from scss
    let mappedButtonString = ' ';
    const inputString = ` ${this.state.input}`;
    for (var i = 0; i < this.props.actions.data.shortcuts.length; i++) {
      const action = this.props.actions.data.shortcuts[i];
      if (action.key) {
        let keyString = '';
        if (action.key.length === 1 && action.key.match(/[a-z]/i)) {
          keyString = action.key.toLowerCase();
        } else {
          keyString = this.reverseSpecialKey(action.key);
        }
        if (this.checkForModifiers(action)) {
          mappedButtonString += (`${keyString} `);
        }
      }
    }
    mappedButtonString = mappedButtonString.slice(0, -1);
    let toggledModifierString = '';
    for (var i = 0; i < this.state.activeModifiers.length; i++) {
      toggledModifierString += `{${this.state.activeModifiers[i]}} `;
    }

    const buttonTheme = [];
    if (mappedButtonString != '') {
      buttonTheme.push({ class: 'hg-mapped', buttons: mappedButtonString });
    }
    if (toggledModifierString != '') {
      buttonTheme.push({ class: 'hg-toggled', buttons: toggledModifierString });
    }
    if (inputString != '') {
      buttonTheme.push({ class: 'hg-highlight', buttons: inputString });
    }

    return (
      <Popover
        className={`${Picker.Popover} && ${styles.keybindingPopover}`}
        title="Keybinding Viewer"
        closeCallback={this.togglePopover}
        detachable
        position={{ x: -450, y: -150 }}
        attached={false}
      >
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.content}>
          <div className="keyboardContainer">
            <Keyboard
              baseClass="simple-keyboard-main"
              keyboardRef={(r) => (this.keyboard = r)}
              layoutName="default"
              buttonTheme={buttonTheme}
              {...this.keyboardOptions}
            />
            <div className="controlArrows">
              <Keyboard
                baseClass="simple-keyboard-control"
                buttonTheme={buttonTheme}
                {...this.keyboardControlPadOptions}
              />
              <Keyboard
                baseClass="simple-keyboard-arrows"
                buttonTheme={buttonTheme}
                {...this.keyboardArrowsOptions}
              />
            </div>
            <div className="numPad">
              <Keyboard
                baseClass="simple-keyboard-numpad"
                buttonTheme={buttonTheme}
                {...this.keyboardNumPadOptions}
              />
              <Keyboard
                baseClass="simple-keyboard-numpadEnd"
                buttonTheme={buttonTheme}
                {...this.keyboardNumPadEndOptions}
              />
            </div>
          </div>
          <hr className={Popover.styles.delimiter} />
          <Row>
            <div className={styles.textContainer}>
              <section>
                <label className={styles.actionLabel}>Name: </label>
                {this.state.actionName}
              </section>
              <section>
                <label className={styles.actionLabel}>Description: </label>
                {this.state.actionDescription}
              </section>
              <section>
                <label className={styles.actionLabel}>GUI Path: </label>
                {this.state.actionPath}
              </section>
            </div>
          </Row>
        </div>
      </Popover>
    );
  }

  render() {
    const { popoverVisible } = this.props;
    return (
      <div className={Picker.Wrapper}>
        { popoverVisible && this.popover }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { visible } = state.local.popovers.keybinds;
  return {
    popoverVisible: visible,
    luaApi: state.luaApi,
    actions: state.shortcuts,
  };
};

const mapDispatchToProps = (dispatch) => ({
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'keybinds',
      visible,
    }));
  },
});

KeybindingPanel = connect(mapStateToProps, mapDispatchToProps)(KeybindingPanel);

export default KeybindingPanel;
