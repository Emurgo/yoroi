import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'

import {Button, Spacer, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {isEmptyString} from '../../../../kernel/utils'
import {useStrings} from '../../common/useStrings'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'

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

        <Space height="lg" />

        {/* TODO: revisit SHOW the app name or unknown */}
        {/* TODO: revisit SHOW verified / not verified icon and text */}
        {/* TODO: revisit SHOW if it was initialized by Yoroi -> authorization */}
        {/* TODO: revisit SHOW if it was initialized by Wallet -> walletId -> name */}

        <Message message={params.message} />

        <Spacer fill />
      </ScrollView>

      <Actions style={styles.actions}>
        <Button block outlineShelley onPress={handleOnCancel} title={strings.cancel} />

        <Button block shelleyTheme onPress={onContinue} title={strings.continue} />
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

        <Space height="lg" />
      </>
    )
  )
}
const Actions = (props: ViewProps) => <View {...props} />

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.pb_lg,
    },
    actions: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.gap_lg,
    },
    text: {
      color: color.text_gray_max,
      ...atoms.body_2_md_regular,
    },
  })
  const colors = {
    danger: color.sys_magenta_500,
    warning: color.sys_orange_500,
  }
  return {styles, colors} as const
}
