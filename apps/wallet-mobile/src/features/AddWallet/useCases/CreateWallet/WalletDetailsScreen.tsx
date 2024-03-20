import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, StatusBar, TextInput, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {CardAboutPhrase} from '../../common/CardAboutPhrase/CardAboutPhrase'
import {LearnMoreButton} from '../../common/LearnMoreButton/LearnMoreButton'
import {mockAddWallet} from '../../common/mocks'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'
import {Info as InfoIllustration} from '../../illustrations/Info'

const useSizeModal = () => {
  const HEIGHT_SCREEN = useWindowDimensions().height
  const mediumScreenHeight = 800
  const largerScreenHeight = 900
  const PERCENTAGE_NAME_PASSWORD =
    HEIGHT_SCREEN >= largerScreenHeight ? 58 : HEIGHT_SCREEN >= mediumScreenHeight ? 65 : 85
  const PERCENTAGE_CHECKSUM = HEIGHT_SCREEN >= largerScreenHeight ? 48 : HEIGHT_SCREEN >= mediumScreenHeight ? 55 : 75

  const HEIGHT_MODAL_CHECKSUM = (HEIGHT_SCREEN / 100) * PERCENTAGE_CHECKSUM
  const HEIGHT_MODAL_NAME_PASSWORD = (HEIGHT_SCREEN / 100) * PERCENTAGE_NAME_PASSWORD

  return {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} as const
}

export const WalletDetailsScreen = () => {
  const {styles} = useStyles()
  const {HEIGHT_MODAL_NAME_PASSWORD, HEIGHT_MODAL_CHECKSUM} = useSizeModal()
  const {openModal, closeModal} = useModal()
  const navigation = useNavigation()
  const strings = useStrings()

  const showModalTipsPassword = () => {
    Keyboard.dismiss()
    openModal(
      strings.walletDetailsModalTitle,
      <View style={styles.modal}>
        <ScrollView bounces={false}>
          <View>
            <CardAboutPhrase
              title={strings.walletNameModalCardTitle}
              linesOfText={[strings.walletNameModalCardFirstItem, strings.walletNameModalCardSecondItem]}
            />

            <Space height="l" />

            <CardAboutPhrase
              title={strings.walletPasswordModalCardTitle}
              linesOfText={[strings.walletPasswordModalCardFirstItem, strings.walletPasswordModalCardSecondItem]}
            />

            <Space height="l" />

            <LearnMoreButton
              onPress={() => {
                ;('')
              }}
            />
          </View>
        </ScrollView>

        <Space height="s" />

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="l" />
      </View>,
      HEIGHT_MODAL_NAME_PASSWORD,
    )
  }

  const showModalTipsPlateNumber = () => {
    Keyboard.dismiss()
    openModal(
      strings.walletDetailsModalTitle,
      <View style={styles.modal}>
        <ScrollView bounces={false}>
          <View>
            <CardAboutPhrase
              title={strings.walletChecksumModalCardTitle}
              linesOfText={[
                strings.walletChecksumModalCardFirstItem,
                strings.walletChecksumModalCardSecondItem,
                strings.walletChecksumModalCardThirdItem,
              ]}
            />

            <Space height="l" />

            <LearnMoreButton
              onPress={() => {
                ;('')
              }}
            />
          </View>
        </ScrollView>

        <Space height="s" />

        <Button title={strings.continueButton} style={styles.button} onPress={closeModal} />

        <Space height="l" />
      </View>,
      HEIGHT_MODAL_CHECKSUM,
    )
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <StatusBar />

      <View>
        <StepperProgress currentStep={4} currentStepTitle={strings.stepWalletDetails} totalSteps={4} />

        <Text style={styles.title}>
          {strings.walletDetailsTitle}

          <TouchableOpacity onPress={showModalTipsPassword}>
            <InfoIllustration />
          </TouchableOpacity>
        </Text>

        <Space height="xl" />

        <TextInput label={strings.walletDetailsNameInput} />

        <TextInput
          label={strings.walletDetailsPasswordInput}
          secureTextEntry
          helper={strings.walletDetailsPasswordHelper}
        />

        <Space height="xl" />

        <TextInput label={strings.walletDetailsConfirmPasswordInput} secureTextEntry />

        <Text style={styles.plateNumber}>
          {mockAddWallet.checksum}

          <TouchableOpacity onPress={showModalTipsPlateNumber}>
            <InfoIllustration />
          </TouchableOpacity>
        </Text>
      </View>

      <View>
        <Button
          title={strings.next}
          style={styles.button}
          onPress={() => navigation.navigate('app-root', {screen: 'wallet-selection'})}
        />

        <Space height="s" />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      ...theme.padding['x-l'],
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    modal: {
      flex: 1,
    },
    title: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    plateNumber: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {backgroundColor: theme.color.primary[500]},
  })

  return {styles} as const
}
