import {infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Accordion} from '../../../../../../components/Accordion/Accordion'
import {CopyButton} from '../../../../../../components/CopyButton'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {features} from '../../../../../../kernel/features'
import {isEmptyString} from '../../../../../../kernel/utils'
import {ExplorerInfoLinks} from '../../../../../ReviewTx/common/ExplorerInfoLinks'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioTokenDetailParams} from '../../../../common/hooks/useNavigateTo'
import {useStrings} from '../../../../common/hooks/useStrings'
import {TokenInfoIcon} from '../../../../common/TokenAmountItem/TokenInfoIcon'
import {TokenNews} from './TokenNews'

export const Overview = () => {
  const {styles} = useStyles()
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
  const [policyId] = tokenInfo.id.split('.')[0]

  return (
    <View style={styles.scrollView}>
      <Spacer height={8} />

      <Accordion label={strings.info} expanded={expanded} onChange={setExpanded} wrapperStyle={styles.container}>
        <View style={styles.tokenInfoContainer}>
          <TokenInfoIcon size="sm" info={tokenInfo} imageStyle={styles.tokenLogo} />

          <Text style={styles.tokenName}>{tokenSymbol}</Text>
        </View>

        <Text style={styles.textBody}>{tokenInfo.description}</Text>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>{strings.website}</Text>

          <Spacer height={4} />

          {!isEmptyString(tokenInfo.website) ? (
            <TouchableOpacity onPress={() => Linking.openURL(tokenInfo.website)}>
              <Text style={styles.linkText}>{tokenInfo.website}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.textBody}>-</Text>
          )}
        </View>

        <Spacer height={24} />

        {!isPrimaryToken(tokenInfo) && (
          <>
            <View>
              <Text style={styles.title}>{strings.policyID}</Text>

              <Spacer height={4} />

              <CopyButton title={policyId ?? '--'} value={policyId ?? ''} style={styles.copyButton} />
            </View>

            <Spacer height={24} />

            <View>
              <Text style={styles.title}>{strings.fingerprint}</Text>

              <Spacer height={4} />

              <CopyButton
                title={tokenInfo.fingerprint ?? '--'}
                value={tokenInfo.fingerprint ?? ''}
                style={styles.copyButton}
              />
            </View>

            <Spacer height={24} />
          </>
        )}

        <ExplorerInfoLinks type="token" value={tokenInfo.id} />
      </Accordion>

      <Spacer height={16} />

      {features.portfolioNews && (
        <>
          <TokenNews />

          <Spacer height={16} />
        </>
      )}
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    scrollView: {
      ...atoms.flex_1,
    },
    container: {
      ...atoms.flex_col,
      ...atoms.gap_xs,
    },
    tokenInfoContainer: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
    },
    tokenName: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_900,
    },
    tokenLogo: {
      width: 32,
      height: 32,
      ...atoms.rounded_sm,
    },
    textBody: {
      ...atoms.body_2_md_regular,
      color: color.gray_600,
    },
    linkText: {
      color: color.primary_500,
      ...atoms.link_1_lg_underline,
      ...atoms.flex_1,
    },
    title: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_900,
    },
    copyButton: {
      ...atoms.flex_1,
      ...atoms.flex_row_reverse,
      ...atoms.align_start,
      ...atoms.gap_sm,
    },
  })

  const colors = {
    label: color.gray_600,
  }

  return {styles, colors} as const
}
