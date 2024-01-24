import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useTheme} from '../../../../../theme'
import {Theme} from '../../../../../theme/types'
import {useStrings} from '../../../common/useStrings'

export const ShowProviderFee = () => {
  const {theme} = useTheme()

  const strings = useStrings()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{strings.providerFee}</Text>

      <Text style={styles.text}>{`${2}%`}</Text>
    </View>
  )
}

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    text: {
      fontSize: 16,
      fontFamily: 'Rubik',
    },
    label: {
      fontSize: 16,
      color: theme.color.gray[600],
      fontFamily: 'Rubik',
    },
  })
  return styles
}
