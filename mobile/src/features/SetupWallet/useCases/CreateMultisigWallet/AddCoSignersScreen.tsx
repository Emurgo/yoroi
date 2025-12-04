/**
 * Add Co-Signers Screen
 * Add co-signers by public key
 */
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useNavigation, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

type RouteParams = {
  parentWalletId: string
  sharedWalletKey: Wallet.Bip32PublicKeyHex
  parentWalletImplementation: Wallet.Implementation
  accountVisual: number
}

export const AddCoSignersScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const route = useRoute()
  const [coSigners, setCoSigners] = React.useState<
    ReadonlyArray<Wallet.CoSigner>
  >([])
  const [newCoSignerName, setNewCoSignerName] = React.useState('')
  const [newCoSignerKey, setNewCoSignerKey] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const params = React.useMemo(
    () => (route.params as RouteParams) || {},
    [route.params],
  )
  const {sharedWalletKey} = params

  // Add the current wallet's shared key as the first co-signer
  React.useEffect(() => {
    if (sharedWalletKey && coSigners.length === 0) {
      setCoSigners([
        {
          name: 'My Wallet',
          sharedWalletKey,
        },
      ])
    }
  }, [sharedWalletKey, coSigners.length])

  const validatePublicKey = React.useCallback((key: string): boolean => {
    // Basic validation: should be hex string of appropriate length
    // Bip32PublicKeyHex is typically 64 bytes = 128 hex characters
    const hexPattern = /^[0-9a-fA-F]+$/
    return hexPattern.test(key) && key.length >= 64 && key.length <= 256
  }, [])

  const handleAddCoSigner = React.useCallback(() => {
    setError(null)

    if (!newCoSignerName.trim()) {
      setError('Co-signer name is required')
      return
    }

    if (!validatePublicKey(newCoSignerKey.trim())) {
      setError('Invalid public key format')
      return
    }

    const trimmedKey = newCoSignerKey.trim() as Wallet.Bip32PublicKeyHex

    // Check for duplicates
    if (coSigners.some((cs) => cs.sharedWalletKey === trimmedKey)) {
      setError('This public key is already added')
      return
    }

    setCoSigners([
      ...coSigners,
      {
        name: newCoSignerName.trim(),
        sharedWalletKey: trimmedKey,
      },
    ])

    setNewCoSignerName('')
    setNewCoSignerKey('')
  }, [newCoSignerName, newCoSignerKey, coSigners, validatePublicKey])

  const handleRemoveCoSigner = React.useCallback(
    (index: number) => {
      // Don't allow removing the first co-signer (current wallet)
      if (index === 0) return

      setCoSigners(coSigners.filter((_, i) => i !== index))
    },
    [coSigners],
  )

  const handleContinue = React.useCallback(() => {
    if (coSigners.length < 2) {
      setError('At least 2 co-signers are required for a multisig wallet')
      return
    }

    navigation.navigate('setup-wallet-multisig-define-quorum', {
      ...params,
      coSigners,
    })
  }, [coSigners, navigation, params])

  return (
    <SafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Space.Height.lg />

          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.addCoSignersDescription}
          </Text>

          <Space.Height.lg />

          {/* Current co-signers list */}
          <View style={[a.gap_sm]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.coSignersList} ({coSigners.length})
            </Text>

            {coSigners.map((coSigner, index) => (
              <View
                key={index}
                style={[
                  a.p_md,
                  a.rounded_sm,
                  a.flex_row,
                  a.align_center,
                  a.justify_between,
                  {backgroundColor: p.gray_50},
                ]}
              >
                <View style={[a.flex_1]}>
                  <Text style={[a.body_1_lg_medium]}>{coSigner.name}</Text>
                  <Space.Height.xs />
                  <Text
                    style={[a.body_2_md_regular, {fontFamily: 'monospace'}]}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {coSigner.sharedWalletKey.substring(0, 32)}...
                  </Text>
                </View>
                {index > 0 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveCoSigner(index)}
                    style={[a.p_sm]}
                    testID={`remove-cosigner-${index}`}
                  >
                    <Icon.Delete size={20} color={p.gray_max} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <Space.Height.lg />

          {/* Add new co-signer form */}
          <View style={[a.gap_md]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.addNewCoSigner}
            </Text>

            <TextInput
              label={strings.setupWallet.coSignerNameLabel}
              value={newCoSignerName}
              onChangeText={setNewCoSignerName}
              placeholder="Enter co-signer name"
              testID="cosigner-name-input"
            />

            <TextInput
              label={strings.setupWallet.publicKeyLabel}
              value={newCoSignerKey}
              onChangeText={setNewCoSignerKey}
              placeholder="Enter BIP32 public key (hex)"
              multiline
              numberOfLines={3}
              testID="cosigner-key-input"
            />

            <Button
              title={strings.setupWallet.addCoSignerButton}
              onPress={handleAddCoSigner}
              disabled={!newCoSignerName.trim() || !newCoSignerKey.trim()}
              type={ButtonType.Secondary}
              testID="add-cosigner-button"
            />
          </View>

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
          disabled={coSigners.length < 2}
          testID="continue-after-add-cosigners-button"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
