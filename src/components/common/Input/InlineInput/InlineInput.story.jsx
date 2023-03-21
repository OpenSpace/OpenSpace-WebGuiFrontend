/* eslint import/no-extraneous-dependencies: 0 */
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import InlineInput from './InlineInput';

/* globals module */

storiesOf('Input/InlineInput', module)
  .addDecorator(story => (
    <div style={{ background: '#252525', padding: '20px' }}>
      { story() }
    </div>
  ))
  .add('default', () => (<InlineInput placeholder="InlineInput" value="expands as you type!" />))
  .add('with callback', () =>
    (<InlineInput placeholder="InlineInput" value="change me" onChange={action('input')} />));
