import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePrivacyMode, useSetPrivacyMode} from '../../Settings/PrivacyMode/PrivacyMode'
import {Button, Spacer, Text} from '..'
import {HideableText} from './HideableText'

storiesOf('HideableText', module).add('Default', () => <HideableTextTest />)

const HideableTextTest = () => {
  const privacyMode = usePrivacyMode()
  const setPrivacyMode = useSetPrivacyMode()

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.mainColumn}>
      <Text style={styles.text}>Privacy Mode: {privacyMode}</Text>

      <Spacer height={20} />

      <HideableText text="Lorem ipsum dolor sit amet" />

      <Spacer height={20} />

      <Button
        onPress={() => setPrivacyMode(privacyMode === 'SHOWN' ? 'HIDDEN' : 'SHOWN')}
        title="Change Privacy Mode"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  mainColumn: {
    padding: 16,
  },
  text: {
    lineHeight: 22,
  },
})
