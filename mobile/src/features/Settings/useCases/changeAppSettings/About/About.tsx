import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {commit, version} from '~/kernel/constants'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'

// TODO: REVISIT after firebase messaging is back
const FCMToken = ''

export const About = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {network} = useSelectedNetwork()

  return (
    <View style={[a.p_lg, a.gap_lg]}>
      <View>
        <Text
          style={[
            {
              color: p.gray_900,
            },
            a.body_1_lg_medium,
          ]}
        >
          {strings.settings.about.currentVersion}
        </Text>

        <Text
          style={[
            {
              color: p.gray_500,
            },
            a.body_1_lg_regular,
          ]}
        >
          {version}
        </Text>
      </View>

      <View>
        <Text
          style={[
            {
              color: p.gray_900,
            },
            a.body_1_lg_medium,
          ]}
        >
          {strings.settings.about.commit}
        </Text>

        <Text
          style={[
            {
              color: p.gray_500,
            },
            a.body_1_lg_regular,
          ]}
        >
          {commit}
        </Text>
      </View>

      <View>
        <Text
          style={[
            {
              color: p.gray_900,
            },
            a.body_1_lg_medium,
          ]}
        >
          {strings.settings.about.network}
        </Text>

        <Text
          style={[
            {
              color: p.gray_500,
            },
            a.body_1_lg_regular,
          ]}
        >
          {network}
        </Text>
      </View>

      <View>
        <Text
          style={[
            {
              color: p.gray_900,
            },
            a.body_1_lg_medium,
          ]}
        >
          {strings.settings.about.walletType}
        </Text>
      </View>

      <Space.Height.lg />

      <View>
        <Text
          style={[
            {
              color: p.gray_900,
            },
            a.body_1_lg_medium,
          ]}
        >
          {strings.settings.about.commit}
        </Text>

        <Text
          style={[
            {
              color: p.gray_500,
            },
            a.body_1_lg_regular,
          ]}
        >
          {commit}
        </Text>
      </View>

      {FCMToken !== undefined && (
        <>
          <Text
            style={[
              {
                color: p.gray_900,
              },
              a.body_1_lg_medium,
            ]}
          >
            {strings.settings.about.fcmToken}
          </Text>

          <Copiable text={FCMToken}>
            <View style={{flex: 1}}>
              <Text
                style={[
                  {
                    color: p.gray_500,
                  },
                  a.body_1_lg_regular,
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {FCMToken}
              </Text>
            </View>
          </Copiable>
        </>
      )}
    </View>
  )
}
