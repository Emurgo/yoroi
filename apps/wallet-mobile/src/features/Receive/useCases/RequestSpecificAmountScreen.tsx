import {useFocusEffect} from '@react-navigation/native'
import {configCardanoLegacyTransfer, linksCardanoModuleMaker} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  Keyboard,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer, TextInput, useModal} from '../../../components'
import {ScrollView, useScrollView} from '../../../components/ScrollView/ScrollView'
import {useCopy} from '../../../legacy/useCopy'
import {useMetrics} from '../../../metrics/metricsManager'
import {isEmptyString} from '../../../utils'
import {editedFormatter} from '../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../WalletManager/Context/SelectedWalletContext'
import {useReceive} from '../common/ReceiveProvider'
import {ShareQRCodeCard} from '../common/ShareQRCodeCard/ShareQRCodeCard'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useStrings} from '../common/useStrings'

export const RequestSpecificAmountScreen = () => {
  const strings = useStrings()
  const {colors, styles} = useStyles()
  const [amount, setAmount] = React.useState('')
  const wallet = useSelectedWallet()

  const {track} = useMetrics()
  const hasAmount = !isEmptyString(amount)
  const {isScrollBarShown, setIsScrollBarShown, scrollViewRef} = useScrollView()

  const {selectedAddress} = useReceive()

  const screenHeight = useWindowDimensions().height
  const modalHeight = (screenHeight / 100) * 80
  const {openModal} = useModal()

  const handleOnGenerateLink = React.useCallback(() => {
    track.receiveAmountGeneratedPageViewed({ada_amount: Number(amount)})
    openModal(strings.amountToReceive, <Modal amount={amount} address={selectedAddress} />, modalHeight)
  }, [track, amount, openModal, strings.amountToReceive, selectedAddress, modalHeight])

  const handleOnChangeAmount = (amount: string) => {
    const edited = editedFormatter(amount)
    const numberOfDecimals = (edited.split('.')[1] ?? []).length
    if (Number(edited) <= Number.MAX_SAFE_INTEGER && numberOfDecimals <= (wallet.primaryTokenInfo.decimals ?? 0)) {
      setAmount(edited)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      track.receiveAmountPageViewed()
    }, [track]),
  )

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView style={styles.root}>
          <ScrollView ref={scrollViewRef} style={styles.content} onScrollBarChange={setIsScrollBarShown}>
            <Spacer height={24} />

            <View style={styles.screen}>
              <Text style={styles.textAddressDetails}>{strings.specificAmountDescription}</Text>

              <TextInput
                label={strings.ADALabel}
                keyboardType="numeric"
                onChangeText={handleOnChangeAmount}
                value={amount}
                testID="receive:request-specific-amount-ada-input"
              />

              <View style={styles.textSection}>
                <Text style={[styles.textAddressDetails, {color: colors.gray}]}>{strings.address}</Text>

                <Text style={styles.textAddressDetails}>{selectedAddress}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.actions, isScrollBarShown && {borderTopWidth: 1, borderTopColor: colors.lightGray}]}>
            <Button
              shelleyTheme
              onPress={handleOnGenerateLink}
              disabled={!hasAmount}
              title={strings.generateLink}
              style={styles.button}
              testID="receive:request-specific-amount:generate-link-button"
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

const Modal = ({amount, address}: {amount: string; address: string}) => {
  const strings = useStrings()
  const {styles} = useStyles()

  const cardanoLinks = linksCardanoModuleMaker()
  const requestData = cardanoLinks.create({
    config: configCardanoLegacyTransfer,
    params: {
      address: address,
      amount: Number(amount),
    },
  })

  const {primaryTokenInfo} = useSelectedWallet()
  const hasAmount = !isEmptyString(amount)
  const hasAddress = !isEmptyString(address)
  const content = hasAmount ? requestData.link : address
  const title = hasAmount ? `${amount} ${primaryTokenInfo.ticker?.toLocaleUpperCase()}` : ''

  const [isCopying, copy] = useCopy()
  const handOnCopy = () => copy(content)

  return (
    <View style={styles.root}>
      <RNScrollView>
        {hasAddress ? (
          <ShareQRCodeCard title={title} content={content} onLongPress={handOnCopy} testId="receive:specific-amount" />
        ) : (
          <View style={styles.root}>
            <SkeletonAdressDetail />
          </View>
        )}

        <Spacer height={32} />
      </RNScrollView>

      <Button
        shelleyTheme
        onPress={handOnCopy}
        disabled={!hasAmount}
        title={strings.copyLinkBtn}
        iconImage={require('../../../assets/img/copy.png')}
        isCopying={isCopying}
        copiedText={strings.copyLinkMsg}
        style={styles.button}
        testID="receive:request-specific-amount:copy-link-button"
      />

      <Spacer height={16} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    textAddressDetails: {
      ...typography['body-1-l-regular'],
      color: color.gray[900],
    },
    textSection: {
      gap: 4,
      width: '100%',
    },
    screen: {
      gap: 16,
      flex: 2,
    },
    button: {
      backgroundColor: color.primary[500],
    },
    actions: {
      padding: 16,
    },
  })

  const colors = {
    gray: color.gray[600],
    lightGray: color.gray[200],
  }

  return {styles, colors} as const
}
