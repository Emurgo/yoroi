import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Keyboard, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, StatusBar, useModal} from '../../../../components'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import InfoIcon from '../../illustrations/InfoIcon'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
// import {useStrings} from '../common/useStrings'

export const RecoveryPhrase = () => {
  const {styles} = useStyles()
  const {openModal} = useModal()
  const HEIGHT_SCREEN = useWindowDimensions().height
  const HEIGHT_MODAL = (HEIGHT_SCREEN / 100) * 75
  //   const strings = useStrings()

  const showModal = () => {
    Keyboard.dismiss()
    openModal(
      'Tips',
      <View style={styles.modal}>
        <ScrollView>
          <View style={{gap: 16}}>
            <CardAboutPhrase
              items={[
                'Make sure no one is looking at your screen.',
                'DO NOT take a screenshot.',
                'Write the recovery phrase on a piece of paper and store in a secure location like a safety deposit box.',
                'It is recommended to have 2 or 3 copies of the recovery phrase in different secure locations.',
                'DO NOT share the recovery phrase as this will allow anyone to access your assets and wallet.',
              ]}
            />
            <LearnMoreButton
              onPress={() => {
                ;('')
              }}
            />
          </View>
        </ScrollView>

        <Spacer height={8} />
        <Button title="next" style={styles.button} />
        <Spacer height={8} />
      </View>,
      HEIGHT_MODAL,
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <StatusBar type="light" />

      <View style={styles.content}>
        <StepperProgress currentStep={2} currentStepTitle="Recovery phrase" totalSteps={4} displayStepNumber />

        <Text style={styles.title}>
          {` Click “Show recovery phrase” below to reveal and save it. `}
          <Pressable onPress={showModal}>
            <InfoIcon />
          </Pressable>
        </Text>
      </View>

      <View>
        <Button title="next" style={styles.button} onPress={showModal} />

        <Spacer height={7} />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    modal: {
      flex: 1,
    },
    title: {
      fontFamily: 'Rubik',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 24,
      color: theme.color.gray[900],
    },
    content: {
      gap: 16,
    },
    button: {backgroundColor: theme.color.primary[500]},
  })

  const colors = {
    gray900: theme.color.gray[900],
  }

  return {styles, colors} as const
}
