import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CenteredLabel from '../../common/CenteredLabel/CenteredLabel';
import styles from '../../Climate/Button.scss';
import StoryButton from './StoryButtonLocal';

class Pick extends Component {
  constructor(props) {
    super(props);

    this.handleStory = this.handleStory.bind(this);
  }

  handleStory(e) {

    this.props.changeStory(e.target.id);

  }

  Increment = () => {
        this.setState((prevState) => ({
          StoryStep: prevState.StoryStep + 1
    }));
  }



  render() {

    const { climateStorys, next } = this.props;

    return (

            <StoryButton
              pickStory={this.handleStory}
              next = {next}
              storyIdentifier= {climateStorys.title}


            />

    );
  }
}

Pick.propTypes = {
  changeStory: PropTypes.func.isRequired,
  climateStorys: PropTypes.shape({
    title: PropTypes.string,
    info: PropTypes.string,
    next: PropTypes.func,
  }).isRequired,
};

export default Pick;
