import React, { Component } from 'react';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import styles from './Shortcut.scss';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import InfoBox from '../common/InfoBox/InfoBox';
import subStateToProps from '../../utils/subStateToProps';
import { connect } from 'react-redux';
import { executeShortcut } from '../../api/Actions'

class Shortcut extends Component {
  constructor(props) {
      super(props);
    }

    render() {
      const { index, documentation, name, script, execute } = this.props;
      return (
        <div key={name} className={styles.shortcutContainer}>
          <Button transparent className={styles.executeButton} onClick={execute} >
            <MaterialIcon icon="play_arrow" />
            </Button>
          <div className={styles.content}> {name} &nbsp; <InfoBox text={documentation} /></div>
        </div>
      );
   }
}

const mapStateToSubState = (state) => ({
  shortcuts: state.shortcuts.data.shortcuts
})

const mapSubStateToProps = ({ shortcuts }, { index }) => {
  const shortcut = shortcuts[index];
  return {
    index: index,
    documentation: shortcut.documentation,
    name: shortcut.name,
    script: shortcut.script
  }
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    execute: () => {
      dispatch(executeShortcut(ownProps.index))
    }
  }
}

Shortcut = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(Shortcut);



export default Shortcut;
