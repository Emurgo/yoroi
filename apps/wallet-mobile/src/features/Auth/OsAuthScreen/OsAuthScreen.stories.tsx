import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {Button} from '../../../components'
import {OsAuthScreen} from './OsAuthScreen'

storiesOf('OsAuthScreen', module)
  .add('Default', () => <OsAuthScreen headings={['heading1', 'heading2']} buttons={[]} />)
  .add('with onGoBack', () => (
    <OsAuthScreen headings={['heading1', 'heading2']} buttons={[]} onGoBack={action('goBack')} />
  ))
  .add('with buttons', () => (
    <OsAuthScreen
      headings={['heading1', 'heading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
    />
  ))
  .add('with subheading', () => (
    <OsAuthScreen
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
    />
  ))
  .add('with welcome message', () => (
    <OsAuthScreen
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      addWelcomeMessage
    />
  ))
  .add('with fingerprint placeholder', () => (
    <OsAuthScreen
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      addWelcomeMessage
      showFingerPlaceholder
    />
  ))
