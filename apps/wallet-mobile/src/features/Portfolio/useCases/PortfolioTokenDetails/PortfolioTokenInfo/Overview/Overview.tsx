import {infoExtractName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Accordion} from '../../../../../../components/Accordion/Accordion'
import {CopyButton} from '../../../../../../components/CopyButton'
import {Spacer} from '../../../../../../components/Spacer/Spacer'
import {features} from '../../../../../../kernel/features'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioTokenDetailParams} from '../../../../common/hooks/useNavigateTo'
import {useStrings} from '../../../../common/hooks/useStrings'
import {TokenInfoIcon} from '../../../../common/TokenAmountItem/TokenInfoIcon'
import {TokenNews} from './TokenNews'

export const Overview = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const {
    wallet: {balances, networkManager},
  } = useSelectedWallet()
  const explorers = networkManager.explorers
  const tokenInfo = balances.records.get(tokenId)
  const tokenSymbol = tokenInfo ? infoExtractName(tokenInfo.info, {mode: 'currency'}) : ''
  const [policyId] = tokenInfo?.info.id.split('.') ?? []

  const [expanded, setExpanded] = useState(true)

  const handleOpenLink = async (direction: 'cardanoscan' | 'adaex') => {
    if (tokenInfo == null) return
    if (direction === 'cardanoscan') {
      await Linking.openURL(explorers.cardanoscan.token(tokenInfo.info.id))
    } else {
      await Linking.openURL(explorers.cexplorer.token(tokenInfo.info.id))
    }
  }

  if (!tokenInfo) return null

  return (
    <View style={styles.scrollView}>
      <Spacer height={8} />

      <Accordion label={strings.info} expanded={expanded} onChange={setExpanded} wrapperStyle={styles.container}>
        <View style={styles.tokenInfoContainer}>
          <TokenInfoIcon size="sm" info={tokenInfo.info} imageStyle={styles.tokenLogo} />

          <Text style={styles?.tokenName}>{tokenSymbol}</Text>
        </View>

        <Text style={styles.textBody}>{tokenInfo.info?.description}</Text>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>{strings.website}</Text>

          <Spacer height={4} />

          <Text style={styles.textBody}>{tokenInfo.info?.website ?? '-'}</Text>
        </View>

        <Spacer height={24} />

        {!isPrimaryToken(tokenInfo.info) && (
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
                title={tokenInfo.info?.fingerprint ?? '--'}
                value={tokenInfo.info?.fingerprint ?? ''}
                style={styles.copyButton}
              />
            </View>

            <Spacer height={24} />
          </>
        )}

        <View>
          <Text style={styles.title}>{strings.detailsOn}</Text>

          <Spacer height={4} />

          <View style={styles.linkGroup}>
            <TouchableOpacity onPress={() => handleOpenLink('cardanoscan')}>
              <Text style={styles.link}>Cardanoscan</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleOpenLink('adaex')}>
              <Text style={styles.link}>Adaex</Text>
            </TouchableOpacity>
          </View>

          <Spacer height={16} />
        </View>
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
    link: {
      ...atoms.link_1_lg,
      color: color.text_primary_medium,
    },
    linkGroup: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.gap_lg,
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
