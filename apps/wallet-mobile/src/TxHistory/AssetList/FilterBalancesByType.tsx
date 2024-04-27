import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Spacer} from '../../components/Spacer'
import {ChipButton} from './ChipButton'

type Props<T> = {
  selectedValue: T
  chips: ReadonlyArray<{
    label: string
    value: T
    onPress: () => void
    disabled?: boolean
  }>
}

export const FilterBalancesByType = <T,>({chips, selectedValue}: Props<T>) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      {chips.map(({label, disabled, onPress, value}, index) => (
        <View key={label}>
          <ChipButton
            key={index}
            label={label}
            disabled={disabled}
            onPress={onPress}
            selected={selectedValue === value}
          />

          {index != chips.length - 1 && <Spacer width={12} />}
        </View>
      ))}
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      display: 'flex',
      ...atoms.px_lg,
      ...atoms.pb_2xs,
        justifyContent: 'flex-start',
      flexDirection: 'row',
    },
  })
  return {styles}
}
