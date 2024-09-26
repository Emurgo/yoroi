import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {Button} from '../Button/NewButton'
import {Spacer} from '../Spacer/Spacer'
import {Text} from '../Text'
import {HideableText} from './HideableText'

storiesOf('HideableText', module).add('Default', () => <HideableTextTest />)

const HideableTextTest = () => {
  const {privacyMode, togglePrivacyMode} = usePrivacyMode()

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.mainColumn}>
      <Text style={styles.text}>Privacy Mode: {privacyMode}</Text>

      <Spacer height={20} />

      <HideableText text="Lorem ipsum dolor sit amet" />

      <Spacer height={20} />

      <Button onPress={() => togglePrivacyMode()} title="Change Privacy Mode" />
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
