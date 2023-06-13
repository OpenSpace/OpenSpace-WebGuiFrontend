/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';

import ScaleInput from './ScaleInput';

/* globals module */

storiesOf('Input/ScaleInput', module)
  .add('default', () => (<ScaleInput />))
  .add('with label', () => (<ScaleInput label="hello" />))
  .add('with callback', () => (<ScaleInput onChange={action('changed!')} />));
