import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'

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
  const {styles} = useStyles()
  const {actionFinished} = useLinks()
  const {closeModal} = useModal()

  // TODO: revisit check with product
  const disclaimerStyle = isTrusted ? styles.text : styles.text
  const description = isTrusted
    ? strings.trustedBrowserLaunchDappUrlDescription
    : strings.untrustedBrowserLaunchDappUrlDescription

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  // NOTE: modal content therefore no need to use SafeAreaView
  return (
    <View style={styles.root}>
      <ScrollView bounces={false}>
        <ShowDisclaimer title={strings.disclaimer}>
          <Text style={disclaimerStyle}>{description}</Text>
        </ShowDisclaimer>

        <Space.Height.lg />

        {/* TODO: revisit SHOW the app name or unknown */}
        {/* TODO: revisit SHOW verified / not verified icon and text */}
        {/* TODO: revisit SHOW if it was initialized by Yoroi -> authorization */}
        {/* TODO: revisit SHOW if it was initialized by Wallet -> walletId -> name */}

        <Message message={params.message} />

        <View style={{flex: 1}} />
      </ScrollView>

      <Actions style={styles.actions}>
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
  const {styles} = useStyles()
  return (
    !isEmptyString(message) && (
      <>
        <Text style={styles.text}>{message}</Text>

        <Space.Height.lg />
      </>
    )
  )
}
const Actions = (props: ViewProps) => <View {...props} />

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: p.bg_color_max,
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    text: {
      color: p.text_gray_max,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    },
  })
  const colors = {
    danger: p.sys_magenta_500,
    warning: p.sys_orange_500,
  }
  return {styles, colors} as const
}
