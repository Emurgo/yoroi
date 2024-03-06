import {useResolverSetShowNotice, useResolverShowNotice} from '@yoroi/resolver'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../../../components'
import {PressableIcon} from '../../../../../components/PressableIcon/PressableIcon'
import {useStrings} from '../../../common/strings'

export const NotifySupportedNameServers = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {showNotice, refetch} = useResolverShowNotice()

  const {setShowNotice} = useResolverSetShowNotice({
    onSuccess: () => refetch(),
  })
  const handleOnClose = React.useCallback(() => {
    setShowNotice(false)
  }, [setShowNotice])

  if (!showNotice) return null

  return (
    <View>
      <LinearGradient
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={[colors.lightGreen, colors.lightBlue]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{`${strings.resolverNoticeTitle} `}😇</Text>

          <PressableIcon icon={Icon.CrossCircle} onPress={handleOnClose} size={24} />
        </View>

        <Spacer height={10} />

        <Text style={styles.text}>{strings.resolverNoticeText}:</Text>

        <NameServer text="ADA Handle" />

        <NameServer text="Unstoppable Domains" />

        <NameServer text="Cardano Name Service (CNS)" />
      </LinearGradient>

      <Spacer height={16} />
    </View>
  )
}

const NameServer = ({text}: {text: string}) => {
  const {styles} = useStyles()
  return (
    <View style={styles.nameServerRoot}>
      <Spacer width={8} />

      <Text style={styles.nameServerText}>·</Text>

      <Spacer width={8} />

      <Text style={styles.nameServerText}>{text}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding, typography} = theme
  const styles = StyleSheet.create({
    gradient: {
      borderRadius: 8,
      ...padding['m'],
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nameServerRoot: {
      flexDirection: 'row',
      alignItems: 'center',
      lineHeight: 22,
      color: color.gray.max,
    },
    nameServerText: {
      ...typography['body-2-m-medium'],
      color: color.gray.max,
    },
    title: {
      ...typography['body-1-l-medium'],
      color: color.gray.max,
    },
    text: {
      ...typography['body-2-m-regular'],
      color: color.gray.max,
    },
  })

  const colors = {
    lightGreen: color.secondary[200],
    lightBlue: color.primary[100],
  }

  return {styles, colors}
}
