import {
  configCardanoLegacyTransfer,
  linksCardanoModuleMaker,
  linksYoroiModuleMaker,
} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'
import {
  GestureResponderEvent,
  ScrollView as RNScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/useScrollView'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
import {SkeletonAdressDetail} from '~/ui/SkeletonAddressDetail/SkeletonAddressDetail'
import {TextInput} from '~/ui/TextInput/TextInput'
import {editedFormatter} from '~/wallets/utils/amountUtils'
import {isEmptyString} from '~/wallets/utils/string'

import {useReceive} from '../common/ReceiveProvider'

export const RequestSpecificAmountScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const [amount, setAmount] = React.useState('')
  const {wallet} = useSelectedWallet()

  const {track} = useMetrics()
  const hasAmount = !isEmptyString(amount)
  const {scrollViewRef} = useScrollView()

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
    <SafeArea>
      <ScrollView ref={scrollViewRef} style={[a.flex_1]}>
        <View style={[a.gap_lg]}>
          <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
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
            <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
              {strings.receive.address}
            </Text>

            <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
              {selectedAddress}
            </Text>
          </View>
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={handleOnGenerateLink}
          disabled={!hasAmount}
          title={strings.receive.generateLink}
          testID="receive:request-specific-amount:generate-link-button"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}

const Modal = ({amount, address}: {amount: string; address: string}) => {
  const strings = useStrings()
  const {track} = useMetrics()

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
