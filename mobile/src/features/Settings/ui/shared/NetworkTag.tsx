import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'

import * as React from 'react'
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {availableNetworks} from '@yoroi/wallet-manager/common/constants'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

type Props = React.PropsWithChildren<{
  directChangeActive?: boolean
  style?: ViewStyle
  disabled?: boolean
  textStyle?: TextStyle
}>

export const NetworkTag = ({
  children,
  directChangeActive,
  style,
  disabled,
  textStyle,
}: Props) => {
  const {
    selected: {network: selectedNetwork},
    walletManager,
  } = useWalletManager()
  const {navigateToChangeNetwork} = useWalletNavigation()
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const {isAuthDev} = useAuth()
  const width = useWindowDimensions().width - 120

  const Tag =
    selectedNetwork === Chain.Network.Preprod
      ? PreprodTag
      : selectedNetwork === Chain.Network.Mainnet && isAuthDev
        ? MainnetTag
        : null

  const onPress = () => {
    if (directChangeActive) {
      const nextNetwork =
        availableNetworks[
          (availableNetworks.indexOf(selectedNetwork) + 1) %
            availableNetworks.length
        ]

      // Show confirmation modal when switching to Mainnet
      if (nextNetwork === Chain.Network.Mainnet) {
        const onConfirm = () => {
          walletManager.setSelectedNetwork(nextNetwork)
          closeModal()
        }
        openModal({
          title: strings.settings.changeNetwork.networkTagModalTitle,
          content: (
            <Modal.Content>
              <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
                {strings.settings.changeNetwork.networkTagModalText}
              </Text>
            </Modal.Content>
          ),
          footer: (
            <Modal.Footer style={[a.flex_row, a.justify_end, a.gap_lg]}>
              <Button
                size="S"
                type={ButtonType.Secondary}
                title={strings.global.cancel}
                onPress={closeModal}
                style={[a.flex_1]}
              />

              <Button
                size="S"
                title={strings.global.switch}
                onPress={onConfirm}
                style={[a.flex_1]}
              />
            </Modal.Footer>
          ),
          height: 280,
        })

        return
      }

      // Direct switch for other networks (e.g., Mainnet -> Preprod in dev mode)
      walletManager.setSelectedNetwork(nextNetwork!)
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
          <Tag onPress={onPress} disabled={disabled ?? false} />
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
  disabled?: boolean
}) => {
  const {palette: p} = useTheme()

  const {name} = networkConfigs[Chain.Network.Preprod]

  return (
    <TouchableOpacity
      onPress={onPress}
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

const MainnetTag = ({
  onPress,
  disabled,
}: {
  onPress: () => void
  disabled?: boolean
}) => {
  const {palette: p} = useTheme()

  const {name} = networkConfigs[Chain.Network.Mainnet]

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {backgroundColor: p.primary_500},
        a.rounded_full,
        a.px_sm,
        a.py_xs,
      ]}
      disabled={disabled}
    >
      <Text style={{color: p.white_static}}>{name}</Text>
    </TouchableOpacity>
  )
}
