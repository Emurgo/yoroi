import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePrivacyModeContext} from '../../Settings/PrivacyMode/PrivacyModeContext'
import {Button, Spacer, Text} from '..'
import {HideableText} from './HideableText'

const TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'

storiesOf('HideableText', module).add('Default', () => <HideableTextTest />)

const HideableTextTest = () => {
  const {privaceModeStatus, selectPrivacyModeStatus} = usePrivacyModeContext()

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.mainColumn}>
      <Text>Privacy Mode: {privaceModeStatus}</Text>
      <Spacer height={20} />
      <HideableText>{TEXT}</HideableText>
      <Spacer height={20} />
      <Button
        onPress={() => selectPrivacyModeStatus(privaceModeStatus === 'SHOWN' ? 'HIDDEN' : 'SHOWN')}
        title="Change Privacy Mode"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainColumn: {
    padding: 16,
  },
})
