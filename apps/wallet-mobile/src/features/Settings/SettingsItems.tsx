import _ from 'lodash'
import React, {ReactElement} from 'react'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Hr, Icon, Spacer, Text} from '../../components'
import {formatTokenWithSymbol} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {lightPalette} from '../../theme'
import {useCollateralInfo} from '../../yoroi-wallets/cardano/utxoManager/useCollateralInfo'

const Touchable = (props: TouchableOpacityProps) => <TouchableOpacity {...props} activeOpacity={0.5} />

type SettingsSectionProps = {
  title?: string
  children: React.ReactNode
}

export const SettingsSection = ({title, children}: SettingsSectionProps) => (
  <View>
    {title != null && (
      <>
        <Text style={{fontFamily: 'Rubik-Regular', color: lightPalette.gray['600'], fontSize: 14, lineHeight: 22}}>
          {title}
        </Text>

        <Spacer height={5} />

        <Hr />
      </>
    )}

    <View>{children}</View>
  </View>
)

type SettingsItemProps = {
  label: string
  children: React.ReactNode
  disabled?: boolean
  icon?: ReactElement
  info?: string
}

export const SettingsItem = ({label, children, disabled, icon, info}: SettingsItemProps) => (
  <View>
    <View style={styles.itemInner}>
      <View style={styles.itemMainContent}>
        {icon}

        {icon && <Spacer width={10} />}

        <Text
          style={[
            styles.label,
            {fontFamily: 'Rubik-Medium', color: lightPalette.gray['900'], fontSize: 16, lineHeight: 24},
            disabled && styles.disabled,
          ]}
        >
          {label}
        </Text>

        <View>{children}</View>
      </View>

      {!_.isNil(info) && (
        <>
          <Spacer height={12} />

          <Text
            style={{
              fontFamily: 'Rubik-Regular',
              color: lightPalette.gray['600'],
              fontSize: 12,
              lineHeight: 18,
            }}
          >
            {info}
          </Text>
        </>
      )}
    </View>

    <Hr />
  </View>
)
type NavigatedSettingsItemProps = {
  label: string
  onNavigate: () => void
  icon?: ReactElement
  disabled?: boolean
  selected?: string
}

export const NavigatedSettingsItem = ({label, onNavigate, icon, disabled, selected}: NavigatedSettingsItemProps) => {
  return (
    <Touchable onPress={onNavigate} disabled={disabled}>
      <SettingsItem icon={icon} label={label} disabled={disabled}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {!_.isNil(selected) && (
            <Text
              style={{
                fontFamily: 'Rubik-Regular',
                color: lightPalette.gray['500'],
                fontSize: 16,
                lineHeight: 24,
              }}
            >
              {selected}
            </Text>
          )}

          <Spacer width={16} />

          <Icon.Chevron direction="right" size={28} color={lightPalette.gray['600']} />
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
  const wallet = useSelectedWallet()
  const {amount} = useCollateralInfo(wallet)

  const formattedAmount = formatTokenWithSymbol(amount.quantity, wallet.primaryTokenInfo)

  return (
    <Touchable onPress={onNavigate} disabled={disabled}>
      <SettingsItem label={label} icon={icon}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text secondary>{formattedAmount}</Text>

          <Icon.Chevron direction="right" size={28} color={lightPalette.gray['600']} />
        </View>
      </SettingsItem>
    </Touchable>
  )
}

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
    color: COLORS.DISABLED,
  },
})
