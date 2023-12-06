import {
  DomainService as DomainServiceEnum,
  useReadResolverNoticeStatus,
  useSaveResolverNoticeStatus,
} from '@yoroi/resolver'
import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Icon, Spacer} from '../../../../../components'
import {useStrings} from '../../../common/strings'
import {Service} from '../InputReceiver/ResolveAddress'

export const InitialDomainNotice = () => {
  const strings = useStrings()
  const {readResolverNoticeStatus, refetch: refetchResolverNoticeStatus} = useReadResolverNoticeStatus()
  const {saveResolverNoticeStatus} = useSaveResolverNoticeStatus({
    onSuccess: () => refetchResolverNoticeStatus(),
  })

  if (readResolverNoticeStatus === true) {
    return null
  }

  return (
    <LinearGradient style={styles.gradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}} colors={['#C6F7ED', '#E4E8F7']}>
      <View style={styles.header}>
        <Text style={styles.title}>{strings.resolverNoticeTitle}</Text>

        <TouchableOpacity
          onPress={() => {
            saveResolverNoticeStatus(true)
          }}
        >
          <Icon.CrossCircle size={24} />
        </TouchableOpacity>
      </View>

      <Spacer height={10} />

      <DomainService text={Service[DomainServiceEnum.Handle]} />

      <DomainService text={Service[DomainServiceEnum.Cns]} />

      <DomainService text={Service[DomainServiceEnum.Unstoppable]} />
    </LinearGradient>
  )
}

const DomainService = ({text}: {text: string}) => {
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
