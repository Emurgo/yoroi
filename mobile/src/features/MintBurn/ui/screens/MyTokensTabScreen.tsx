import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView, TouchableOpacity, View} from 'react-native'

import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

import {useBurnTransaction} from '../../common/hooks/useBurnTransaction'
import {useMintedTokens} from '../../common/hooks/useMintedTokens'

export const MyTokensTabScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {mintedTokens, isLoading: isLoadingTokens} = useMintedTokens({
    wallet,
    addressMode: meta.addressMode,
  })
  const {burn, isLoading: isBurning} = useBurnTransaction({
    wallet,
    addressMode: meta.addressMode,
  })

  const [selectedToken, setSelectedToken] = React.useState<string | null>(null)
  const [burnQuantity, setBurnQuantity] = React.useState('')

  const handleBurn = React.useCallback(
    async (tokenId: string) => {
      const token = mintedTokens.find((t) => t.tokenId === tokenId)
      if (!token) return

      const quantity = burnQuantity || token.quantity
      await burn(token, quantity)
      setSelectedToken(null)
      setBurnQuantity('')
    },
    [mintedTokens, burnQuantity, burn],
  )

  if (isLoadingTokens) {
    return (
      <SafeArea>
        <View style={[a.flex_1, a.justify_center, a.align_center]}>
          <Text style={[a.body_1_lg_medium, {color: p.gray_600}]}>
            Loading tokens...
          </Text>
        </View>
      </SafeArea>
    )
  }

  if (mintedTokens.length === 0) {
    return (
      <SafeArea>
        <View style={[a.flex_1, a.justify_center, a.align_center, a.px_lg]}>
          <Text style={[a.body_1_lg_medium, {color: p.gray_600}]}>
            {strings.mintBurn.myTokens.noTokens}
          </Text>
        </View>
      </SafeArea>
    )
  }

  return (
    <SafeArea>
      <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
        <Space.Height.lg />

        {mintedTokens.map((token) => (
          <View key={token.tokenId} style={{marginBottom: 16}}>
            <TouchableOpacity
              onPress={() => {
                setSelectedToken(
                  selectedToken === token.tokenId ? null : token.tokenId,
                )
                setBurnQuantity('')
              }}
              style={[
                a.p_md,
                {
                  backgroundColor: p.gray_50,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    selectedToken === token.tokenId
                      ? p.primary_600
                      : p.gray_200,
                },
              ]}
            >
              <View style={[a.flex_row, a.justify_between, a.align_center]}>
                <View style={[a.flex_1]}>
                  <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
                    {token.assetName}
                  </Text>
                  <Space.Height.xs />
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {strings.mintBurn.myTokens.policyId}:{' '}
                    {token.policyId.slice(0, 16)}...
                  </Text>
                  <Space.Height.xs />
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {strings.mintBurn.myTokens.quantity}: {token.quantity}
                  </Text>
                  {token.isMintedByMe && (
                    <>
                      <Space.Height.xs />
                      <Text
                        style={[a.body_2_md_regular, {color: p.primary_600}]}
                      >
                        Minted by me
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {selectedToken === token.tokenId && token.isMintedByMe && (
              <View
                style={[
                  a.p_md,
                  {marginTop: 16, backgroundColor: p.gray_50, borderRadius: 8},
                ]}
              >
                <Text style={[a.body_2_md_medium, {color: p.gray_max}]}>
                  {strings.mintBurn.myTokens.burnQuantity}
                </Text>
                <Space.Height.sm />
                <TextInput
                  value={burnQuantity}
                  onChangeText={setBurnQuantity}
                  placeholder={token.quantity}
                  keyboardType="numeric"
                />
                <Space.Height.md />
                <Button
                  title={
                    isBurning
                      ? strings.mintBurn.myTokens.burning
                      : strings.mintBurn.myTokens.burn
                  }
                  onPress={() => handleBurn(token.tokenId)}
                  disabled={isBurning}
                  isLoading={isBurning}
                  type={ButtonType.Critical}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeArea>
  )
}
