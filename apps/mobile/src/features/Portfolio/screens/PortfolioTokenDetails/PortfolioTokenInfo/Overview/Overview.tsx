import {infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {Linking, Text, TouchableOpacity, View} from 'react-native'

import {usePortfolioTokenDetailParams} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {Accordion} from '~/features/ReviewTx/common/Accordion'
import {ExplorerInfoLinks} from '~/features/ReviewTx/common/ExplorerInfoLinks'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {features} from '~/kernel/features'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Space} from '~/ui/Space/Space'
import {TokenInfoIcon} from '~/ui/TokenInfoIcon/TokenInfoIcon'
import {isEmptyString} from '~/wallets/utils/utils'
import {TokenNews} from './TokenNews'

export const Overview = () => {
  const {atoms: ta, palette: p} = useTheme()
  const strings = useStrings()
  const [expanded, setExpanded] = useState(true)
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {
    wallet: {balances},
  } = useSelectedWallet()
  const tokenAmount = balances.records.get(tokenId)
  const tokenInfo = tokenAmount?.info
  if (!tokenInfo) return null

  const tokenSymbol = infoExtractName(tokenInfo, {mode: 'currency'})
  const [policyId] = tokenInfo.id.split('.')

  return (
    <View style={[a.flex_1]}>
      <Space.Height.sm />

      <Accordion
        label={strings.info}
        expanded={expanded}
        onChange={setExpanded}
        wrapperStyle={[a.flex_col, a.gap_xs]}
      >
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <TokenInfoIcon
            size="sm"
            info={tokenInfo}
            imageStyle={[{width: 32, height: 32}, a.rounded_sm]}
          />

          <Text
            style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_900}]}
          >
            {tokenSymbol}
          </Text>
        </View>

        <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
          {tokenInfo.description}
        </Text>

        <Space.Height.lg />

        <View>
          <Text
            style={[a.body_1_lg_medium, a.font_semibold, {color: p.gray_900}]}
          >
            {strings.website}
          </Text>

          <Space.Height._2xs />

          {!isEmptyString(tokenInfo.website) ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(tokenInfo.website)}
            >
              <Text
                style={[
                  {color: p.primary_500},
                  a.link_1_lg_underline,
                  a.flex_1,
                ]}
              >
                {tokenInfo.website}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>-</Text>
          )}
        </View>

        <Space.Height.lg />

        {!isPrimaryToken(tokenInfo) && (
          <>
            <View>
              <Text
                style={[
                  a.body_1_lg_medium,
                  a.font_semibold,
                  {color: p.gray_900},
                ]}
              >
                {strings.policyID}
              </Text>

              <Space.Height._2xs />

              <View
                style={[a.flex_row, a.gap_sm, a.justify_between, a.align_start]}
              >
                <Copiable text={policyId ?? ''}>
                  <Text
                    style={[
                      a.body_2_md_regular,
                      {color: p.text_gray_max},
                      a.flex_shrink,
                    ]}
                  >
                    {policyId ?? '--'}
                  </Text>
                </Copiable>
              </View>
            </View>

            <Space.Height.lg />

            <View>
              <Text
                style={[
                  a.body_1_lg_medium,
                  a.font_semibold,
                  {color: p.gray_900},
                ]}
              >
                {strings.fingerprint}
              </Text>

              <Space.Height._2xs />

              <Copiable text={tokenInfo.fingerprint ?? ''}>
                <Text
                  style={[
                    a.body_2_md_regular,
                    {color: p.text_gray_max},
                    a.flex_shrink,
                  ]}
                >
                  {tokenInfo.fingerprint ?? '--'}
                </Text>
              </Copiable>
            </View>

            <Space.Height.lg />
          </>
        )}

        <ExplorerInfoLinks type="token" value={tokenInfo.id} />
      </Accordion>

      <Space.Height.md />

      {features.portfolioNews && (
        <>
          <TokenNews />

          <Space.Height.md />
        </>
      )}
    </View>
  )
}
