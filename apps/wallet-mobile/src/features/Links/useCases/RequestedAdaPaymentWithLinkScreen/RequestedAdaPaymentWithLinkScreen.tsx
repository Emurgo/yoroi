import {LinksTransferRequestAdaWithLinkParams, useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../../components'
import {isEmptyString} from '../../../../utils/utils'
import {useStrings} from '../../common/useStrings'
import {ShowDisclaimer} from './ShowDisclaimer/ShowDisclaimer'

export const RequestedAdaPaymentWithLinkScreen = ({
  params,
  isTrusted,
  onContinue,
}: {
  params: LinksTransferRequestAdaWithLinkParams
  isTrusted?: boolean
  onContinue: () => void
}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {actionFinished} = useLinks()
  const {closeModal} = useModal()

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
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text: {
      ...theme.typography['body-2-m-regular'],
      color: theme.color.gray.max,
    },
  })
  const colors = {
    danger: color.magenta[500],
    warning: color.yellow[500],
  }
  return {styles, colors}
}
