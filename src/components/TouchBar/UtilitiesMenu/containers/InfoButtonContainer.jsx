import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import InfoButton from '../presentational/InfoButton';

class InfoButtonController extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPopover: false
    };
  }

  render() {
    return (
      <div>
        {this.props.story.title && (
          <InfoButton
            storyTitle={this.props.story.title}
            storyInfo={this.props.story.storyinfo}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  story: state.storyTree.story
});

InfoButtonController = connect(
  mapStateToProps,
)(InfoButtonController);

InfoButtonController.propTypes = {
  story: PropTypes.objectOf(PropTypes.shape({
    storyTitle: PropTypes.string,
    storyInfo: PropTypes.string
  }))
};

InfoButtonController.defaultProps = {
  story: {}
};

export default InfoButtonController;
