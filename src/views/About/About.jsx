import React from 'react';
import Row from '../../components/common/Row/Row';
import styles from './About.scss';
import logo from './logo.png';
import { SCMInfoKey, VersionInfoKey } from '../../api/keys';
import PropertyString from '../../components/common/PropertyString/PropertyString';
import { connect } from 'react-redux';
import { formatVersion } from '../../api/Version';
import LoadingString from '../../components/common/LoadingString/LoadingString';

const openSpaceVersion = (props) =>
  <p>OpenSpace version: {props.hasVersion ?
      formatVersion(props.version.openSpaceVersion) :
      <LoadingString loading={true}/>}
  </p>

const socketApiVersion = (props) =>
  <p>Socket API version: {props.hasVersion ?
      formatVersion(props.version.socketApiVersion) :
      <LoadingString loading={true}/>}
  </p>

let About = (props) => (
  <Row className={styles.about}>
    <section>
      <img src={logo} alt="OpenSpace Logo" className={styles.img} />
    </section>
    <section>
      <h1>OpenSpace</h1>
      <p>
        <a href="http://openspaceproject.com" target="_blank" rel="noopener noreferrer">
          openspaceproject.com
        </a>
      </p>
      <p>
        OpenSpace is open source interactive data
        visualization software designed to visualize
        the entire known universe and portray our
        ongoing efforts to investigate the cosmos.
      </p>
      {openSpaceVersion(props)}
      {socketApiVersion(props)}
      <p>
        &copy; 2014 - { (new Date()).getUTCFullYear() }
        &nbsp;
        <a href="http://openspaceproject.com/?page_id=24" target="_blank" rel="noopener noreferrer">
          OpenSpace Development Team
        </a>
      </p>
    </section>
  </Row>
);

const mapStateToProps = state => ({
  hasVersion: state.version.isInitialized,
  version: state.version.data
});

About = connect(
  mapStateToProps,
)(About);

export default About;
