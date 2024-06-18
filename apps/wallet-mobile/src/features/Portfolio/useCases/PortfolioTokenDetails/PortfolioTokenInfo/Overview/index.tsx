import {useExplorers} from '@yoroi/explorers'
import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Accordion, CopyButton, Spacer} from '../../../../../../components'
import {useSelectedWallet} from '../../../../../WalletManager/context/SelectedWalletContext'
import {TokenInfoIcon} from '../../../../common/TokenAmountItem/TokenInfoIcon'
import {usePortfolioTokenDetailParams} from '../../../../common/useNavigateTo'
import {useStrings} from '../../../../common/useStrings'
import {TokenNews} from './TokenNews'

export const Overview = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {id: tokenId} = usePortfolioTokenDetailParams()
  const wallet = useSelectedWallet()
  const explorers = useExplorers(wallet.network)
  const {balances} = wallet
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

  return (
    <View style={styles.scrollView}>
      <Spacer height={8} />

      <Accordion label={strings.info} expanded={expanded} onChange={setExpanded} wrapperStyle={styles.container}>
        <View style={styles.tokenInfoContainer}>
          {tokenInfo?.info ? <TokenInfoIcon info={tokenInfo?.info} imageStyle={styles.tokenLogo} /> : null}

          <Text style={styles?.tokenName}>{tokenSymbol}</Text>
        </View>

        <Text style={styles.textBody}>{tokenInfo?.info?.description}</Text>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>{strings.website}</Text>

          <Spacer height={4} />

          <Text style={styles.textBody}>{tokenInfo?.info?.website ?? '-'}</Text>
        </View>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>{strings.policyID}</Text>

          <Spacer height={4} />

          <CopyButton value={policyId ?? ''} style={styles.copyButton}>
            <Text style={styles.copyText}>{policyId ?? ''}</Text>
          </CopyButton>
        </View>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>{strings.fingerprint}</Text>

          <Spacer height={4} />

          <CopyButton value={tokenInfo?.info?.fingerprint ?? ''} style={styles.copyButton}>
            <Text style={styles.copyText}>{tokenInfo?.info?.fingerprint}</Text>
          </CopyButton>
        </View>

        <Spacer height={24} />

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

          <View style={styles.divider} />

          <Spacer height={16} />

          <TokenNews />

          <Spacer height={16} />
        </View>
      </Accordion>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    scrollView: {
      ...atoms.px_lg,
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
      color: color.gray_c900,
    },
    tokenLogo: {
      width: 32,
      height: 32,
      resizeMode: 'cover',
      ...atoms.rounded_sm,
    },
    textBody: {
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
    },
    link: {
      ...atoms.link_1_lg_underline,
      color: color.primary_c500,
    },
    linkGroup: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.gap_lg,
    },
    title: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
      color: color.gray_c900,
    },
    divider: {
      ...atoms.flex_1,
      height: 1,
      backgroundColor: color.gray_c200,
    },
    copyButton: {
      ...atoms.flex_1,
      ...atoms.flex_row_reverse,
      ...atoms.align_start,
      ...atoms.gap_sm,
    },
    copyText: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.gray_c600,
    },
  })

  const colors = {
    label: color.gray_c600,
  }

  return {styles, colors} as const
}
