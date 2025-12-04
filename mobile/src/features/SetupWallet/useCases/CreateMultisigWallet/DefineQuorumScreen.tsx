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
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

type RouteParams = {
  parentWalletId: string
  sharedWalletKey: Wallet.Bip32PublicKeyHex
  parentWalletImplementation: Wallet.Implementation
  accountVisual: number
  coSigners: ReadonlyArray<Wallet.CoSigner>
}

type QuorumType = 'RequireAllOf' | 'RequireAnyOf' | 'RequireNOf'

export const DefineQuorumScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Space.Height.lg />

          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.defineQuorumDescription}
          </Text>

          <Space.Height.lg />

          {/* Quorum type options */}
          <View style={[a.gap_sm]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.quorumTypeLabel}
            </Text>

            <TouchableOpacity
              onPress={() => handleQuorumTypeChange('RequireAllOf')}
              style={[
                a.p_md,
                a.rounded_sm,
                a.border,
                {
                  backgroundColor:
                    quorumType === 'RequireAllOf' ? p.primary_100 : p.gray_min,
                  borderColor:
                    quorumType === 'RequireAllOf' ? p.primary_600 : p.gray_200,
                },
              ]}
              testID="quorum-type-all"
            >
              <Text style={[a.heading_4_medium]}>
                {strings.setupWallet.quorumAllOf}
              </Text>
              <Space.Height.xs />
              <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                {strings.setupWallet.quorumAllOfDescription}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuorumTypeChange('RequireAnyOf')}
              style={[
                a.p_md,
                a.rounded_sm,
                a.border,
                {
                  backgroundColor:
                    quorumType === 'RequireAnyOf' ? p.primary_100 : p.gray_min,
                  borderColor:
                    quorumType === 'RequireAnyOf' ? p.primary_600 : p.gray_200,
                },
              ]}
              testID="quorum-type-any"
            >
              <Text style={[a.heading_4_medium]}>
                {strings.setupWallet.quorumAnyOf}
              </Text>
              <Space.Height.xs />
              <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                {strings.setupWallet.quorumAnyOfDescription}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuorumTypeChange('RequireNOf')}
              style={[
                a.p_md,
                a.rounded_sm,
                a.border,
                {
                  backgroundColor:
                    quorumType === 'RequireNOf' ? p.primary_100 : p.gray_min,
                  borderColor:
                    quorumType === 'RequireNOf' ? p.primary_600 : p.gray_200,
                },
              ]}
              testID="quorum-type-nof"
            >
              <Text style={[a.heading_4_medium]}>
                {strings.setupWallet.quorumNOf}
              </Text>
              <Space.Height.xs />
              <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                {strings.setupWallet.quorumNOfDescription}
              </Text>
            </TouchableOpacity>
          </View>

          {/* N-of-K input */}
          {quorumType === 'RequireNOf' && (
            <>
              <Space.Height.md />
              <TextInput
                label={strings.setupWallet.requiredSignaturesLabel}
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
              <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
                {error}
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title={strings.global.proceed}
          onPress={handleContinue}
          testID="continue-after-define-quorum-button"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
