/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/react';
import React from 'react';
import LoadingBlock from './LoadingBlock';

/* globals module */

storiesOf('LoadingBlock', module)
  .addDecorator((story) => (
    <div style={{ background: '#252525', padding: '20px', color: 'white' }}>
      { story() }
    </div>
  ))
  .add('default', () => (<LoadingBlock />))
  .add('several', () => (
    <div>
      <LoadingBlock />
      <LoadingBlock />
      <LoadingBlock />
    </div>
  ));
