import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'

import * as React from 'react'
import {ScrollView, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

import {useMintTransaction} from '../../common/hooks/useMintTransaction'
import type {MintFormData, TokenType} from '../../common/types'
import {
  validateBase64Image,
  validateImageUrl,
} from '../../common/utils/imageUtils'

export const MintTabScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {mint, isLoading, error} = useMintTransaction({
    wallet,
    addressMode: meta.addressMode,
  })

  const [tokenType, setTokenType] = React.useState<TokenType>('ft')
  const [formData, setFormData] = React.useState<MintFormData>({
    tokenType: 'ft',
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = React.useCallback(async () => {
    const newErrors: Record<string, string> = {}

    if (tokenType === 'ft') {
      if (!formData.tokenName) {
        newErrors.tokenName = strings.mintBurn.errors.missingFields
      }
      if (!formData.quantity) {
        newErrors.quantity = strings.mintBurn.errors.missingFields
      } else if (parseFloat(formData.quantity) <= 0) {
        newErrors.quantity = strings.mintBurn.errors.invalidQuantity
      }
      if (!formData.decimals) {
        newErrors.decimals = strings.mintBurn.errors.missingFields
      } else {
        const decimals = parseInt(formData.decimals, 10)
        if (isNaN(decimals) || decimals < 0 || decimals > 19) {
          newErrors.decimals = strings.mintBurn.errors.invalidDecimals
        }
      }
      if (!formData.imageBase64) {
        newErrors.imageBase64 = strings.mintBurn.errors.missingFields
      } else {
        const imageValidation = validateBase64Image(formData.imageBase64)
        if (!imageValidation.valid) {
          newErrors.imageBase64 =
            imageValidation.error || strings.mintBurn.errors.invalidImage
        }
      }
    } else {
      if (!formData.assetName) {
        newErrors.assetName = strings.mintBurn.errors.missingFields
      }
      if (!formData.name) {
        newErrors.name = strings.mintBurn.errors.missingFields
      }
      if (!formData.imageUrl) {
        newErrors.imageUrl = strings.mintBurn.errors.missingFields
      } else {
        const imageValidation = validateImageUrl(formData.imageUrl)
        if (!imageValidation.valid) {
          newErrors.imageUrl =
            imageValidation.error || strings.mintBurn.errors.invalidUrl
        }
      }
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    await mint({...formData, tokenType})
  }, [tokenType, formData, mint, strings])

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
        <Space.Height.lg />

        {/* Token Type Selector */}
        <View style={[a.flex_row, a.align_center, a.gap_2xs]}>
          <Button
            onPress={() => {
              setTokenType('ft')
              setFormData({tokenType: 'ft'})
              setErrors({})
            }}
            type={ButtonType.SecondaryText}
            title={strings.mintBurn.mint.tokenTypeFt}
            size="M"
            fontOverride={a.body_1_lg_medium}
            {...(tokenType === 'ft' && {
              style: [{backgroundColor: p.gray_100}],
            })}
          />
          <Button
            onPress={() => {
              setTokenType('nft')
              setFormData({tokenType: 'nft'})
              setErrors({})
            }}
            type={ButtonType.SecondaryText}
            title={strings.mintBurn.mint.tokenTypeNft}
            size="M"
            fontOverride={a.body_1_lg_medium}
            {...(tokenType === 'nft' && {
              style: [{backgroundColor: p.gray_100}],
            })}
          />
        </View>

        <Space.Height.lg />

        {tokenType === 'ft' ? (
          <>
            <TextInput
              value={formData.tokenName || ''}
              onChangeText={(text) =>
                setFormData({...formData, tokenName: text})
              }
              label={strings.mintBurn.mint.ft.tokenName}
              placeholder={strings.mintBurn.mint.ft.tokenNamePlaceholder}
              error={!!errors.tokenName}
              errorText={errors.tokenName}
            />

            <Space.Height.sm />

            <TextInput
              value={formData.quantity || ''}
              onChangeText={(text) =>
                setFormData({...formData, quantity: text})
              }
              label={strings.mintBurn.mint.ft.quantity}
              placeholder={strings.mintBurn.mint.ft.quantityPlaceholder}
              keyboardType="numeric"
              error={!!errors.quantity}
              errorText={errors.quantity}
            />

            <Space.Height.sm />

            <TextInput
              value={formData.decimals || ''}
              onChangeText={(text) =>
                setFormData({...formData, decimals: text})
              }
              label={strings.mintBurn.mint.ft.decimals}
              placeholder={strings.mintBurn.mint.ft.decimalsPlaceholder}
              keyboardType="numeric"
              error={!!errors.decimals}
              errorText={errors.decimals}
            />

            <Space.Height.sm />

            <TextInput
              value={formData.imageBase64 || ''}
              onChangeText={(text) =>
                setFormData({...formData, imageBase64: text})
              }
              label={strings.mintBurn.mint.ft.image}
              placeholder="data:image/png;base64,..."
              multiline
              error={!!errors.imageBase64}
              errorText={errors.imageBase64}
              helper={
                <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                  Paste base64 image data URI (64x64 recommended)
                </Text>
              }
            />

            <Space.Height.sm />

            <TextInput
              value={formData.description || ''}
              onChangeText={(text) =>
                setFormData({...formData, description: text})
              }
              label={strings.mintBurn.mint.ft.description}
              placeholder={strings.mintBurn.mint.ft.descriptionPlaceholder}
              multiline
            />
          </>
        ) : (
          <>
            <TextInput
              value={formData.assetName || ''}
              onChangeText={(text) =>
                setFormData({...formData, assetName: text})
              }
              label={strings.mintBurn.mint.nft.assetName}
              placeholder={strings.mintBurn.mint.nft.assetNamePlaceholder}
              error={!!errors.assetName}
              errorText={errors.assetName}
            />

            <Space.Height.sm />

            <TextInput
              value={formData.name || ''}
              onChangeText={(text) => setFormData({...formData, name: text})}
              label={strings.mintBurn.mint.nft.name}
              placeholder={strings.mintBurn.mint.nft.namePlaceholder}
              error={!!errors.name}
              errorText={errors.name}
            />

            <Space.Height.sm />

            <TextInput
              value={formData.imageUrl || ''}
              onChangeText={(text) =>
                setFormData({...formData, imageUrl: text})
              }
              label={strings.mintBurn.mint.nft.imageUrl}
              placeholder={strings.mintBurn.mint.nft.imageUrlPlaceholder}
              error={!!errors.imageUrl}
              errorText={errors.imageUrl}
            />

            <Space.Height.sm />

            <TextInput
              value={formData.description || ''}
              onChangeText={(text) =>
                setFormData({...formData, description: text})
              }
              label={strings.mintBurn.mint.nft.description}
              placeholder={strings.mintBurn.mint.nft.descriptionPlaceholder}
              multiline
            />
          </>
        )}

        {error && (
          <>
            <Space.Height.sm />
            <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
              {error.message}
            </Text>
          </>
        )}
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title={
            isLoading
              ? strings.mintBurn.mint.submitting
              : strings.mintBurn.mint.submit
          }
          onPress={handleSubmit}
          disabled={isLoading}
          isLoading={isLoading}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
