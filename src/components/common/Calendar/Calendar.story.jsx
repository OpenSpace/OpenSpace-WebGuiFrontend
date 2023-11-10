/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';

import Calendar from './Calendar';

/* globals module */

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const fourMonthsFromNow = new Date();
fourMonthsFromNow.setMonth(fourMonthsFromNow.getMonth() + 4);

storiesOf('Calendar', module)
  .addDecorator((story) => (
    <div style={{ background: '#d8d8d8' }}>
      { story() }
    </div>
  ))
  .add('default', () => (<Calendar />))
  .add('with selected day', () => (<Calendar currentTime={yesterday} />))
  .add('with activeMonth', () => (<Calendar currentTime={fourMonthsFromNow} />))
  .add('with today button', () => (<Calendar todayButton />))
  .add('with callback', () => (<Calendar currentTime={yesterday} onChange={action('changed')} />));
