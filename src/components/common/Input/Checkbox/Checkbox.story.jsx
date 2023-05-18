/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';

import Checkbox from './Checkbox';

/* globals module */

storiesOf('Input/Checkbox', module)
  .add('default', () => (<Checkbox><p>Input</p></Checkbox>))
  .add('checked', () => (<Checkbox><p>Input</p></Checkbox>))
  .add('left', () => (<Checkbox><p>Input</p></Checkbox>))
  .add('unwide', () => (<Checkbox wide={false}><p>Input</p></Checkbox>))
  .add('with callback', () => (<Checkbox onChange={action('changed')}><p>Input</p></Checkbox>));
