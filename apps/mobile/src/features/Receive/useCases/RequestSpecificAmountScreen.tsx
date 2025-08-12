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
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {useModal} from '~/ui/Modal/ModalContext'
import {ScrollView, useScrollView} from '~/ui/ScrollView/ScrollView'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
import {SkeletonAdressDetail} from '~/ui/SkeletonAddressDetail/SkeletonAddressDetail'
import {TextInput} from '~/ui/TextInput/TextInput'
import {editedFormatter} from '~/wallets/utils/amountUtils'
import {isEmptyString} from '~/wallets/utils/string'
import {useReceive} from '../common/ReceiveProvider'

export const RequestSpecificAmountScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
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
      title: strings.receive.amountToReceive,
      content: <Modal amount={amount} address={selectedAddress} />,
      height: modalHeight,
    })
  }, [
    track,
    amount,
    openModal,
    strings.receive.amountToReceive,
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
    <KeyboardAvoidingView
      style={[a.flex_1, {flex: 1}, {backgroundColor: p.bg_color_max}]}
    >
      <SafeAreaView
        style={[a.flex_1, a.p_lg]}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          ref={scrollViewRef}
          style={[a.flex_1]}
          onScrollBarChange={setIsScrollBarShown}
        >
          <View style={[a.gap_lg]}>
            <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
              {strings.receive.specificAmountDescription}
            </Text>

            <TextInput
              label={strings.receive.ADALabel}
              keyboardType="numeric"
              onChangeText={handleOnChangeAmount}
              value={amount}
              testID="receive:request-specific-amount-ada-input"
              noHelper
            />

            <View style={[a.gap_xs]}>
              <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
                {strings.receive.address}
              </Text>

              <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
                {selectedAddress}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            a.pt_lg,
            isScrollBarShown && {
              borderTopWidth: 1,
              borderTopColor: p.gray_200,
            },
          ]}
        >
          <Button
            onPress={handleOnGenerateLink}
            disabled={!hasAmount}
            title={strings.receive.generateLink}
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
  const {palette: p} = useTheme()

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
    <View style={[a.p_lg, a.flex_1]}>
      <RNScrollView
        contentContainerStyle={[a.flex_grow, a.justify_between, a.gap_lg]}
      >
        {hasAddress ? (
          <ShareQRCodeCard
            title={title}
            shareContent={content}
            qrContent={content}
            onLongPress={(event: GestureResponderEvent) =>
              copy({
                text: content,
                feedback: strings.receive.addressCopiedMsg,
                event,
              })
            }
            testID="receive:specific-amount"
            onShare={() => track.receiveShareAddressClicked()}
            shareLabel={strings.receive.shareLabel}
          />
        ) : (
          <View style={[{flex: 1}]}>
            <SkeletonAdressDetail />
          </View>
        )}
      </RNScrollView>

      <View style={[a.pt_lg]}>
        <Button
          onPress={(event: GestureResponderEvent) =>
            copy({text: content, feedback: strings.receive.copyLinkMsg, event})
          }
          disabled={!hasAmount}
          title={strings.receive.copyLinkBtn}
          icon={Icon.Copy}
          testID="receive:request-specific-amount:copy-link-button"
        />
      </View>
    </View>
  )
}
