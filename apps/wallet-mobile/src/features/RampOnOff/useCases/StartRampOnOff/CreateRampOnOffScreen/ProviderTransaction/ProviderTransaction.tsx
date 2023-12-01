import * as React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import image from '../../../../../../assets/img/banxa.png'
import {Spacer} from '../../../../../../components'
import {useTheme} from '../../../../../../theme'
import {Theme} from '../../../../../../theme/types'
import { useStrings } from '../../../../common/strings'

const ProviderTransaction = () => {
  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])
  const strings = useStrings()

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{strings.provider}</Text>

      <View style={styles.row}>
        <Image style={styles.logo} source={image} />

        <Spacer width={4} />

        <Text style={styles.text}>{strings.banxa}</Text>
      </View>
    </View>
  )
}

export default ProviderTransaction

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    container: {
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
