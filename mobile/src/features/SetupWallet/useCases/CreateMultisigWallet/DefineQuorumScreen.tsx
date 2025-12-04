/**
 * Define Quorum Screen
 * Configure quorum rules (all/any/N-of-K)
 */
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useNavigation, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

type RouteParams = {
  parentWalletId: string
  parentWalletRootKey?: string
  sharedWalletKey: Wallet.Bip32PublicKeyHex
  parentWalletImplementation: Wallet.Implementation
  accountVisual: number
  coSigners: ReadonlyArray<Wallet.CoSigner>
}

type QuorumType = 'RequireAllOf' | 'RequireAnyOf' | 'RequireNOf'

export const DefineQuorumScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const route = useRoute()
  const [quorumType, setQuorumType] = React.useState<QuorumType>('RequireNOf')
  const [requiredCount, setRequiredCount] = React.useState('2')
  const [error, setError] = React.useState<string | null>(null)

  const params = React.useMemo(
    () => (route.params as RouteParams) || {},
    [route.params],
  )
  const {coSigners} = params

  const coSignerCount = coSigners.length

  const handleQuorumTypeChange = React.useCallback((type: QuorumType) => {
    setQuorumType(type)
    setError(null)
  }, [])

  const handleRequiredCountChange = React.useCallback((value: string) => {
    setRequiredCount(value)
    setError(null)
  }, [])

  const handleContinue = React.useCallback(() => {
    setError(null)

    let quorumRules: Wallet.QuorumRules

    if (quorumType === 'RequireNOf') {
      const required = parseInt(requiredCount, 10)
      if (isNaN(required) || required < 1 || required > coSignerCount) {
        setError(`Required count must be between 1 and ${coSignerCount}`)
        return
      }
      quorumRules = {
        kind: 'RequireNOf',
        required,
      }
    } else {
      quorumRules = {
        kind: quorumType,
      }
    }

    navigation.navigate('setup-wallet-multisig-review', {
      ...params,
      quorumRules,
      walletName: '', // Will be set in review screen
    })
  }, [quorumType, requiredCount, coSignerCount, navigation, params])

  return (
    <SafeArea>
      <Space.Height.lg />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Text style={[ta.heading_1]}>
            {strings.setupWallet.defineQuorumTitle || 'Define Quorum Rules'}
          </Text>

          <Space.Height.md />

          <Text style={[ta.body_1_lg_regular]}>
            {strings.setupWallet.defineQuorumDescription ||
              `Configure how many co-signers need to sign transactions. You have ${coSignerCount} co-signer${coSignerCount > 1 ? 's' : ''}.`}
          </Text>

          <Space.Height.lg />

          {/* Quorum type options */}
          <View style={[a.gap_sm]}>
            <Text style={[ta.heading_3]}>
              {strings.setupWallet.quorumTypeLabel || 'Quorum Type'}
            </Text>

            <TouchableOpacity
              onPress={() => handleQuorumTypeChange('RequireAllOf')}
              style={[
                a.p_md,
                a.rounded_sm,
                a.border,
                quorumType === 'RequireAllOf' ? a.bg_primary_light : a.bg_white,
                quorumType === 'RequireAllOf'
                  ? {borderColor: ta.primary.color}
                  : {borderColor: ta.gray_c200.color},
              ]}
              testID="quorum-type-all"
            >
              <Text style={[ta.heading_4]}>
                {strings.setupWallet.quorumAllOf || 'Require All Of'}
              </Text>
              <Space.Height.xs />
              <Text style={[ta.body_2_md_regular, {color: ta.gray_c600.color}]}>
                {strings.setupWallet.quorumAllOfDescription ||
                  `All ${coSignerCount} co-signers must sign`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuorumTypeChange('RequireAnyOf')}
              style={[
                a.p_md,
                a.rounded_sm,
                a.border,
                quorumType === 'RequireAnyOf' ? a.bg_primary_light : a.bg_white,
                quorumType === 'RequireAnyOf'
                  ? {borderColor: ta.primary.color}
                  : {borderColor: ta.gray_c200.color},
              ]}
              testID="quorum-type-any"
            >
              <Text style={[ta.heading_4]}>
                {strings.setupWallet.quorumAnyOf || 'Require Any Of'}
              </Text>
              <Space.Height.xs />
              <Text style={[ta.body_2_md_regular, {color: ta.gray_c600.color}]}>
                {strings.setupWallet.quorumAnyOfDescription ||
                  'Any 1 co-signer can sign'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuorumTypeChange('RequireNOf')}
              style={[
                a.p_md,
                a.rounded_sm,
                a.border,
                quorumType === 'RequireNOf' ? a.bg_primary_light : a.bg_white,
                quorumType === 'RequireNOf'
                  ? {borderColor: ta.primary.color}
                  : {borderColor: ta.gray_c200.color},
              ]}
              testID="quorum-type-nof"
            >
              <Text style={[ta.heading_4]}>
                {strings.setupWallet.quorumNOf || 'Require N Of K'}
              </Text>
              <Space.Height.xs />
              <Text style={[ta.body_2_md_regular, {color: ta.gray_c600.color}]}>
                {strings.setupWallet.quorumNOfDescription ||
                  'Specify how many co-signers must sign'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* N-of-K input */}
          {quorumType === 'RequireNOf' && (
            <>
              <Space.Height.md />
              <TextInput
                label={
                  strings.setupWallet.requiredSignaturesLabel ||
                  `Required Signatures (1-${coSignerCount})`
                }
                value={requiredCount}
                onChangeText={handleRequiredCountChange}
                keyboardType="numeric"
                placeholder={`Enter number between 1 and ${coSignerCount}`}
                testID="required-count-input"
              />
            </>
          )}

          {error && (
            <>
              <Space.Height.sm />
              <Text style={[ta.body_1_lg_medium, {color: ta.error.color}]}>
                {error}
              </Text>
            </>
          )}

          <Space.Height.lg />

          <Button
            title={strings.global.continue || 'Continue'}
            onPress={handleContinue}
            testID="continue-after-define-quorum-button"
          />
        </View>
      </ScrollView>
    </SafeArea>
  )
}
