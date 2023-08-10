/* eslint import/no-extraneous-dependencies: 0 */
import React from 'react';
import { MdLanguage } from 'react-icons';
import { storiesOf } from '@storybook/react';
/* globals module */

storiesOf('Icon', module)
  .add('no options', () => (<MdLanguage />))
  .add('className=small', () => (<MdLanguage className="small" />))
  .add('className=normal', () => (<MdLanguage className="normal" />))
  .add('className=medium', () => (<MdLanguage className="medium" />))
  .add('className=large', () => (<MdLanguage className="large" />))
  .add('className=extralarge', () => (<MdLanguage className="extralarge" />));
