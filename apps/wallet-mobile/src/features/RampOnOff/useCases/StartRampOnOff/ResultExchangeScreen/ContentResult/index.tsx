import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useTheme} from '../../../../../../theme'
import {Theme} from '../../../../../../theme/types'

interface ContentResultProps {
  title: string
  children: React.ReactNode
}

const ContentResult = ({title, children}: ContentResultProps) => {
  const {theme} = useTheme()

  const styles = React.useMemo(() => getStyles({theme: theme}), [theme])
  return (
    <View style={styles.containerContent}>
      <Text style={styles.contentLabel}>{title}</Text>

      <View>{children}</View>
    </View>
  )
}

export default ContentResult

const getStyles = (props: {theme: Theme}) => {
  const {theme} = props
  const styles = StyleSheet.create({
    containerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    contentLabel: {
      fontSize: 16,
      color: theme.color.gray[600],
    },
  })
  return styles
}
