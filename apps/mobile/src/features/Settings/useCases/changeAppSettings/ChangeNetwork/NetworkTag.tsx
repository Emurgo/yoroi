import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {
  Text,
  TextStyle,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native'

import {availableNetworks} from '~/features/WalletManager/common/constants'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useWalletNavigation} from '~/kernel/navigation/navigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {useStrings} from '~/kernel/i18n/useStrings'

export const NetworkTag = ({
  children,
  directChangeActive,
  style,
  disabled,
  textStyle,
}: {
  children: React.ReactNode
  directChangeActive?: boolean
  style?: ViewStyle
  disabled?: boolean
  textStyle?: TextStyle
}) => {
  const {
    selected: {network: selectedNetwork},
    walletManager,
  } = useWalletManager()
  const {navigateToChangeNetwork} = useWalletNavigation()
  const {atoms: ta, atoms} = useTheme()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {track} = useMetrics()
  const width = useWindowDimensions().width - 120

  const Tag = selectedNetwork === Chain.Network.Preprod ? PreprodTag : null

  const onPress = () => {
    if (directChangeActive && selectedNetwork !== Chain.Network.Mainnet) {
      const nextNetwork =
        availableNetworks[
          (availableNetworks.indexOf(selectedNetwork) + 1) %
            availableNetworks.length
        ]

      if (nextNetwork === Chain.Network.Mainnet) {
        openModal({
          title: strings.settings.changeNetwork.networkTagModalTitle,
          content: (
            <MainnetWarningDialog
              onCancel={closeModal}
              onOk={() => {
                track.networkSelected({
                  to_network: nextNetwork,
                  from_network: selectedNetwork,
                })
                walletManager.setSelectedNetwork(nextNetwork)
                closeModal()
              }}
            />
          ),
          height: 280,
        })

        return
      }

      track.networkSelected({
        to_network: nextNetwork,
        from_network: selectedNetwork,
      })
      walletManager.setSelectedNetwork(nextNetwork)
      return
    }

    if (!directChangeActive) navigateToChangeNetwork()
  }

  return (
    <View
      style={[
        {
          width,
        },
        a.flex_row,
        a.align_center,
        a.justify_center,
        style,
      ]}
    >
      <Text
        numberOfLines={1}
        accessibilityRole="header"
        aria-level="1"
        ellipsizeMode="tail"
        style={[
          ta.text_gray_medium,
          a.body_1_lg_medium,
          a.flex_shrink,
          textStyle,
        ]}
      >
        {children}
      </Text>

      {Tag && (
        <View style={[a.pl_sm, {flexShrink: 0}]}>
          <Tag
            onPress={onPress}
            disabled={
              ((directChangeActive &&
                selectedNetwork === Chain.Network.Mainnet) ||
                disabled) ??
              false
            }
          />
        </View>
      )}
    </View>
  )
}

const PreprodTag = ({
  onPress,
  disabled,
}: {
  onPress: () => void
  disabled: boolean
}) => {
  const {palette: p, atoms: ta} = useTheme()

  const {name} = networkConfigs[Chain.Network.Preprod]

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      style={[
        {backgroundColor: p.sys_yellow_500},
        a.rounded_full,
        a.px_sm,
        a.py_xs,
      ]}
      disabled={disabled}
    >
      <Text>{name}</Text>
    </TouchableOpacity>
  )
}

const MainnetWarningDialog = ({
  onCancel,
  onOk,
}: {
  onCancel: () => void
  onOk: () => void
}) => {
  const {atoms: ta} = useTheme()

  const strings = useStrings()

  return (
    <View style={[a.px_lg, a.flex_1]}>
      <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.settings.changeNetwork.networkTagModalText}
      </Text>

      <Space.Height.lg fill />

      <View style={[a.pb_lg, a.flex_row, a.justify_between]}>
        <Button
          size="S"
          type={ButtonType.Secondary}
          title="Cancel"
          onPress={onCancel}
        />

        <Space.Width.lg />

        <Button size="S" title="Switch" onPress={onOk} />
      </View>
    </View>
  )
}
