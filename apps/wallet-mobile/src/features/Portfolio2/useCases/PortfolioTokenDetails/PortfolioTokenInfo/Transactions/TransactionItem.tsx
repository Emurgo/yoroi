/* eslint-disable react-native/no-raw-text */
import {isNonNullable} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React, {useMemo} from 'react'
import {type FormatDateOptions, useIntl} from 'react-intl'
import {StyleSheet, Text, View} from 'react-native'

import {Icon} from '../../../../../../components/Icon'
import {type ITokenTransaction, TokenTransactionDirection} from '../../../../common/useGetPortfolioTokenTransaction'
import {formatDateRelative, formatTime} from './../../../../../../legacy/format'

interface Props {
  tx: ITokenTransaction
  tokenName: string
}

const hideAssetDirections: TokenTransactionDirection[] = ['STAKE_DELEGATED', 'STAKE_REWARD']

export const TransactionItem = ({tx, tokenName}: Props) => {
  const {styles, colors} = useStyles()
  const intl = useIntl()

  const submittedAt = useMemo(() => {
    const formatOption: FormatDateOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
    return isNonNullable(tx.submittedAt)
      ? `${formatDateRelative(tx.submittedAt, intl, formatOption) + ' | ' + formatTime(tx.submittedAt, intl)}`
      : ''
  }, [tx.submittedAt, intl])

  const {icon, label, color, backgroundColor} = useMemo(() => {
    switch (tx.direction) {
      case 'RECEIVED':
        return {
          label: 'Received',
          icon: <Icon.CrossCircle size={24} color={colors.success} />,
          color: colors.success,
          backgroundColor: colors.successLight,
        }
      case 'STAKE_REWARD':
        return {
          label: 'Staking Reward',
          icon: <Icon.Received size={24} color={colors.success} />,
          color: colors.success,
          backgroundColor: colors.successLight,
        }
      case 'SENT':
        return {
          label: 'Sent',
          icon: <Icon.Send size={24} color={colors.info} />,
          color: colors.info,
          backgroundColor: colors.infoLight,
        }
      case 'STAKE_DELEGATED':
        return {
          label: 'Stake delegated',
          icon: <Icon.Staking size={24} color={colors.info} />,
          color: colors.info,
          backgroundColor: colors.infoLight,
        }
      case 'FAILED':
        return {
          label: 'Failed',
          icon: <Icon.CrossCircle size={24}color={colors.danger} />,
          color: colors.danger,
          backgroundColor: colors.dangerLight,
        }
      default:
        return {
          label: 'Unknown',
          icon: <Icon.InfoCircle size={24}color={colors.info} />,
          color: colors.info,
          backgroundColor: colors.infoLight,
        }
    }
  }, [tx.direction, colors])

  return (
    <View style={styles.root}>
      <View style={styles.leftContainer}>
        <View style={[styles.iconWrapper, {backgroundColor}]}>{icon}</View>

        <View style={styles.labelGroup}>
          <Text style={[styles.label, {color}]}>{label}</Text>

          <Text style={styles.dateLabel}>{submittedAt}</Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        <Text style={styles.amountText}>{`${tx.amount} ${tokenName}`}</Text>

        {hideAssetDirections.includes(tx.direction) ? null : <Text style={styles.assetText}>{tx.asset} assets</Text>}
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
      backgroundColor: color.gray_cmin,
    },
    leftContainer: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.justify_start,
      ...atoms.align_center,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 40,
      padding: 12,
      gap: 10,
    },
    labelGroup: {
      ...atoms.flex_1,
      ...atoms.pl_md,
      ...atoms.gap_xs,
    },
    label: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
    },
    dateLabel: {
      ...atoms.body_3_sm_regular,
      color: color.gray_c500,
    },

    rightContainer: {
      ...atoms.flex_col,
    },
    amountText: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
      ...atoms.text_right,
      color: color.gray_c900,
    },
    assetText: {
      ...atoms.body_3_sm_regular,
      ...atoms.text_right,
      color: color.gray_c900,
    },
  })

  const colors = {
    success: color.secondary_c600,
    successLight: color.secondary_c100,
    info: color.primary_c600,
    infoLight: color.primary_c100,
    danger: color.sys_magenta_c500,
    dangerLight: color.sys_magenta_c100,
  }

  return {styles, colors} as const
}
