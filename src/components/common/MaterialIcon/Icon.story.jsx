/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { Icon } from '@iconify/react';
import { storiesOf } from '@storybook/react';
/* globals module */

storiesOf('Icon', module)
  .add('no options', () => (<Icon icon="material-symbols:language" />))
  .add('className=small', () => (<Icon icon="material-symbols:language" className="small" />))
  .add('className=normal', () => (<Icon icon="material-symbols:language" className="normal" />))
  .add('className=medium', () => (<Icon icon="material-symbols:language" className="medium" />))
  .add('className=large', () => (<Icon icon="material-symbols:language" className="large" />))
  .add('className=extralarge', () => (<Icon icon="material-symbols:language" className="extralarge" />));
