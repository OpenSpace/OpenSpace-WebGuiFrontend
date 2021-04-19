import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './FocusEntry.scss';
import Picker from '../Picker';
import MaterialIcon from '../../common/MaterialIcon/MaterialIcon';
import { jsonToLuaString } from '../../../utils/propertyTreeHelpers';

class SkybrowserFocusEntry extends Component {
  constructor(props) {
    super(props);
    this.select = this.select.bind(this);
  }

  select(evt) {
    const { identifier } = this.props;
    if (this.props.onSelect) {
      this.props.onSelect(identifier, evt);
    }
  }

  get isActive() {
    return this.props.identifier === this.props.active;
  }

  render() {
    const { name, identifier, url, credits, creditsUrl } = this.props;
    return (
      <li className={`${styles.entry} ${this.isActive && styles.active}`} onClick={this.select}>
        <span className={styles.title}>
          { name || identifier }
        </span>
        <p>
        {credits}
        </p>
        <Picker onClick={() =>  {
          const newWindow = window.open(creditsUrl, '_blank', 'noopener,noreferrer');
          if (newWindow) newWindow.opener = null;
        }}>
            <div>
              <MaterialIcon className={styles.photoIcon} icon="more_horiz" />
            </div>
          </Picker>
        <ul>
          <img src={url} alt={name} />
        </ul>
      </li>

    );
  }
}

SkybrowserFocusEntry.propTypes = {
  identifier: PropTypes.string.isRequired,
  name: PropTypes.string,
  onSelect: PropTypes.func,
  active: PropTypes.string,
};

SkybrowserFocusEntry.defaultProps = {
  onSelect: null,
  active: '',
};

export default SkybrowserFocusEntry;
