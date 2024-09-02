import {amountFormatter} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React, {ReactElement} from 'react'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Hr, Icon, Spacer, Text} from '../../components'
import {isEmptyString} from '../../kernel/utils'
import {useCollateralInfo} from '../../yoroi-wallets/cardano/utxoManager/useCollateralInfo'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {usePrivacyMode} from './PrivacyMode/PrivacyMode'

const Touchable = (props: TouchableOpacityProps) => <TouchableOpacity {...props} activeOpacity={0.5} />

type SettingsSectionProps = {
  title?: string
  children: React.ReactNode
}

export const SettingsSection = ({title, children}: SettingsSectionProps) => {
  const {styles} = useStyles()
  return (
    <View>
      {title != null && (
        <>
          <Text style={styles.sectionText}>{title}</Text>

          <Spacer height={5} />

          <Hr style={styles.separator} />
        </>
      )}

      <View>{children}</View>
    </View>
  )
}

type SettingsItemProps = {
  label: string
  children: React.ReactNode
  disabled?: boolean
  icon?: ReactElement
  info?: string
}

export const SettingsItem = ({label, children, disabled, icon, info}: SettingsItemProps) => {
  const {styles} = useStyles()

  return (
    <View>
      <View style={styles.itemInner}>
        <View style={styles.itemMainContent}>
          {icon}

          {icon && <Spacer width={10} />}

          <Text style={[styles.label, styles.itemText, disabled && styles.disabled]}>{label}</Text>

          <View>{children}</View>
        </View>

        {!isEmptyString(info) && (
          <>
            <Spacer height={12} />

            <Text style={styles.itemTextIsNil}>{info}</Text>
          </>
        )}
      </View>

      <Hr style={styles.separator} />
    </View>
  )
}
type NavigatedSettingsItemProps = {
  label: string
  onNavigate: () => void
  icon?: ReactElement
  disabled?: boolean
  selected?: string
}

export const NavigatedSettingsItem = ({label, onNavigate, icon, disabled, selected}: NavigatedSettingsItemProps) => {
  const {styles, color} = useStyles()
  return (
    <Touchable onPress={onNavigate} disabled={disabled}>
      <SettingsItem icon={icon} label={label} disabled={disabled}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {!isEmptyString(selected) && <Text style={styles.navigationItem}>{selected}</Text>}

          <Spacer width={16} />

          <Icon.Chevron direction="right" size={28} color={color.gray_600} />
        </View>
      </SettingsItem>
    </Touchable>
  )
}

type SettingsBuildItemProps = {
  label: string
  value: string
}

export const SettingsBuildItem = ({label, value}: SettingsBuildItemProps) => (
  <SettingsItem label={label}>
    <Text secondary>{value}</Text>
  </SettingsItem>
)

export const SettingsCollateralItem = ({label, onNavigate, icon, disabled}: NavigatedSettingsItemProps) => {
  const {styles, colors} = useStyles()
  const {wallet} = useSelectedWallet()
  const {amount} = useCollateralInfo(wallet)
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  const formattedCollateral = React.useMemo(() => {
    const amountCollateral = {
      info: wallet.portfolioPrimaryTokenInfo,
      quantity: BigInt(amount.quantity),
    }

    return !isPrivacyActive
      ? amountFormatter({template: '{{value}} {{ticker}}'})(amountCollateral)
      : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})(amountCollateral)
  }, [amount.quantity, isPrivacyActive, privacyPlaceholder, wallet.portfolioPrimaryTokenInfo])

  return (
    <Touchable onPress={onNavigate} disabled={disabled}>
      <SettingsItem label={label} icon={icon}>
        <View style={styles.row}>
          <Text secondary>{formattedCollateral}</Text>

          <Icon.Chevron direction="right" size={28} color={colors.icon} />
        </View>
      </SettingsItem>
    </Touchable>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    itemInner: {
      paddingVertical: 16,
    },
    itemMainContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      flex: 1,
    },
    disabled: {
      color: color.gray_500,
    },
    sectionText: {
      color: color.gray_900,
      ...atoms.body_2_md_regular,
    },
    itemText: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
    itemTextIsNil: {
      color: color.gray_600,
      ...atoms.body_3_sm_regular,
    },
    navigationItem: {
      color: color.gray_500,
      ...atoms.body_1_lg_regular,
    },
    separator: {
      backgroundColor: color.gray_200,
      height: 1,
    },
    row: {flexDirection: 'row', alignItems: 'center'},
  })

  const colors = {
    icon: color.el_gray_medium,
  }
  return {styles, colors, color}
}
