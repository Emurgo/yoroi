import {walletChecksum} from '@emurgo/cip4-js'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {NetworkError} from '@yoroi/common'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {InteractionManager, StyleSheet, Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon, KeyboardAvoidingView, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation, WalletInitRouteNavigation} from '../../../../navigation'
import {isEmptyString} from '../../../../utils'
import {useWalletManager} from '../../../../wallet-manager/WalletManagerContext'
import {InvalidState} from '../../../../yoroi-wallets/cardano/errors'
import {makeKeys} from '../../../../yoroi-wallets/cardano/shelley/makeKeys'
import {useOpenWallet, usePlate, useWalletMetas} from '../../../../yoroi-wallets/hooks'
import {useSetSelectedWallet} from '../../../WalletManager/Context/SelectedWalletContext'
import {useSetSelectedWalletMeta} from '../../../WalletManager/Context/SelectedWalletMetaContext'
import {MnemonicInput} from '../../common/MnemonicInput'
import {StepperProgress} from '../../common/StepperProgress/StepperProgress'
import {useStrings} from '../../common/useStrings'

export const RestoreWalletScreen = () => {
  const {styles} = useStyles()
  const bold = useBold()
  const [mnemonic, setMnemonic] = React.useState('')
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const {publicKeyHexChanged, mnemonicChanged, mnemonicType} = useSetupWallet()
  const {track} = useMetrics()
  const walletManager = useWalletManager()
  const {walletMetas} = useWalletMetas(walletManager)
  const {openModal} = useModal()

  const strings = useStrings()

  if (mnemonicType === null) throw new Error('mnemonicType missing')

  useFocusEffect(
    React.useCallback(() => {
      const recoveryPhraseLenght = String(mnemonicType) as '15' | '24'
      track.restoreWalletEnterPhraseStepViewed({recovery_phrase_lenght: recoveryPhraseLenght})
    }, [mnemonicType, track]),
  )

  const intl = useIntl()
  const {navigateToTxHistory} = useWalletNavigation()
  const selectWalletMeta = useSetSelectedWalletMeta()
  const selectWallet = useSetSelectedWallet()

  const {openWallet} = useOpenWallet({
    onSuccess: ([wallet, walletMeta]) => {
      selectWalletMeta(walletMeta)
      selectWallet(wallet)
      navigateToTxHistory()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof InvalidState
          ? showErrorDialog(errorMessages.walletStateInvalid, intl)
          : error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const handleOnNext = React.useCallback(async () => {
    const {accountPubKeyHex} = await makeKeys({mnemonic})
    const checksum = walletChecksum(accountPubKeyHex)

    const duplicatedWalletMeta = walletMetas?.find((walletMeta) => walletMeta.checksum.TextPart === checksum.TextPart)

    if (duplicatedWalletMeta) {
      openModal(
        strings.restoreDuplicatedWalletModalTitle,
        <Modal
          walletName={duplicatedWalletMeta.name}
          publicKeyHex={accountPubKeyHex}
          onPress={() => openWallet(duplicatedWalletMeta)}
        />,
      )

      return
    }

    mnemonicChanged(mnemonic)
    publicKeyHexChanged(accountPubKeyHex)
    navigation.navigate('setup-wallet-restore-details')
  }, [
    mnemonic,
    mnemonicChanged,
    navigation,
    openModal,
    openWallet,
    publicKeyHexChanged,
    strings.restoreDuplicatedWalletModalTitle,
    walletMetas,
  ])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <KeyboardAvoidingView style={{flex: 1}}>
        <View style={styles.padding}>
          <StepperProgress currentStep={1} currentStepTitle={strings.stepRestoreWalletScreen} totalSteps={2} />
        </View>

        <ScrollView style={styles.padding} bounces={false}>
          <View>
            <Text style={styles.title}>{strings.restoreWalletScreenTitle(bold)}</Text>

            <Space height="xl" />
          </View>

          <MnemonicInput length={mnemonicType} onDone={setMnemonic} />
        </ScrollView>

        <View style={styles.padding}>
          <Button
            title={strings.next}
            style={styles.button}
            disabled={isEmptyString(mnemonic)}
            onPress={handleOnNext}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const Modal = ({
  onPress,
  publicKeyHex,
  walletName,
}: {
  onPress: () => void
  publicKeyHex: string
  walletName: string
}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {networkId} = useSetupWallet()
  const plate = usePlate({networkId, publicKeyHex})

  return (
    <View style={styles.modal}>
      <Text style={styles.modalText}>{strings.restoreDuplicatedWalletModalText}</Text>

      <Space height="l" />

      <View style={styles.checksum}>
        <Icon.WalletAccount iconSeed={plate.accountPlate.ImagePart} style={styles.walletChecksum} />

        <Space width="s" />

        <View>
          <Text style={styles.plateName}>{walletName}</Text>

          <Text style={styles.plateText}>{plate.accountPlate.TextPart}</Text>
        </View>
      </View>

      <Space fill />

      <Button title={strings.restoreDuplicatedWalletModalButton} style={styles.button} onPress={onPress} />

      <Space height="xl" />
    </View>
  )
}

const useBold = () => {
  const {styles} = useStyles()

  return {
    b: (text: React.ReactNode) => <Text style={styles.bolder}>{text}</Text>,
  }
}

const useStyles = () => {
  const {theme} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme.color['white-static'],
    },
    title: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
    },
    button: {backgroundColor: theme.color.primary[500]},
    bolder: {
      ...theme.typography['body-1-l-medium'],
    },
    padding: {
      ...theme.padding['l'],
    },
    checksum: {
      flexDirection: 'row',
      alignItems: 'center',
      textAlignVertical: 'center',
    },
    walletChecksum: {
      width: 38,
      height: 38,
      borderRadius: 8,
    },
    modalText: {
      ...theme.typography['body-1-l-regular'],
      color: theme.color.gray[900],
      lineHeight: 24,
    },
    plateText: {
      ...theme.typography['body-3-s-regular'],
      color: theme.color.gray[600],
      textAlign: 'center',
      justifyContent: 'center',
    },
    plateName: {
      ...theme.typography['body-2-m-medium'],
      color: theme.color.gray[900],
    },
    modal: {
      flex: 1,
    },
  })

  const colors = {
    gray900: theme.color.gray[900],
    gradientBlueGreen: theme.color.gradients['blue-green'],
  }

  return {styles, colors} as const
}
