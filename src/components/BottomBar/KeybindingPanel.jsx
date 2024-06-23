import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Keyboard from 'react-simple-keyboard';

import { setPopoverVisibility } from '../../api/Actions';
import HorizontalDelimiter from '../common/HorizontalDelimiter/HorizontalDelimiter';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import Picker from './Picker';

import 'react-simple-keyboard/build/css/index.css';
import './KeybindingPanelKeyboard.css';
import styles from './KeybindingPanel.scss';

// Cleaned up the imports a but and removed unused ones. Wasn't sure if this
// would be useful to keep around, but did so just in case // Emma
// import englishLayout from "simple-keyboard-layouts/build/layouts/english";

function KeybindingPanel() {
  const [activeModifiers, setActiveModifiers] = React.useState([]);
  const [currentActionInfo, setCurrentActionInfo] = React.useState({
    input: '',
    name: 'Select a key to see its action.',
    description: 'A description of the action will appear here',
    isLocal: 'Info about if the action is local will appear here',
    path: 'The actions path will appear here'
  });

  const popoverVisible = useSelector((state) => state.local.popovers.keybinds.visible);
  const actions = useSelector((state) => state.shortcuts);

  const dispatch = useDispatch();

  function togglePopover() {
    dispatch(setPopoverVisibility({
      popover: 'keybinds',
      visible: !popoverVisible
    }));
  }

  function handleModifier(modifier) {
    let modifiers = activeModifiers;
    if (modifiers.includes(modifier)) {
      modifiers = modifiers.filter((e) => e !== modifier);
    } else {
      modifiers.push(modifier);
    }

    setActiveModifiers(modifiers);
    setCurrentActionInfo({
      input: '',
      name: '',
      description: '',
      isLocal: '',
      path: ''
    });
  }

  function checkForModifiers(action) {
    const modifierObject = {
      alt: activeModifiers.includes('alt'),
      control: activeModifiers.includes('control'),
      shift: activeModifiers.includes('shift'),
      super: activeModifiers.includes('super')
    };
    const actionHasModifier = (action.modifiers.super || action.modifiers.alt ||
                               action.modifiers.control || action.modifiers.shift);

    const matchingModifiers = (Object.entries(modifierObject).toString() ===
                               Object.entries(action.modifiers).toString());

    const noActiveModifiers = activeModifiers.length === 0;

    return matchingModifiers || (!actionHasModifier && noActiveModifiers);
  }

  function specialKeyMatch(key, actionKey) {
    let strippedKey = key.substr(1, key.indexOf('}') - 1);
    if (strippedKey.indexOf('arrow') === 0) {
      strippedKey = strippedKey.substring(5);
    }
    strippedKey = strippedKey.charAt(0).toUpperCase() + strippedKey.slice(1);
    if (strippedKey.indexOf('Numpad') === 0) {
      strippedKey = `Keypad ${strippedKey.substring(6)}`;
    }
    if (strippedKey.indexOf('lock') > -1) {
      strippedKey = `${strippedKey.substring(0, strippedKey.indexOf('lock'))}Lock`;
    }

    return actionKey.toLowerCase() === strippedKey.toLowerCase();
  }

  function getActionForKey(key) {
    // Find all action identifiers matching the given key and current modifiers
    const keyActions = [];
    for (let i = 0; i < actions.data.shortcuts.length; i++) {
      const action = actions.data.shortcuts[i];
      if (action.key) {
        if (checkForModifiers(action)) {
          if ((action.key.toLowerCase() === key) || specialKeyMatch(key, action.key)) {
            keyActions.push(action);
          }
        }
      }
    }

    // Get the actual information about the action
    let actionsForKey = [];
    keyActions.forEach((keyAction) => {
      const matched = actions.data.shortcuts.filter(
        (action) => (action.identifier === keyAction.action)
      );
      actionsForKey = actionsForKey.concat(matched);
    });
    return actionsForKey;
  }

  function onKeyPress(button) {
    // Handle modifier clicks
    if ((button === '{shift}') || (button === '{alt}') || (button === '{control}') || (button === '{super}')) {
      const strippedModifier = button.substr(1, button.length - 2);
      handleModifier(strippedModifier);
      return;
    }

    /**
     * Handle other button clicks
     */
    const action = {
      name: '',
      documentation: '',
      isLocal: '',
      guiPath: ''
    };

    const mappedActions = getActionForKey(button);
    if (mappedActions.length === 0) {
      let modifier = '';
      if (activeModifiers.length > 0) {
        activeModifiers.forEach((am) => {
          modifier += `${am} + `;
        });
      }
      action.name = `No action for: ${modifier}${button}`;
    } else {
      for (let i = 0; i < mappedActions.length; i++) {
        const mappedAction = mappedActions[i];
        action.name = mappedAction.name;
        action.documentation += mappedAction.documentation;
        action.isLocal += mappedAction.synchronization ? 'No' : 'Yes';
        action.guiPath += mappedAction.guiPath;
        if (i !== (mappedActions.length - 1)) {
          action.name += '  &&  ';
          action.documentation += '  &&  ';
          action.isLocal += '  &&  ';
          action.guiPath += '  &&  ';
        }
      }
    }

    setCurrentActionInfo({
      input: button,
      name: action.name,
      description: action.documentation,
      isLocal: action.isLocal,
      path: action.guiPath
    });
  }

  function reverseSpecialKey(key) {
    if (key === 'Right') {
      return '{arrowright}';
    } if (key === 'Left') {
      return '{arrowleft}';
    }
    if (key.indexOf('Keypad') === 0) {
      const number = key.substring(7);
      if (!Number.isNaN(number - parseFloat(number))) {
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
    } if (!Number.isNaN(key - parseFloat(key))) {
      // is a number
      return key;
    }
    return `{${key.toLowerCase()}}`;
  }

  const commonKeyboardOptions = {
    onKeyPress: (button) => onKeyPress(button),
    theme: 'simple-keyboard hg-theme-default hg-layout-default',
    physicalKeyboardHighlight: true,
    syncInstanceInputs: true,
    mergeDisplay: true,
    debug: false
  };

  const keyboardOptions = {
    ...commonKeyboardOptions,
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
        '{control} {alt} {space} {super}'
      ]
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
      '{super}': 'super'
    }
  };

  const keyboardControlPadOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: [
        '{prtscr} {scrolllock} {pause}',
        '{insert} {home} {pageup}',
        '{delete} {end} {pagedown}'
      ]
    }
  };

  const keyboardArrowsOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: ['{arrowup}', '{arrowleft} {arrowdown} {arrowright}']
    }
  };

  const keyboardNumPadOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: [
        '{numlock} {numpaddivide} {numpadmultiply}',
        '{numpad7} {numpad8} {numpad9}',
        '{numpad4} {numpad5} {numpad6}',
        '{numpad1} {numpad2} {numpad3}',
        '{numpad0} {numpaddecimal}'
      ]
    }
  };

  const keyboardNumPadEndOptions = {
    ...commonKeyboardOptions,
    layout: {
      default: ['{numpadsubtract}', '{numpadadd}', '{numpadenter}']
    }
  };

  function popover() {
    // TODO @micahnyc fix colors not from scss
    const inputString = ` ${currentActionInfo.input}`;
    let mappedButtonString = '';

    for (let i = 0; i < actions.data.shortcuts?.length; i++) {
      const action = actions.data.shortcuts[i];
      const key = action ? action.key : undefined;
      if (key) {
        let keyString = '';
        if (key.length === 1 && key.match(/[a-z]/i)) {
          // Alphabetic characters
          keyString = key.toLowerCase();
        } else if (key.length === 1) {
          // Any other "simple" characters (with only one char)
          keyString = key;
        } else {
          // The rest (modifiers, numpads, etc)
          keyString = reverseSpecialKey(action.key);
        }
        if (checkForModifiers(action)) {
          mappedButtonString += (`${keyString} `);
        }
      }
    }
    mappedButtonString = mappedButtonString.slice(0, -1);

    let toggledModifierString = '';
    for (let i = 0; i < activeModifiers.length; i++) {
      toggledModifierString += `{${activeModifiers[i]}} `;
    }

    const buttonTheme = [];
    if (mappedButtonString !== '') {
      buttonTheme.push({ class: 'hg-mapped', buttons: mappedButtonString });
    }
    if (toggledModifierString !== '') {
      buttonTheme.push({ class: 'hg-toggled', buttons: toggledModifierString });
    }
    if (inputString !== '') {
      buttonTheme.push({ class: 'hg-highlight', buttons: inputString });
    }

    return (
      <Popover
        className={`${Picker.Popover} && ${styles.keybindingPopover}`}
        title="Keybinding Viewer"
        closeCallback={togglePopover}
        detachable
        position={{ x: -450, y: -150 }}
        attached={false}
      >
        <HorizontalDelimiter />
        <div className={Popover.styles.content}>
          <div className="keyboardContainer">
            <Keyboard
              baseClass="simple-keyboard-main"
              // keyboardRef={(r) => (keyboard = r)}
              layoutName="default"
              buttonTheme={buttonTheme}
              {...keyboardOptions}
            />
            <div className="controlArrows">
              <Keyboard
                baseClass="simple-keyboard-control"
                buttonTheme={buttonTheme}
                {...keyboardControlPadOptions}
              />
              <Keyboard
                baseClass="simple-keyboard-arrows"
                buttonTheme={buttonTheme}
                {...keyboardArrowsOptions}
              />
            </div>
            <div className="numPad">
              <Keyboard
                baseClass="simple-keyboard-numpad"
                buttonTheme={buttonTheme}
                {...keyboardNumPadOptions}
              />
              <Keyboard
                baseClass="simple-keyboard-numpadEnd"
                buttonTheme={buttonTheme}
                {...keyboardNumPadEndOptions}
              />
            </div>
          </div>
          <HorizontalDelimiter />
          <Row>
            <div className={styles.textContainer}>
              <section>
                <span className={styles.actionLabel}>Name: </span>
                {currentActionInfo.name}
              </section>
              <section>
                <span className={styles.actionLabel}>Description: </span>
                {currentActionInfo.name}
              </section>
              <section>
                <span className={styles.actionLabel}>Is Local: </span>
                {currentActionInfo.isLocal}
              </section>
              <section>
                <span className={styles.actionLabel}>GUI Path: </span>
                {currentActionInfo.path}
              </section>
            </div>
          </Row>
        </div>
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      { popoverVisible && popover() }
    </div>
  );
}

export default KeybindingPanel;
