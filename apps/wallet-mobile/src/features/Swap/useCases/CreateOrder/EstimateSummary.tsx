import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {undefinedToken} from '../../common/constants'
import {useNavigateTo} from '../../common/navigation'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

export const EstimateSummary = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const swapForm = useSwap()

  const protocol = swapForm.estimate?.splits[0]?.protocol
  const originSelection = `${swapForm.selectedProtocol.isTouched ? '' : ` ${strings.autoPool}`}`

  return (
    <View>
      <View style={styles.between}>
        {swapForm.orderType === 'limit' && (
          <View style={styles.changeDex}>
            <Button type={ButtonType.Text} onPress={navigateTo.selectProvider} title={strings.changePool} />
          </View>
        )}
      </View>

      {swapForm.estimate !== undefined && (
        <View style={styles.list}>
          <View style={styles.composedText}>
            {protocol !== undefined && <ProtocolAvatar protocol={protocol} append={originSelection} preventOpenLink />}
          </View>

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
              swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken)?.ticker
            }`}
          />
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
    between: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    changeDex: {
      ...atoms.self_center,
    },
    list: {
      ...atoms.pt_md,
      ...atoms.gap_2xs,
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
