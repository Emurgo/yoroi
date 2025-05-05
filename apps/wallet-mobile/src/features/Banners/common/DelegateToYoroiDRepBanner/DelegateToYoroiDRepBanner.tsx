import {GOVERNANCE_YOROI_DREP_ID_HEX, useDelegationCertificate} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View, ViewStyle} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {Button} from '../../../../components/Button/Button'
import {DismissibleView} from '../../../../components/DismissableView'
import {Icon} from '../../../../components/Icon'
import {Text} from '../../../../components/Text'
import {useCreateGovernanceTx} from '../../../../yoroi-wallets/hooks'
import {useGovernanceActions} from '../../../Staking/Governance/common/helpers'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {GovernanceBackground} from '../../illustrations/GovernanceBackground'
import {useStrings} from '../strings'

type Props = {
  isVisible: boolean
  onDismiss?: () => void
  style?: ViewStyle
}

export const DelegateToYoroiDRepBanner = ({onDismiss, isVisible, style}: Props) => {
  const {styles, colors} = useStyles()
  const {title, description, cta} = useStrings()
  const {wallet, meta} = useSelectedWallet()

  const {createCertificate: createDelegationCertificate} = useDelegationCertificate({
    useErrorBoundary: true,
  })

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    useErrorBoundary: true,
  })

  const governanceActions = useGovernanceActions()

  const handleDelegateToYoroi = React.useCallback(async () => {
    const stakingKey = await wallet.getStakingKey()

    createDelegationCertificate(
      {hash: GOVERNANCE_YOROI_DREP_ID_HEX, type: 'key', stakingKey},
      {
        onSuccess: async (certificate) => {
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: [certificate],
            addressMode: meta.addressMode,
          })

          governanceActions.handleDelegateAction({
            unsignedTx,
            hash: GOVERNANCE_YOROI_DREP_ID_HEX,
            type: 'key',
            CIP105: false,
          })
        },
      },
    )
  }, [createDelegationCertificate, createGovernanceTxMutation, governanceActions, meta.addressMode, wallet])

  return (
    <DismissibleView isVisible={isVisible} style={style}>
      <LinearGradient start={{x: 1, y: 1}} end={{x: 0, y: 0}} colors={colors.gradient} style={styles.gradient}>
        <View style={styles.root}>
          <GovernanceBackground style={styles.backgroundImage} />

          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} style={styles.dismiss}>
              <Icon.Close color={colors.icon} size={20} />
            </TouchableOpacity>
          )}

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>{description}</Text>

          <Button style={styles.cta} type="Secondary" size="S" onPress={handleDelegateToYoroi} title={cta} />
        </View>
      </LinearGradient>
    </DismissibleView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    backgroundImage: {
      ...atoms.absolute,
      right: 0,
      bottom: 0,
    },
    dismiss: {
      width: 20,
      height: 20,
      right: atoms.px_lg.paddingRight,
      top: atoms.py_lg.paddingTop,
      ...atoms.absolute,
      ...atoms.z_10,
    },
    cta: {
      ...atoms.self_start,
    },
    gradient: {
      ...atoms.relative,
      ...atoms.rounded_sm,
    },
    root: {
      minHeight: 134,
      ...atoms.py_lg,
      ...atoms.px_lg,
      ...atoms.relative,
    },
    title: {
      color: color.gray_max,
      ...atoms.font_semibold,
      ...atoms.body_1_lg_medium,
    },
    description: {
      color: color.gray_max,
      maxWidth: 279,
      ...atoms.font_normal,
      ...atoms.body_2_md_regular,
      ...atoms.pb_lg,
    },
  })

  const colors = {
    gradient: color.bg_gradient_1,
    icon: color.gray_max,
  }

  return {styles, colors} as const
}
