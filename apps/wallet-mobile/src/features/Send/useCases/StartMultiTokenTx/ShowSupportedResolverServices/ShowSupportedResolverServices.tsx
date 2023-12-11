import {serviceName, useResolverSetShowNotice, useResolverShowNotice} from '@yoroi/resolver'
import {Resolver} from '@yoroi/types'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../../../components'
import {PressableIcon} from '../../../../../components/PressableIcon/PressableIcon'
import {useStrings} from '../../../common/strings'

export const ShowSupportedResolverServices = () => {
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
    <LinearGradient style={styles.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={['#C6F7ED', '#E4E8F7']}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.resolverNoticeTitle}</Text>

        <PressableIcon icon={Icon.CrossCircle} onPress={handleOnClose} size={24} />
      </View>

      <Spacer height={10} />

      <Service text={serviceName[Resolver.Service.Handle]} />

      <Service text={serviceName[Resolver.Service.Cns]} />

      <Service text={serviceName[Resolver.Service.Unstoppable]} />
    </LinearGradient>
  )
}

const Service = ({text}: {text: string}) => {
  return (
    <View style={styles.domainServiceContainer}>
      <Spacer width={8} />

      <Text style={styles.domainServiceText}>·</Text>

      <Spacer width={8} />

      <Text style={styles.domainServiceText}>{text}</Text>
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
  domainServiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    lineHeight: 22,
    color: '#000',
  },
  domainServiceText: {
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
