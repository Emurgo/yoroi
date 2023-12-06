import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../components'
import {useTheme} from '../../../theme'
import {Theme} from '../../../theme/types'
import {useStrings} from '../TxHistoryList'
import { useNavigateTo } from './BigBanner'

type Props = {
  onClose: () => void
}

const SmaillBanner = (props: Props) => {
  const {onClose} = props

  const strings = useStrings()

  const {theme} = useTheme()
  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])

  const navigateTo = useNavigateTo()

  const handleExchange = () => {
    navigateTo.exchange()
  }
  return (
    <View style={styles.root}>
      <LinearGradient
        style={styles.gradient}
        start={{x: 1, y: 1}}
        end={{x: 0, y: 0}}
        colors={theme.color.gradients['blue-green']}
      >
        <View style={styles.viewTitle}>
          <Text style={styles.title}>{strings.needMoreAda}</Text>

          <TouchableOpacity onPress={onClose}>
            <Icon.Close size={26} />
          </TouchableOpacity>
        </View>

        <Spacer width={16} />

        <Text style={styles.text}>{strings.ourTrustedPartners}</Text>

        <Spacer width={16} />

        <TouchableOpacity onPress={handleExchange}>
          <Text style={styles.textButton}>{strings.buyADA.toUpperCase()}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )
}

export default SmaillBanner

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    root: {
      backgroundColor: theme.color['white-static'],
      paddingHorizontal: 20,
      paddingVertical: 18,
    },
    gradient: {
      opacity: 1,
      borderRadius: 8,
      flexDirection: 'column',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    viewTitle: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 16,
      fontWeight: '500',
      fontFamily: 'Rubik',
      width: '80%',
    },
    text: {
      fontSize: 16,
      fontWeight: '400',
      fontFamily: 'Rubik',
    },
    textButton: {
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Rubik',
      color: theme.color.primary[500],
    },
  })
  return styles
}
