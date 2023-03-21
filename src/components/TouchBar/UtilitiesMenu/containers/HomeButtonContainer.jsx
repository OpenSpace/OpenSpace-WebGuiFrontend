import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { resetStoryTree } from '../../../../api/Actions';
import HomeButton from '../presentational/HomeButton';

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
      <HomeButton handleClick={this.goToMenu} />
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
