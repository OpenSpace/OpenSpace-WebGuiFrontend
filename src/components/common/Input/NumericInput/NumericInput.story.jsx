/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';

import NumericInput from './NumericInput';

/* globals module */

storiesOf('Input/NumericInput', module)
  .addDecorator((story) => (
    <div style={{ background: '#252525', padding: '20px' }}>
      { story() }
    </div>
  ))
  .add('default', () => (<NumericInput placeholder="Number!" value={52} />))
  .add('no input', () => (<NumericInput placeholder="Number!" />))
  .add('unwide', () => (<NumericInput placeholder="Number!" value={12} wide={false} />))
  .add('disabled', () => (<NumericInput placeholder="Number!" value={33.3} disabled />))
  .add('inputOnly ', () => (<NumericInput placeholder="Number!" value={33.3} inputOnly />))
  .add('noHoverHint ', () => (<NumericInput placeholder="Number!" value={33.3} noHoverHint />))
  .add('noTooltip ', () => (<NumericInput placeholder="Number!" value={33.3} noTooltip />))
  .add('with callback', () => (<NumericInput placeholder="Input" value="change me" onChange={action('input')} />));
// OBS! The onChange property of the NumericInput has been renamed and updated.
// @TODO: When this code is picked up again it needs to be adapted to the updated NumericProperty
