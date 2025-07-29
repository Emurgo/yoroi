import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, Text, View, ViewProps} from 'react-native'

import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'

// Temporary implementations
const useStrings = () => ({
  disclaimer: 'Disclaimer',
  trustedBrowserLaunchDappUrlDescription: 'Trusted browser launch description',
  untrustedBrowserLaunchDappUrlDescription:
    'Untrusted browser launch description',
  cancel: 'Cancel',
  continue: 'Continue',
})

const isEmptyString = (str: string | undefined | null): boolean => {
  return str == null || str.trim() === ''
}

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
  const {palette: p} = useTheme()
  const {actionFinished} = useLinks()
  const {closeModal} = useModal()

  // TODO: revisit check with product
  const description = isTrusted
    ? strings.trustedBrowserLaunchDappUrlDescription
    : strings.untrustedBrowserLaunchDappUrlDescription

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  // NOTE: modal content therefore no need to use SafeAreaView
  return (
    <View
      style={[
        {
          backgroundColor: p.bg_color_max,
          flex: 1,
          paddingHorizontal: 16,
          paddingBottom: 16,
        },
      ]}
    >
      <ScrollView bounces={false}>
        <ShowDisclaimer title={strings.disclaimer}>
          <Text
            style={[
              {
                color: p.text_gray_max,
                fontSize: 14,
                lineHeight: 20,
                fontWeight: '400',
              },
            ]}
          >
            {description}
          </Text>
        </ShowDisclaimer>

        <Space.Height.lg />

        {/* TODO: revisit SHOW the app name or unknown */}
        {/* TODO: revisit SHOW verified / not verified icon and text */}
        {/* TODO: revisit SHOW if it was initialized by Yoroi -> authorization */}
        {/* TODO: revisit SHOW if it was initialized by Wallet -> walletId -> name */}

        <Message message={params.message} />

        <View style={{flex: 1}} />
      </ScrollView>

      <Actions
        style={[
          {flexDirection: 'row', justifyContent: 'space-between', gap: 16},
        ]}
      >
        <Button
          size="S"
          type={ButtonType.Secondary}
          onPress={handleOnCancel}
          title={strings.cancel}
        />

        <Button size="S" onPress={onContinue} title={strings.continue} />
      </Actions>
    </View>
  )
}

const Message = ({message}: {message?: string}) => {
  const {palette: p} = useTheme()
  return (
    !isEmptyString(message) && (
      <>
        <Text
          style={[
            {
              color: p.text_gray_max,
              fontSize: 14,
              lineHeight: 20,
              fontWeight: '400',
            },
          ]}
        >
          {message}
        </Text>

        <Space.Height.lg />
      </>
    )
  )
}
const Actions = (props: ViewProps) => <View {...props} />
