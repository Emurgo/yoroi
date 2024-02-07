import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {HelperText} from '../../../../../components'
import {memoMaxLenght} from '../../../common/constants'
import {useStrings} from '../../../common/strings'

export const ShowMemoErrorTooLong = ({memo = ''}: {memo?: string}) => {
  const strings = useStrings()

  const lenghtInfo = `${memo.length}/${memoMaxLenght}`

  return (
    <View style={styles.row}>
      <HelperText type="error">{strings.helperMemoErrorTooLong}</HelperText>

      <HelperText type="error">{lenghtInfo}</HelperText>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
