/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/react';
import React from 'react';
import MaterialIcon from './MaterialIcon';

/* globals module */

storiesOf('MaterialIcon', module)
  .add('no options', () => (<MaterialIcon icon="language" />))
  .add('className=small', () => (<MaterialIcon icon="language" className="small" />))
  .add('className=normal', () => (<MaterialIcon icon="language" className="normal" />))
  .add('className=medium', () => (<MaterialIcon icon="language" className="medium" />))
  .add('className=large', () => (<MaterialIcon icon="language" className="large" />))
  .add('className=extralarge', () => (<MaterialIcon icon="language" className="extralarge" />));
