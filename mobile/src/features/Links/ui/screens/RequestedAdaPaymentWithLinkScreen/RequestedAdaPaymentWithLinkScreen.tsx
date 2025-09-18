import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'

import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {isEmptyString} from '~/wallets/utils/string'

import {ShowDisclaimer} from '../../shared/ShowDisclaimer/ShowDisclaimer'

export const RequestedAdaPaymentWithLinkScreen = ({
  params,
  isTrusted,
  onContinue,
  onClose,
}: {
  params: Links.TransferRequestAdaWithLinkParams
  isTrusted?: boolean
  onContinue: () => void
  onClose: () => void
}) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {actionFinished} = useLinks()

  // TODO: revisit check with product
  const description = isTrusted
    ? strings.links.trustedPaymentRequestedDescription
    : strings.links.untrustedPaymentRequestedDescription

  const handleOnCancel = () => {
    actionFinished()
    onClose()
  }

  return (
    <View style={[ta.bg_color_max, a.flex_1, a.pb_lg, a.gap_lg]}>
      <ScrollView bounces={false} contentContainerStyle={a.gap_lg}>
        <ShowDisclaimer title={strings.global.disclaimer}>
          <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
            {description}
          </Text>
        </ShowDisclaimer>

        <Message message={params.message} />
      </ScrollView>

      <Actions style={[a.flex_row, a.justify_between, a.gap_lg]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={handleOnCancel}
          title={strings.global.cancel}
        />

        <Button size="S" onPress={onContinue} title={strings.global.proceed} />
      </Actions>
    </View>
  )
}

const Message = ({message}: {message?: string}) => {
  const {atoms: ta} = useTheme()

  if (isEmptyString(message)) {
    return null
  }

  return (
    <View style={[a.p_lg, a.rounded_sm, ta.bg_color_min]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_max]}>{message}</Text>
    </View>
  )
}

const Actions = View
