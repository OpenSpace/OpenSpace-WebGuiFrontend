import React from 'react';
import { connect } from 'react-redux';

import LoadingString from '../../components/common/LoadingString/LoadingString';
import Row from '../../components/common/Row/Row';

import logo from './logo.png';

import styles from './About.scss';

const openSpaceVersion = (props) => {
  const formatVersion = (version) =>
    version.major != 255 && version.minor != 255 && version.patch != 255 ?
      `${version.major}.${version.minor}.${version.patch}` :
      "Custom";

  const currentVersion = (
    <p>
      OpenSpace version:
      {' '}
      {
        props.hasVersion ?
          formatVersion(props.version.openSpaceVersion) :
          <LoadingString loading />
      }
    </p>
  );

  return (
    <>
      { currentVersion }
    </>
  );
};

function About(props) {
  return (
    <Row className={styles.about}>
      <section>
        <img src={logo} alt="OpenSpace Logo" className={styles.img} />
      </section>
      <section>
        <h1>OpenSpace</h1>
        <p>
          OpenSpace is open source interactive data
          visualization software designed to visualize
          the entire known universe and portray our
          ongoing efforts to investigate the cosmos.
        </p>
        {openSpaceVersion(props)}
        <p>
          &copy; 2014 -
          {' '}
          { (new Date()).getUTCFullYear() }
        &nbsp; OpenSpace Development Team
          <br />
          openspaceproject.com
        </p>
      </section>
    </Row>
  );
}

const mapStateToProps = (state) => ({
  hasVersion: state.version.isInitialized,
  version: state.version.data
});

About = connect(
  mapStateToProps,
)(About);

export default About;
