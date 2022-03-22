import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {Button} from '../../components'
import {FingerprintScreenBase} from './FingerprintScreenBase'

storiesOf('FingerprintScreenBase', module)
  .add('Default', () => <FingerprintScreenBase headings={['heading1', 'heading2']} buttons={[]} />)
  .add('with onGoBack', () => (
    <FingerprintScreenBase headings={['heading1', 'heading2']} buttons={[]} onGoBack={action('goBack')} />
  ))
  .add('with buttons', () => (
    <FingerprintScreenBase
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key={'button1'} title={'button1'} onPress={action('button1')} />,
        <Button key={'button2'} title={'button2'} onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      addWelcomeMessage
      error={'this is the error messaqge'}
    />
  ))
  .add('with error', () => (
    <FingerprintScreenBase
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key={'button1'} title={'button1'} onPress={action('button1')} />,
        <Button key={'button2'} title={'button2'} onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      error={'this is the error messaqge'}
    />
  ))
  .add('with welcome message', () => (
    <FingerprintScreenBase
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key={'button1'} title={'button1'} onPress={action('button1')} />,
        <Button key={'button2'} title={'button2'} onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      addWelcomeMessage
      error={'this is the error messaqge'}
    />
  ))
