import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Slider.scss';


class Slider extends Component {
  constructor(props) {
    super(props);


  }
  render(){
    const myelement = <h3>Slider!</h3>;
    return(myelement)

  }

}


/*Slider = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(Slider);*/
export default Slider;
