import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {Text, View} from 'react-native'

import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'
import {YoroiWallet} from '~/wallets/cardano/types'

export const About = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const {network} = useSelectedNetwork()

  const {version, commit} = wallet
  const FCMToken = wallet.FCMToken

  const getWalletType = (wallet: YoroiWallet) => {
    if (wallet.isByron) return strings.settings.about.byronWallet
    if (wallet.isShelley) return strings.settings.about.shelleyWallet
    return strings.settings.about.unknownWalletType
  }

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

        <Text
          style={[
            {
              color: p.gray_500,
            },
            a.body_1_lg_regular,
          ]}
        >
          {getWalletType(wallet)}
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
