//Apod.jsx
import React, { Component } from 'react';
import Row from '../../components/common/Row/Row';
import styles from './Apod.scss';
import { SCMInfoKey, VersionInfoKey } from '../../api/keys';
import PropertyString from '../../components/common/PropertyString/PropertyString';
import { connect } from 'react-redux';
import LoadingString from '../../components/common/LoadingString/LoadingString';

//https://api.nasa.gov/planetary/apod?api_key=Pqmi0ErsDxRXLsJfaxXsg3Jn44a0iQUNAl7e42Oc

class Apod extends Component {


constructor(props) {
    super(props);
    this.state = {
      apod: {},
    };
  }

  componentDidMount() {
    fetch(`https://api.nasa.gov/planetary/apod?api_key=Pqmi0ErsDxRXLsJfaxXsg3Jn44a0iQUNAl7e42Oc`)
      .then( (response) => {
        response.json().then((json) => {
          console.log("got", json);
          this.setState({apod:json});
        });
      });

  }

  render() {

    const { apod } = this.state;

    return (
      <Row className={styles.about}>
        <section>
          <h1>NASA Astronomy Picture of the day - { (new Date()).toLocaleDateString() }</h1>
          <p>
        {apod.explanation}
        </p>
        </section>
        <section>
          <img src={apod.hdurl} alt="NASA Astronomy Picture of the day" className={styles.img} />
        </section>
      </Row>
    )
  }
}

// const mapStateToProps = (state) => {
//   const stuff = state.apod;
//   console.log("Stuff:",stuff);
//   if (!stuff){
//     return;
//   }
// 	return {
//     ApodDesc: stuff.explanation,
//     ApodURL: stuff.hdrl//"https://apod.nasa.gov/apod/image/0912/GeminidAurora_Hansen1.jpg",
//   };
// };

// Apod = connect(
//   mapStateToProps,
// )(Apod);

export default Apod;
