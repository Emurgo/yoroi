import {useTheme} from '@yoroi/theme'
import React, {memo} from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../../components'
import {useNavigateTo} from '../useNavigateTo'
import {useSplitUrl} from '../useSplitUrl'
import {TabItem, useBrowser} from './BrowserProvider'

type Props = {
  tab: TabItem
  index: number
}
export const BrowserTabItem = memo(({tab, index}: Props) => {
  const {domainName} = useSplitUrl(tab.url)
  const {styles, colors} = useStyles()
  const {tabs, tabActiveIndex, setTabActive, removeTab} = useBrowser()
  const isTabActive = tabActiveIndex === index
  const {captureImage} = tabs[index]
  const navigationTo = useNavigateTo()

  const handleCloseTab = () => {
    if (tabs.length === 1) {
      removeTab(index)
      setTabActive(-1)
      navigationTo.discover()
      return
    }

    if (index <= tabActiveIndex) {
      setTabActive(tabActiveIndex - 1)
    }

    removeTab(index)
  }

  const onSelectTabActive = () => {
    setTabActive(index)
    navigationTo.browserView(`browser-view-${tab.id}`, 'navigate')
  }

  return (
    <TouchableOpacity style={styles.tabContainer} onPress={onSelectTabActive}>
      <View style={[styles.tabContainerPreview, isTabActive && styles.tabActiveContainer]}>
        {captureImage !== undefined ? (
          <Image source={{uri: captureImage}} resizeMode="cover" style={styles.imagePreview} />
        ) : null}

        <LinearGradient style={styles.overlay} colors={['#000000A1', '#00000000']} />
      </View>

      <Spacer height={4} />

      <Text style={styles.domainText}>{domainName}</Text>

      <TouchableOpacity style={styles.containerCloseBtn} onPress={handleCloseTab}>
        <Icon.Close size={20} color={colors.whiteStatic} />
      </TouchableOpacity>
    </TouchableOpacity>
  )
})

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    tabContainerPreview: {
      borderWidth: 2,
      borderColor: color.gray['200'],
      height: 164,
      borderRadius: 8,
      overflow: 'hidden',
    },
    tabContainer: {},
    domainText: {
      ...typography['body-2-m-regular'],
      color: color['black-static'],
    },
    imagePreview: {
      width: '100%',
      height: 160,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    tabActiveContainer: {
      borderColor: color.primary['500'],
    },
    containerCloseBtn: {
      position: 'absolute',
      right: 8,
      top: 8,
    },
  })

  const colors = {
    whiteStatic: color['white-static'],
  }

  return {styles, colors} as const
}
