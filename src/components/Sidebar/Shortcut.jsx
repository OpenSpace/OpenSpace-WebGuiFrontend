import React, { Component } from 'react';
import { connect } from 'react-redux';
import { executeShortcut } from '../../api/Actions';
import subStateToProps from '../../utils/subStateToProps';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import styles from './Shortcut.scss';

const modifierStrings = {
  alt: 'ALT',
  control: 'CTRL',
  shift: 'SHIFT',
  super: 'SUPER',
};

class Shortcut extends Component {
  constructor(props) {
    super(props);
  }

  get keybinding() {
    const { key, modifiers } = this.props.data;
    if (!(key && modifiers)) {
      return null;
    }
    const modifierString = Object.keys(modifiers)
      .map((m) => (modifiers[m] ? modifierStrings[m] : false))
      .filter((m) => m)
      .join(' + ');

    const keyString = (modifierString === '') ? key : (`${modifierString} + ${key}`);

    return <span className={styles.keybinding}>{keyString}</span>;
  }

  render() {
    const { documentation, name } = this.props.data;
    const { execute } = this.props;

    return (
      <div className={styles.shortcutContainer}>
        <Button transparent className={styles.executeButton} onClick={execute}>
          <MaterialIcon icon="play_arrow" />
        </Button>
        <div className={styles.content}>
          {name}
          {' '}
          {this.keybinding}
          {' '}
&nbsp;
          {' '}
          <InfoBox text={documentation} />
        </div>
      </div>
    );
  }
}

const mapStateToSubState = (state) => ({
  shortcuts: state.shortcuts.data.shortcuts,
});

const mapSubStateToProps = ({ shortcuts }, { index }) => {
  const shortcut = shortcuts[index];
  return {
    data: shortcut,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  execute: () => {
    dispatch(executeShortcut(ownProps.index));
  },
});

Shortcut = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(Shortcut);

export default Shortcut;
