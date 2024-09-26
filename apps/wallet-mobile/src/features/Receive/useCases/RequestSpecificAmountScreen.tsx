import {useFocusEffect} from '@react-navigation/native'
import {configCardanoLegacyTransfer, linksCardanoModuleMaker} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  GestureResponderEvent,
  ScrollView as RNScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../components/Button/NewButton'
import {useCopy} from '../../../components/Clipboard/ClipboardProvider'
import {Icon} from '../../../components/Icon'
import {KeyboardAvoidingView} from '../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {useModal} from '../../../components/Modal/ModalContext'
import {ScrollView, useScrollView} from '../../../components/ScrollView/ScrollView'
import {ShareQRCodeCard} from '../../../components/ShareQRCodeCard/ShareQRCodeCard'
import {TextInput} from '../../../components/TextInput/TextInput'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {isEmptyString} from '../../../kernel/utils'
import {editedFormatter} from '../../../yoroi-wallets/utils/amountUtils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useReceive} from '../common/ReceiveProvider'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useStrings} from '../common/useStrings'

export const RequestSpecificAmountScreen = () => {
  const strings = useStrings()
  const {colors, styles} = useStyles()
  const [amount, setAmount] = React.useState('')
  const {wallet} = useSelectedWallet()

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
    if (Number(edited) <= Number.MAX_SAFE_INTEGER && numberOfDecimals <= wallet.portfolioPrimaryTokenInfo.decimals) {
      setAmount(edited)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      track.receiveAmountPageViewed()
    }, [track]),
  )

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root]}>
      <SafeAreaView style={[styles.flex, styles.container]} edges={['left', 'right', 'bottom']}>
        <ScrollView ref={scrollViewRef} style={styles.flex} onScrollBarChange={setIsScrollBarShown}>
          <View style={styles.request}>
            <Text style={styles.textAddressDetails}>{strings.specificAmountDescription}</Text>

            <TextInput
              label={strings.ADALabel}
              keyboardType="numeric"
              onChangeText={handleOnChangeAmount}
              value={amount}
              testID="receive:request-specific-amount-ada-input"
              noHelper
            />

            <View style={styles.textSection}>
              <Text style={[styles.textAddressDetails, {color: colors.gray}]}>{strings.address}</Text>

              <Text style={styles.textAddressDetails}>{selectedAddress}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.actions, isScrollBarShown && {borderTopWidth: 1, borderTopColor: colors.lightGray}]}>
          <Button
            onPress={handleOnGenerateLink}
            disabled={!hasAmount}
            title={strings.generateLink}
            testID="receive:request-specific-amount:generate-link-button"
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const Modal = ({amount, address}: {amount: string; address: string}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {track} = useMetrics()

  const cardanoLinks = linksCardanoModuleMaker()
  const requestData = cardanoLinks.create({
    config: configCardanoLegacyTransfer,
    params: {
      address: address,
      amount: Number(amount),
    },
  })

  const {
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()
  const hasAmount = !isEmptyString(amount)
  const hasAddress = !isEmptyString(address)
  const content = hasAmount ? requestData.link : address
  const title = hasAmount ? `${amount} ${portfolioPrimaryTokenInfo.ticker.toLocaleUpperCase()}` : ''

  const {copy} = useCopy()

  return (
    <View style={[styles.container, styles.flex]}>
      <RNScrollView contentContainerStyle={[styles.flex, styles.modalContainer]}>
        {hasAddress ? (
          <ShareQRCodeCard
            title={title}
            shareContent={`${strings.address} ${content}`}
            qrContent={content}
            onLongPress={(event: GestureResponderEvent) =>
              copy({text: content, feedback: strings.addressCopiedMsg, event})
            }
            testID="receive:specific-amount"
            onShare={() => track.receiveShareAddressClicked()}
            shareLabel={strings.shareLabel}
          />
        ) : (
          <View style={styles.root}>
            <SkeletonAdressDetail />
          </View>
        )}
      </RNScrollView>

      <View style={styles.actions}>
        <Button
          onPress={(event: GestureResponderEvent) => copy({text: content, feedback: strings.copyLinkMsg, event})}
          disabled={!hasAmount}
          title={strings.copyLinkBtn}
          icon={Icon.Copy}
          testID="receive:request-specific-amount:copy-link-button"
        />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
    },
    container: {
      ...atoms.p_lg,
    },
    modalContainer: {
      ...atoms.justify_between,
      ...atoms.gap_lg,
    },
    flex: {
      ...atoms.flex_1,
    },
    textAddressDetails: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    textSection: {
      ...atoms.gap_xs,
    },
    request: {
      ...atoms.gap_lg,
    },
    actions: {
      ...atoms.pt_lg,
    },
  })

  const colors = {
    gray: color.gray_600,
    lightGray: color.gray_200,
  }

  return {styles, colors} as const
}
