import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import styles from '../LocalStory/localStory.scss';
import StoryButton from './StoryButtonLocal';

class Pick extends Component {
  constructor(props) {
    super(props);

    this.handleStory = this.handleStory.bind(this);

  }

  handleStory(e) {

    this.props.changeStory(e.target.id);
    this.props.setShowStory(false);
    this.props.setShowLocalStory(true);
  }
  
  render() {

    const { climateStorys } = this.props;
    return (

            <StoryButton
              pickStory={this.handleStory}
              storyIdentifier= {climateStorys.title}
            />

    );
  }
}

Pick.propTypes = {
  setShowStory: PropTypes.func.isRequired,
  setShowLocalStory: PropTypes.func.isRequired,
  changeStory: PropTypes.func.isRequired,
  climateStorys: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
    next: PropTypes.func,
  }).isRequired,
};

export default Pick;
