import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {Icon} from '../../../../components'
import {getDomainFromUrl} from '../../common/helpers'
import {useNavigateTo} from '../../common/useNavigateTo'
type Props = {
  uri: string
}
export const BrowserToolbar = ({uri}: Props) => {
  const {styles, colors} = useStyles()
  const navigateTo = useNavigateTo()

  const {isSecure, domainName} = getDomainFromUrl(uri)

  const handleCloseBrowser = () => {
    navigateTo.selectDappFromList()
  }

  const handleEditUrl = () => {
    navigateTo.searchDappInBrowser()
  }

  return (
    <View style={styles.root}>
      <View style={styles.boxURI}>
        <TouchableOpacity onPress={handleEditUrl} style={styles.urlContainer}>
          {isSecure && <Icon.LockFilled />}

          <Text style={styles.uriText}>{domainName}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleCloseBrowser}>
        <Icon.Close size={24} color={colors.iconColor} />
      </TouchableOpacity>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {typography, color} = theme

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.white_static,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    boxURI: {
      borderRadius: 8,
      backgroundColor: color.gray_c50,
      paddingVertical: 13,
      paddingHorizontal: 12,
      flex: 1,
    },
    uriText: {
      ...atoms.body_2_md_regular,
      color: color.black_static,
    },
    urlContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  })

  const colors = {
    iconColor: color.gray_c800,
  }

  return {styles, colors} as const
}
