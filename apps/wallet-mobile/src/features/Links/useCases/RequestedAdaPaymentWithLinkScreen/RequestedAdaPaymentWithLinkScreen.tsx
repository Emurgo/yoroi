import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../../components'
import {isEmptyString} from '../../../../kernel/utils'
import {useStrings} from '../../common/useStrings'
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
  const {styles} = useStyles()
  const {actionFinished} = useLinks()
  const {closeModal} = useModal()

  // TODO: revisit check with product
  const disclaimerStyle = isTrusted ? styles.text : styles.text
  const description = isTrusted
    ? strings.trustedPaymentRequestedDescription
    : strings.untrustedPaymentRequestedDescription

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.root}>
      <ScrollView bounces={false}>
        <ShowDisclaimer title={strings.disclaimer}>
          <Text style={disclaimerStyle}>{description}</Text>
        </ShowDisclaimer>

        <Spacer height={16} />

        {/* TODO: revisit SHOW the app name or unknown */}
        {/* TODO: revisit SHOW verified / not verified icon and text */}
        {/* TODO: revisit SHOW if it was initialized by Yoroi -> authorization */}
        {/* TODO: revisit SHOW if it was initialized by Wallet -> walletId -> name */}

        <Message message={params.message} />

        <Spacer fill />
      </ScrollView>

      <Actions style={styles.actions}>
        <Button block outlineShelley onPress={handleOnCancel} title={strings.cancel} />

        <Spacer width={16} />

        <Button block shelleyTheme onPress={onContinue} title={strings.continue} />
      </Actions>
    </SafeAreaView>
  )
}

const Message = ({message}: {message?: string}) =>
  !isEmptyString(message) && (
    <>
      <Text>{message}</Text>

      <Spacer height={16} />
    </>
  )
const Actions = (props: ViewProps) => <View {...props} />

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_high,
      ...atoms.px_lg,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text: {
      ...atoms.body_2_md_regular,
      color: color.gray_cmax,
    },
  })
  const colors = {
    danger: color.sys_magenta_c500,
    warning: color.sys_orange_c500,
  }
  return {styles, colors}
}
