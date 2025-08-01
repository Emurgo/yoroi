import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {isEmptyString} from '~/wallets/utils/string'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'

export const RequestedAdaPaymentWithLinkScreen = ({
  params,
  isTrusted,
  onContinue,
}: {
  params: Links.TransferRequestAdaWithLinkParams
  isTrusted?: boolean
  onContinue: () => void
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {actionFinished} = useLinks()
  const {closeModal} = useModal()

  // TODO: revisit check with product
  const description = isTrusted
    ? strings.links.trustedPaymentRequestedDescription
    : strings.links.untrustedPaymentRequestedDescription

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[{backgroundColor: p.bg_color_max}, a.flex_1, a.px_lg]}
    >
      <ScrollView bounces={false}>
        <ShowDisclaimer title={strings.links.disclaimer}>
          <Text style={[a.body_2_md_regular, {color: p.text_gray_max}]}>
            {description}
          </Text>
        </ShowDisclaimer>

        <Space.Height.md />

        {/* TODO: revisit SHOW the app name or unknown */}
        {/* TODO: revisit SHOW verified / not verified icon and text */}
        {/* TODO: revisit SHOW if it was initialized by Yoroi -> authorization */}
        {/* TODO: revisit SHOW if it was initialized by Wallet -> walletId -> name */}

        <Message message={params.message} />

        <View style={[{flex: 1}]} />
      </ScrollView>

      <Actions style={[a.flex_row, a.justify_between]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={handleOnCancel}
          title={strings.links.cancel}
        />

        <Space.Width.md />

        <Button size="S" onPress={onContinue} title={strings.links.continue} />
      </Actions>
    </SafeAreaView>
  )
}

const Message = ({message}: {message?: string}) => {
  const {palette: p} = useTheme()
  return (
    !isEmptyString(message) && (
      <>
        <Text style={[a.body_2_md_regular, {color: p.text_gray_max}]}>
          {message}
        </Text>

        <Space.Height.lg />
      </>
    )
  )
}
const Actions = (props: ViewProps) => <View {...props} />
