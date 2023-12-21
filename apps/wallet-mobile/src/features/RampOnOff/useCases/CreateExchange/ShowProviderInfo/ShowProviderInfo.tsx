import * as React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import banxaLogo from '../../../../../assets/img/banxa.png'
import {Spacer} from '../../../../../components'
import {useTheme} from '../../../../../theme'
import {Theme} from '../../../../../theme/types'
import {useStrings} from '../../../common/useStrings'

export const ShowProviderInfo = () => {
  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <Text style={styles.label}>{strings.provider}</Text>

      <View style={styles.row}>
        <Image style={styles.logo} source={banxaLogo} />

        <Spacer width={4} />

        <Text style={styles.text}>{strings.banxa}</Text>
      </View>
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
      paddingVertical: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
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
    logo: {
      height: 24,
      width: 24,
    },
  })

  return styles
}
