import {useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {useModal} from '../../../../components/Modal/ModalContext'
import {Space} from '../../../../components/Space/Space'
import {Spacer} from '../../../../components/Spacer/Spacer'
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
        <Button size="S" type={ButtonType.Secondary} onPress={handleOnCancel} title={strings.cancel} />

        <Spacer width={16} />

        <Button size="S" onPress={onContinue} title={strings.continue} />
      </Actions>
    </SafeAreaView>
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
    },
    actions: {
      ...atoms.flex_row,
      ...atoms.justify_between,
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
