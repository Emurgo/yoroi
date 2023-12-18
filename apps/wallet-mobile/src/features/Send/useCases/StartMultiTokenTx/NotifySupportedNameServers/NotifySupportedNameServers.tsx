import {nameServerName, useResolverSetShowNotice, useResolverShowNotice} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../../../components'
import {PressableIcon} from '../../../../../components/PressableIcon/PressableIcon'
import {useStrings} from '../../../common/strings'

export const NotifySupportedNameServers = () => {
  const strings = useStrings()
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
      <LinearGradient style={styles.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={['#C6F7ED', '#E4E8F7']}>
        <View style={styles.header}>
          <Text style={styles.title}>{strings.resolverNoticeTitle}</Text>

          <PressableIcon icon={Icon.CrossCircle} onPress={handleOnClose} size={24} />
        </View>

        <Spacer height={10} />

        <NameServer text={nameServerName[Resolver.NameServer.Handle]} />

        <NameServer text={nameServerName[Resolver.NameServer.Cns]} />

        <NameServer text={nameServerName[Resolver.NameServer.Unstoppable]} />
      </LinearGradient>

      <Spacer height={16} />
    </View>
  )
}

const NameServer = ({text}: {text: string}) => {
  return (
    <View style={styles.nameServerRoot}>
      <Spacer width={8} />

      <Text style={styles.nameServerText}>·</Text>

      <Spacer width={8} />

      <Text style={styles.nameServerText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 8,
    padding: 12,
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
    color: '#000',
  },
  nameServerText: {
    fontWeight: '400',
    fontFamily: 'Rubik-Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#000',
  },
  title: {
    fontFamily: 'Rubik-Medium',
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
})
