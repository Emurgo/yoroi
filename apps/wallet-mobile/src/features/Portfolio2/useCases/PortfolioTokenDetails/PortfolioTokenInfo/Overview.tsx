/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {Image, Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Accordion, CopyButton, Spacer} from '../../../../../components'
import {Logger} from '../../../../../legacy/logging'
import {useGetPortfolioTokenInfo} from '../../../common/useGetPortfolioTokenInfo'
import {usePortfolioTokenDetailParams} from '../../../common/useNavigationTo'

export const Overview = () => {
  const {styles} = useStyles()
  const {name: tokenName} = usePortfolioTokenDetailParams()
  const {data} = useGetPortfolioTokenInfo(tokenName)
  const [expanded, setExpanded] = useState(true)

  const handleOpenLink = async (url?: string) => {
    if (url == null) return
    try {
      await Linking.canOpenURL(url)
      await Linking.openURL(url)
    } catch (e: any) {
      Logger.error(e)
    }
  }

  return (
    <View style={styles.root}>
      <Accordion label="Info" expanded={expanded} onChange={setExpanded} wrapperStyle={styles.container}>
        <View style={styles.tokenInfoContainer}>
          {data?.logo != null ? (
            <Image source={typeof data?.logo === 'string' ? {uri: data.logo} : data.logo} style={styles.tokenLogo} />
          ) : null}

          <Text style={styles?.tokenName}>{data?.name}</Text>
        </View>

        <Text style={styles.textBody}>{data?.amount?.info?.description}</Text>

        <TouchableOpacity onPress={() => handleOpenLink(data?.amount?.info?.website)}>
          <Text style={styles.link}>{data?.amount?.info?.website}</Text>
        </TouchableOpacity>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>Website</Text>

          <Spacer height={4} />

          <Text style={styles.textBody}>-</Text>
        </View>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>Policy ID</Text>

          <Spacer height={4} />

          <CopyButton value={data?.info?.policyId ?? ''} style={styles.copyButton}>
            <Text style={styles.copyText}>{data?.info?.policyId ?? ''}</Text>
          </CopyButton>
        </View>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>Fingerprint</Text>

          <Spacer height={4} />

          <CopyButton value={data?.amount?.info?.fingerprint ?? ''} style={styles.copyButton}>
            <Text style={styles.copyText}>{data?.amount?.info?.fingerprint}</Text>
          </CopyButton>
        </View>

        <Spacer height={24} />

        <View>
          <Text style={styles.title}>Details on</Text>

          <Spacer height={4} />

          <View style={styles.linkGroup}>
            <TouchableOpacity onPress={() => handleOpenLink(data?.amount?.info?.website)}>
              <Text style={styles.link}>Cardanoscan</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleOpenLink(data?.amount?.info?.website)}>
              <Text style={styles.link}>Adaex</Text>
            </TouchableOpacity>
          </View>

          <Spacer height={16} />

          <View style={styles.divider} />
        </View>
      </Accordion>

      <Spacer height={200} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.flex_col,
      backgroundColor: color.gray_cmin,
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
