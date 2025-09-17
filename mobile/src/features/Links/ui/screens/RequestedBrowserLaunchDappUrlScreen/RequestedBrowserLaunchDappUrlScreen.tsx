import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'

import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {isEmptyString} from '~/wallets/utils/string'

import {ShowDisclaimer} from '../../shared/ShowDisclaimer/ShowDisclaimer'

export const RequestedBrowserLaunchDappUrlScreen = ({
  params,
  isTrusted,
  onContinue,
}: {
  params: Links.BrowserLaunchDappUrlParams
  isTrusted?: boolean
  onContinue: () => void
}) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {actionFinished} = useLinks()
  const {closeModal} = useModal()

  const description = isTrusted
    ? strings.links.trustedBrowserLaunchDappUrlDescription
    : strings.links.untrustedBrowserLaunchDappUrlDescription

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  return (
    <View style={[a.flex_1, ta.bg_color_max, a.gap_lg]}>
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

        <Button
          size="S"
          type={ButtonType.Primary}
          onPress={onContinue}
          title={strings.global.proceed}
        />
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
