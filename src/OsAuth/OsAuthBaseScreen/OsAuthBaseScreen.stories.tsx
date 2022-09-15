import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {Button} from '../../components'
import {OsAuthBaseScreen} from './OsAuthBaseScreen'

storiesOf('OsAuthBaseScreen', module)
  .add('Default', () => <OsAuthBaseScreen headings={['heading1', 'heading2']} buttons={[]} />)
  .add('with onGoBack', () => (
    <OsAuthBaseScreen headings={['heading1', 'heading2']} buttons={[]} onGoBack={action('goBack')} />
  ))
  .add('with buttons', () => (
    <OsAuthBaseScreen
      headings={['heading1', 'heading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
    />
  ))
  .add('with subheading', () => (
    <OsAuthBaseScreen
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
    />
  ))
  .add('with error', () => (
    <OsAuthBaseScreen
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      error="this is the error messaqge"
    />
  ))
  .add('with welcome message', () => (
    <OsAuthBaseScreen
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      addWelcomeMessage
      error="this is the error messaqge"
    />
  ))
  .add('with fingerprint placeholder', () => (
    <OsAuthBaseScreen
      headings={['heading1', 'heading2']}
      subHeadings={['subheading1', 'subheading2']}
      buttons={[
        <Button key="button1" title="button1" onPress={action('button1')} />,
        <Button key="button2" title="button2" onPress={action('button2')} />,
      ]}
      onGoBack={action('goBack')}
      addWelcomeMessage
      showFingerPlaceholder
      error="this is the error messaqge"
    />
  ))
