import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../common/navigation'
import {Provider} from '../../common/Provider/Provider'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const ProviderSplits = () => {
  const strings = useStrings()
  const {styles, color} = useStyles()
  const [expanded, setExpanded] = React.useState(true)
  const {wallet} = useSelectedWallet()

  const navigateTo = useNavigateTo()

  const swapForm = useSwap()

  const dex = swapForm.estimate?.splits[0]?.dex

  return (
    <View>
      <View style={styles.between}>
        <View style={styles.composedText}>
          {dex !== undefined && (
            <Provider
              provider={dex}
              append={`${swapForm.selectedDex.isTouched ? '' : ` ${strings.autoPool}`}`}
              preventOpenLink
            />
          )}
        </View>

        {swapForm.orderType === 'limit' && (
          <View style={styles.changeDex}>
            <Button type={ButtonType.Text} onPress={navigateTo.selectProvider} title={strings.changePool} />
          </View>
        )}
      </View>

      {swapForm.estimate !== undefined && (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <View style={styles.between}>
              <Text style={styles.heading}>{`${strings.total}: ${swapForm.estimate?.totalInput} ${
                swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? '.unknown')?.ticker
              }`}</Text>

              <Icon.Chevron direction={expanded ? 'up' : 'down'} color={color.el_gray_max} size={24} />
            </View>
          </TouchableOpacity>

          {expanded && (
            <View style={styles.list}>
              <Row
                label={strings.swapMinAdaTitle}
                description={strings.swapMinAda}
                value={`${swapForm.estimate?.deposits} ${wallet.portfolioPrimaryTokenInfo.ticker}`}
              />

              <Row
                label={strings.swapFeesTitle}
                description={strings.swapFees}
                value={`${swapForm.estimate?.batcherFee} ${wallet.portfolioPrimaryTokenInfo.ticker}`}
              />

              <Row
                label={strings.swapMinReceivedTitle}
                description={strings.swapMinReceived}
                value={`${swapForm.estimate?.totalOutput} ${
                  swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? '.unknown')?.ticker
                }`}
              />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const Row = ({
  label,
  description,
  value,
}: {
  label: string
  description?: string
  value: number | string | React.ReactNode
}) => {
  const {styles} = useStyles()
  const {openModal} = useModal()

  return (
    <View style={styles.row}>
      <View style={styles.composedText}>
        <Text style={styles.rowLabel}>{label}</Text>

        {description !== undefined && (
          <Button
            style={styles.info}
            onPress={() => openModal({title: label, content: <Text style={styles.textContent}>{description}</Text>})}
            type={ButtonType.SecondaryText}
            icon={Icon.Info}
          />
        )}
      </View>

      {typeof value === 'string' || typeof value === 'number' ? <Text style={styles.rowValue}>{value}</Text> : value}
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    card: {
      ...atoms.p_lg,
      ...atoms.border,
      borderRadius: 8,
      borderColor: color.gray_200,
      backgroundColor: color.bg_color_max,
    },
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    changeDex: {
      ...atoms.self_center,
    },
    list: {
      ...atoms.pt_md,
      ...atoms.gap_xs,
    },
    heading: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    row: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    rowLabel: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_low,
    },
    rowValue: {
      ...atoms.body_1_lg_regular,
      ...atoms.self_center,
      color: color.text_gray_medium,
    },
    composedText: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_xs,
    },
    textContent: {
      color: color.gray_900,
      ...atoms.body_1_lg_regular,
      ...atoms.px_lg,
    },
    info: {
      ...atoms.p_0,
    },
  })

  return {styles, color}
}
