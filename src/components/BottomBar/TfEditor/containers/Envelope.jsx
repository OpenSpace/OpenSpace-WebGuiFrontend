import React from 'react';
import { connect } from 'react-redux';

import {
  movePoint,
  setClickablePoint,
  toggleActiveEnvelope,
  toggleActivePoint
} from '../../../../api/Actions/transferFunctionActions';
import EnvelopeCanvas from '../presentational/EnvelopeCanvas';

const hasActiveChild = (envelope) => {
  let hasActiveChild = false;
  envelope.points.forEach((point) => {
    if (point.active) {
      hasActiveChild = true;
    }
  });
  return hasActiveChild;
};

const getPointPositions = (envelopes, height) => {
  const convertedPoints = [];
  if (envelopes.length !== 0) {
    envelopes.map((envelope) =>
      envelope.points.map((point) =>
        convertedPoints.push({
          x1: point.position.x,
          y1: point.position.y,
          x2: point.position.x,
          y2: height
        })
      )
    );
    return convertedPoints;
  }
};

const mapStateToProps = (state, ownProps) => {
  const envelopes = ownProps.activeVolume.properties
    .find((obj) => obj.id === 'TransferFunction')
    .value.map((envelope) => ({
      ...envelope,
      points: envelope.points.map((point) => ({
        ...point,
        position: {
          x: point.position.x * ownProps.width,
          y: ownProps.height - point.position.y * ownProps.height
        }
      }))
    }));

  const minValue = Number(
    ownProps.activeVolume.properties.find((obj) => obj.id === 'MinValue').value
  );
  const maxValue = Number(
    ownProps.activeVolume.properties.find((obj) => obj.id === 'MaxValue').value
  );

  const pointPositions = getPointPositions(envelopes, ownProps.height);

  return {
    envelopes,
    minValue,
    maxValue,
    pointPositions
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleDrag: (e, ui, index, envelope) => {
    const { id } = envelope.points[index];
    if (ui.deltaX !== 0 && ui.deltaY !== 0) {
      dispatch(setClickablePoint(false, envelope.id, id, ownProps.URI));
    }

    const deltaPosition = {
      x: ui.deltaX / ownProps.width,
      y: 0
    };

    if (!envelope.points[index].anchor) {
      deltaPosition.y = -ui.deltaY / ownProps.height;
    }

    dispatch(movePoint(deltaPosition, id, envelope.id, ownProps.URI));
  },
  handleClick: (envelope, pointId) => {
    if (envelope.points[pointId].clickable === false) {
      dispatch(setClickablePoint(true, envelope.id, pointId, ownProps.URI));
    } else if (envelope.active === true || hasActiveChild(envelope)) {
      dispatch(toggleActivePoint(envelope.id, pointId, ownProps.URI));
    } else {
      dispatch(toggleActiveEnvelope(envelope.id, ownProps.URI));
    }
  }
});

const Envelope = connect(mapStateToProps, mapDispatchToProps)(EnvelopeCanvas);

export default Envelope;
