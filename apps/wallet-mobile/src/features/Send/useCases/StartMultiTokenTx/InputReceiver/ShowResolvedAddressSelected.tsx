import {nameServerName} from '@yoroi/resolver'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {useStrings} from '../../../common/strings'

export const ShowResolvedAddressSelected = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {targets, selectedTargetIndex} = useTransfer()
  const {selectedNameServer} = targets[selectedTargetIndex].receiver
  const {address} = targets[selectedTargetIndex].entry

  const hide = address.length === 0 || selectedNameServer == null

  if (hide) return null

  const serverName = nameServerName[selectedNameServer]
  const shortenAddress = shortenString(address)
  const resolvedAddressInfo = `${strings.resolvedAddress}: ${shortenAddress}`

  return (
    <View>
      <Spacer height={4} />

      <View style={styles.row}>
        <Text style={styles.serverName} numberOfLines={1}>
          {serverName}
        </Text>

        <Text style={styles.address} numberOfLines={1}>
          {resolvedAddressInfo}
        </Text>
      </View>
    </View>
  )
}

const shortenString = (text: string) => {
  if (text.length > 16) {
    return text.substring(0, 8) + '...' + text.substring(text.length - 8)
  }
  return text
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    serverName: {
      ...typography['body-3-s-regular'],
      color: color.gray[700],
    },
    address: {
      ...typography['body-3-s-regular'],
      color: color.gray[500],
    },
  })

  return styles
}
