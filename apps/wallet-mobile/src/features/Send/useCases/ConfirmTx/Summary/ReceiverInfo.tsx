import {nameServerName} from '@yoroi/resolver'
import {useTheme} from '@yoroi/theme'
import {Transfer} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../../components/Spacer'
import {Text} from '../../../../../components/Text'
import {useStrings} from '../../../common/strings'

export const ReceiverInfo = ({target}: {target: Transfer.Target}) => {
  const strings = useStrings()
  const {receiver, entry} = target
  const styles = useStyles()

  return (
    <View>
      <Text style={styles.label}>{strings.receiver}</Text>

      <Spacer height={2} />

      {target.receiver.as === 'domain' ? (
        <>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.value}>
              {receiver.selectedNameServer != null ? nameServerName[receiver.selectedNameServer] : ''}:
            </Text>

            <Spacer width={5} />

            <Text style={styles.value}>{receiver.resolve}</Text>
          </View>

          <Spacer height={12} />

          <Text style={styles.label}>{strings.walletAddress}:</Text>

          <Spacer height={2} />

          <Text testID="receiverAddressText" style={styles.value}>
            {entry.address}
          </Text>
        </>
      ) : (
        <Text testID="receiverAddressText" style={styles.value}>
          {entry.address}
        </Text>
      )}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    label: {
      ...atoms.body_2_md_regular,
      color: color.gray_900,
    },
    value: {
      ...atoms.body_1_lg_regular,
      color: color.gray_900,
    },
  })

  return styles
}
