import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {HelperText} from '../../../../../components'
import {memoMaxLenght} from '../../../common/constants'
import {useStrings} from '../../../common/strings'

export const ShowMemoInstructions = ({memo = ''}: {memo?: string}) => {
  const strings = useStrings()

  const lenghtInfo = `${memo.length}/${memoMaxLenght}`

  return (
    <View style={styles.row}>
      <HelperText type="info">{strings.helperMemoInstructions}</HelperText>

      <HelperText type="info">{lenghtInfo}</HelperText>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
