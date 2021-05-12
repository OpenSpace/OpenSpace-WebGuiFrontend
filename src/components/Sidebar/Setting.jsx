import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Switch } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';

import styles from './Setting.scss';

const BlueSwitch = withStyles({
  switchBase: {
    color: '#7F7F7F',
    '&$checked': {
      color: '#3dbdee',
    },
    '&$checked + $track': {
      backgroundColor: '#3dbdee',
    },
  },
  checked: {},
  track: {
    backgroundColor: '#777',
  },
})(Switch);


class Setting extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    const { title, onChange } = this.props;

    return (
      <React.Fragment>
          <div className={styles.Setting}>
            {title}
          <BlueSwitch {...this.props} className={`${styles.Switch}`} size="small" color="primary" checked={this.props.checked} onChange={onChange} />
          </div>
      </React.Fragment>
    );
  }
};

Setting.propTypes = {
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default Setting;
