import React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';

import Window from './Window';

storiesOf('Window', module)
  .add('default', () => (<Window>hello</Window>))
  .add('with closecallback', () => (<Window closeCallback={action('close')}>hello</Window>))
  .add('with initial position', () => (<Window position={{ x: 100, y: 150 }}>hello</Window>))
  .add('with size', () => (<Window size={{ width: 100, height: 150 }}>hello</Window>));
