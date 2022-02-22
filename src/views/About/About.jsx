import React from 'react';
import { connect } from 'react-redux';
import { formatVersion, isOlder } from '../../api/Version';
import LoadingString from '../../components/common/LoadingString/LoadingString';
import Row from '../../components/common/Row/Row';
import styles from './About.scss';
import logo from './logo.png';

const openSpaceVersion = (props) => {
  const currentVersion = <p>OpenSpace version: {
    props.hasVersion ?
      formatVersion(props.version.openSpaceVersion) :
      <LoadingString loading={true}/>
    }
  </p>

  let latestAvailableVersion = null;

  const newerExists = props.hasVersion &&
                      props.version.latestOpenSpaceVersion &&
                      isOlder(props.version.openSpaceVersion, props.version.latestOpenSpaceVersion);

  if (newerExists) {
    latestAvailableVersion = <p className={styles.notification}>
      Version {formatVersion(props.version.latestOpenSpaceVersion)} is available at openspaceproject.com
    </p>;
  }

  return <>
    { currentVersion }
    { latestAvailableVersion }
  </>

}

/*const socketApiVersion = (props) =>
  <p>Socket API version: {props.hasVersion ?
      formatVersion(props.version.socketApiVersion) :
      <LoadingString loading={true}/>}
  </p>*/

let About = (props) => (
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
        &copy; 2014 - { (new Date()).getUTCFullYear() }
        &nbsp; OpenSpace Development Team<br/>
        openspaceproject.com
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
