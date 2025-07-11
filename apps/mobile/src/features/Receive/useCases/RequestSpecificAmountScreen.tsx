import {useFocusEffect} from '@react-navigation/native'
import {
  configCardanoLegacyTransfer,
  linksCardanoModuleMaker,
  linksYoroiModuleMaker,
} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
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

import {Button} from '../../../ui/Button/Button'
import {useCopy} from '../../../kernel/utils/clipboard'
import {Icon} from '../../../ui/Icon'
import {KeyboardAvoidingView} from '../../../ui/KeyboardAvoidingView'
import {useModal} from '../../../ui/Modal/ModalContext'
import {
  ScrollView,
  useScrollView,
} from '../../../ui/ScrollView/ScrollView'
import {ShareQRCodeCard} from '../../../ui/ShareQRCodeCard/ShareQRCodeCard'
import {TextInput} from '../../../ui/TextInput'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {isEmptyString}../../../kernel/utils'
import {editedFormatter} from '../../../wallets/utils/amountUtils'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useReceive} from '../common/ReceiveProvider'
import {SkeletonAdressDetail} from '../../../ui/SkeletonAddressDetail/SkeletonAddressDetail'
import {useStrings} from '../common/useStrings'

export const RequestSpecificAmountScreen = () => {
  const strings = useStrings()
  const {color} = useTheme()
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
    openModal({
      title: strings.amountToReceive,
      content: <Modal amount={amount} address={selectedAddress} />,
      height: modalHeight,
    })
  }, [
    track,
    amount,
    openModal,
    strings.amountToReceive,
    selectedAddress,
    modalHeight,
  ])

  const handleOnChangeAmount = (amount: string) => {
    const edited = editedFormatter(amount)
    const numberOfDecimals = (edited.split('.')[1] ?? []).length
    if (
      Number(edited) <= Number.MAX_SAFE_INTEGER &&
      numberOfDecimals <= wallet.portfolioPrimaryTokenInfo.decimals
    ) {
      setAmount(edited)
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      track.receiveAmountPageViewed()
    }, [track]),
  )

  return (
    <KeyboardAvoidingView style={[styles.flex, styles.root, {backgroundColor: color.bg_color_max}]}>
      <SafeAreaView
        style={[styles.flex, styles.container]}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.flex}
          onScrollBarChange={setIsScrollBarShown}
        >
          <View style={styles.request}>
            <Text style={[styles.textAddressDetails, {color: color.text_gray_medium}]}>
              {strings.specificAmountDescription}
            </Text>

            <TextInput
              label={strings.ADALabel}
              keyboardType="numeric"
              onChangeText={handleOnChangeAmount}
              value={amount}
              testID="receive:request-specific-amount-ada-input"
              noHelper
            />

            <View style={styles.textSection}>
              <Text style={[styles.textAddressDetails, {color: color.gray_600}]}>
                {strings.address}
              </Text>

              <Text style={[styles.textAddressDetails, {color: color.text_gray_medium}]}>{selectedAddress}</Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.actions,
            isScrollBarShown && {
              borderTopWidth: 1,
              borderTopColor: color.gray_200,
            },
          ]}
        >
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
  const {track} = useMetrics()
  const {color} = useTheme()

  const cardanoLinks = linksCardanoModuleMaker()
  const cardanoRequestLink = cardanoLinks.create({
    config: configCardanoLegacyTransfer,
    params: {
      address: address,
      amount: Number(amount),
    },
  })
  const yoroiLinks = linksYoroiModuleMaker('yoroi')
  const yoroiPaymentRequestLink = yoroiLinks.transfer.request.adaWithLink({
    link: cardanoRequestLink.link,
  })

  const {
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()
  const hasAmount = !isEmptyString(amount)
  const hasAddress = !isEmptyString(address)
  const content = hasAmount ? yoroiPaymentRequestLink : address
  const title = hasAmount
    ? `${amount} ${portfolioPrimaryTokenInfo.ticker.toLocaleUpperCase()}`
    : ''

  const {copy} = useCopy()

  return (
    <View style={[styles.container, styles.flex]}>
      <RNScrollView
        contentContainerStyle={[styles.flex_grow, styles.modalContainer]}
      >
        {hasAddress ? (
          <ShareQRCodeCard
            title={title}
            shareContent={content}
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
          onPress={(event: GestureResponderEvent) =>
            copy({text: content, feedback: strings.copyLinkMsg, event})
          }
          disabled={!hasAmount}
          title={strings.copyLinkBtn}
          icon={Icon.Copy}
          testID="receive:request-specific-amount:copy-link-button"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    ...a.p_lg,
  },
  modalContainer: {
    ...a.justify_between,
    ...a.gap_lg,
  },
  flex: {
    ...a.flex_1,
  },
  flex_grow: {
    ...a.flex_grow,
  },
  textAddressDetails: {
    ...a.body_1_lg_regular,
  },
  textSection: {
    ...a.gap_xs,
  },
  request: {
    ...a.gap_lg,
  },
  actions: {
    ...a.pt_lg,
  },
})