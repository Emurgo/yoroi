import {useResolverSetShowNotice, useResolverShowNotice} from '@yoroi/resolver'
import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'

import {Icon} from '~/ui/Icon'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'

export const NotifySupportedNameServers = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
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
        style={[{borderRadius: 8}, a.p_md]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={[p.secondary_200, p.primary_100]}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          ]}
        >
          <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
            {`${strings.send.resolverNoticeTitle} `}😇
          </Text>

          <TouchableOpacity onPress={handleOnClose}>
            <Icon.CrossCircle size={24} color={p.gray_max} />
          </TouchableOpacity>
        </View>

        <Space.Height.sm />

        <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
          {strings.send.resolverNoticeText}:
        </Text>

        <NameServer text="ADA Handle" />

        <NameServer text="Unstoppable Domains" />

        <NameServer text="Cardano Name Service (CNS)" />
      </LinearGradient>

      <Space.Height.md />
    </View>
  )
}

const NameServer = ({text}: {text: string}) => {
  const {palette: p} = useTheme()
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          lineHeight: 22,
          color: p.gray_max,
        },
      ]}
    >
      <Space.Width.sm />

      <Text style={[a.body_2_md_medium, {color: p.gray_max}]}>·</Text>

      <Space.Width.sm />

      <Text style={[a.body_2_md_medium, {color: p.gray_max}]}>{text}</Text>
    </View>
  )
}
