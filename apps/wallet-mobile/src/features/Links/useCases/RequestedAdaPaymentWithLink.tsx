import {LinksTransferRequestAdaWithLinkParams, useLinks} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'

import {Button, Spacer, useModal} from '../../../components'
import {isEmptyString} from '../../../utils/utils'

export const RequestedAdaPaymentWithLink = ({
  params,
  isTrusted,
}: {
  params: LinksTransferRequestAdaWithLinkParams
  isTrusted?: boolean
}) => {
  const {styles, colors} = useStyles()
  const {actionFinished} = useLinks()
  const {closeModal} = useModal()

  const trustedTextColor = isTrusted ? colors.warning : colors.danger
  const trustedText = isTrusted ? 'attention' : 'danger' // TODO revisit

  const handleOnCancel = () => {
    actionFinished()
    closeModal()
  }
  const handleOnContinue = () => {
    actionFinished()
    closeModal()
  }

  return (
    <View style={styles.root}>
      <ScrollView>
        <Text style={{color: trustedTextColor}}>{trustedText}</Text>

        <Message message={params.message} />

        <Spacer fill />
      </ScrollView>

      <Actions style={styles.actions}>
        <Button onPress={handleOnCancel} title="cancel !!!!" />

        <Button onPress={handleOnContinue} title="continue !!!!" />
      </Actions>
    </View>
  )
}

const Message = ({message}: {message?: string}) =>
  !isEmptyString(message) && (
    <>
      <Text>{message}</Text>

      <Spacer height={10} />
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
  })
  const colors = {
    danger: color.magenta[500],
    warning: color.yellow[500],
  }
  return {styles, colors}
}
