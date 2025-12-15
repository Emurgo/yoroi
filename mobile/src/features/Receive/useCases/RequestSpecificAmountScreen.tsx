import {isEmptyString} from '@yoroi/cardano-wallet'
import {parseNumberFromText} from '@yoroi/common'
import {
  configCardanoPayV1,
  linksCardanoModuleMaker,
  linksYoroiModuleMaker,
} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as React from 'react'
import {
  GestureResponderEvent,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {useScrollView} from '~/ui/ScrollView/hooks/useScrollView'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
import {SkeletonAdressDetail} from '~/ui/SkeletonAddressDetail/SkeletonAddressDetail'
import {TextInput} from '~/ui/TextInput/TextInput'

import {useReceive} from '../common/ReceiveProvider'

export const RequestSpecificAmountScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {numberLocale} = useLanguage()
  const [amount, setAmount] = React.useState('')
  const {wallet} = useSelectedWallet()

  const hasAmount = !isEmptyString(amount)
  const {scrollViewRef} = useScrollView()

  const {selectedAddress} = useReceive()

  const screenHeight = useWindowDimensions().height
  const modalHeight = (screenHeight / 100) * 80
  const {openModal} = useModal()

  const handleOnGenerateLink = React.useCallback(() => {
    openModal({
      title: strings.receive.amountToReceive,
      content: <ModalContent amount={amount} address={selectedAddress} />,
      footer: <ModalFooter amount={amount} address={selectedAddress} />,
      height: modalHeight,
    })
  }, [
    amount,
    openModal,
    strings.receive.amountToReceive,
    selectedAddress,
    modalHeight,
  ])

  const handleOnChangeAmount = (text: string) => {
    const result = parseNumberFromText({
      text,
      denomination: wallet.portfolioPrimaryTokenInfo.decimals,
      format: numberLocale,
      precision: wallet.portfolioPrimaryTokenInfo.decimals,
    })

    // Validate the numeric value is within safe integer range
    if (
      result.numericValue <= Number.MAX_SAFE_INTEGER &&
      result.formattedValue !== undefined
    ) {
      setAmount(result.formattedValue)
    } else if (text === '') {
      setAmount('')
    }
  }

  return (
    <SafeArea>
      <ScrollView
        ref={scrollViewRef}
        style={[a.pt_lg]}
        contentContainerStyle={[a.px_lg]}
      >
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

const ModalContent = ({amount, address}: {amount: string; address: string}) => {
  const strings = useStrings()
  const {copy} = useCopy()
  const {numberLocale} = useLanguage()
  const {wallet} = useSelectedWallet()
  const cardanoLinks = linksCardanoModuleMaker()

  // Parse amount to get numeric value for link creation
  const parsedAmount = parseNumberFromText({
    text: amount,
    denomination: wallet.portfolioPrimaryTokenInfo.decimals,
    format: numberLocale,
  })

  const cardanoRequestLink = cardanoLinks.create({
    config: configCardanoPayV1,
    params: {
      address: address,
      amount: parsedAmount.numericValue,
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

  return (
    <Modal.Content
      contentContainerStyle={[
        a.flex_grow,
        a.justify_between,
        a.gap_lg,
        a.px_lg,
      ]}
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
          shareLabel={strings.receive.shareLabel}
        />
      ) : (
        <View style={[a.flex_1]}>
          <SkeletonAdressDetail />
        </View>
      )}
    </Modal.Content>
  )
}

const ModalFooter = ({amount, address}: {amount: string; address: string}) => {
  const strings = useStrings()
  const {copy} = useCopy()
  const {numberLocale} = useLanguage()
  const {wallet} = useSelectedWallet()

  const cardanoLinks = linksCardanoModuleMaker()

  // Parse amount to get numeric value for link creation
  const parsedAmount = parseNumberFromText({
    text: amount,
    denomination: wallet.portfolioPrimaryTokenInfo.decimals,
    format: numberLocale,
  })

  const cardanoRequestLink = cardanoLinks.create({
    config: configCardanoPayV1,
    params: {
      address: address,
      amount: parsedAmount.numericValue,
    },
  })
  const yoroiLinks = linksYoroiModuleMaker('yoroi')
  const yoroiPaymentRequestLink = yoroiLinks.transfer.request.adaWithLink({
    link: cardanoRequestLink.link,
  })

  const hasAmount = !isEmptyString(amount)
  const content = hasAmount ? yoroiPaymentRequestLink : address

  return (
    <Modal.Footer>
      <Button
        onPress={(event: GestureResponderEvent) =>
          copy({text: content, feedback: strings.receive.copyLinkMsg, event})
        }
        title={strings.receive.copyLinkBtn}
        icon={Icon.Copy}
        testID="receive:request-specific-amount:copy-link-button"
      />
    </Modal.Footer>
  )
}
