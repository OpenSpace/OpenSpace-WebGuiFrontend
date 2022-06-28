import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { resetStoryTree } from '../../../api/Actions';
import styles from '../../TouchBar/UtilitiesMenu/style/UtilitiesButtons.scss';
import Icon from '../../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../../common/SmallLabel/SmallLabel';

class HomeButtonContainer extends Component {
  constructor(props) {
    super(props);

    this.goToMenu = this.goToMenu.bind(this);
  }

  goToMenu() {
    this.props.ResetStoryTree(true);
    this.props.resetStory();
  }

  render() {
    return (
      <div
        className={`${styles.UtilitiesButton}`}
        onClick={this.goToMenu}
        role="button"
        tabIndex="0"
      >
        <Icon icon="import_contacts" className={styles.Icon} />
        <SmallLabel>Start Stories</SmallLabel>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  ResetStoryTree: (reset) => {
    dispatch(resetStoryTree(reset));
  },
});

HomeButtonContainer = connect(
  null,
  mapDispatchToProps,
)(HomeButtonContainer);


HomeButtonContainer.propTypes = {
  ResetStoryTree: PropTypes.func,
};

HomeButtonContainer.defaultProps = {
  ResetStoryTree: () => {},
};

export default HomeButtonContainer;
