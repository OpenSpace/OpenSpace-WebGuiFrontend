import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { resetStoryTree } from '../../api/Actions';
import styles from '../Climate/Button.scss'
import Icon from '../common/MaterialIcon/MaterialIcon';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import ButtonStyles from '../Climate/Button.scss';
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
      className = {styles.next}
      onClick={this.goToMenu}
      role="button"
      tabIndex="0">
      <div className = {ButtonStyles.next}>
        <Icon icon="replay" className={styles.Icon} />
        <SmallLabel>New Story</SmallLabel>
      </div>
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
