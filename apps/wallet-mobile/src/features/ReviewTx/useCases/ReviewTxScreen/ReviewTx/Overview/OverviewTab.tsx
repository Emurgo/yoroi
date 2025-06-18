import {CredKind} from '@emurgo/cross-csl-core'
import {parseBoolean, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useTheme} from '@yoroi/theme'
import {Balance, Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import * as React from 'react'
import {Linking, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'
import {useQuery} from 'react-query'

import {Button} from '../../../../../../components/Button/Button'
import {Copiable} from '../../../../../../components/Clipboard/Copiable'
import {Divider} from '../../../../../../components/Divider/Divider'
import {Icon} from '../../../../../../components/Icon'
import {InfoBanner} from '../../../../../../components/InfoBanner/InfoBanner'
import {useModal} from '../../../../../../components/Modal/ModalContext'
import {Space} from '../../../../../../components/Space/Space'
import {WarningBanner} from '../../../../../../components/WarningBanner/WarningBanner'
import {formatTokenWithText} from '../../../../../../yoroi-wallets/utils/format'
import {Quantities} from '../../../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../../WalletManager/context/WalletManagerProvider'
import {Accordion} from '../../../../common/Accordion'
import {useStrings} from '../../../../common/hooks/useStrings'
import {Operations, useOperations} from '../../../../common/operations'
import {TokenItem} from '../../../../common/TokenItem'
import {FormattedOutput, FormattedOutputs, FormattedTx} from '../../../../common/types'
import {WalletBalance} from '../../../../common/WalletBalance'
import {OperationsNoticeIcon} from '../../../../illustrations/OperationsNoticeIcon'

export const OverviewTab = ({
  tx,
  extraOperations,
  operationsNotice,
  receiverCustomTitle,
  details,
  createdBy,
}: {
  tx: FormattedTx
  extraOperations?: Array<React.ReactNode>
  operationsNotice?: React.ReactNode
  receiverCustomTitle?: React.ReactNode
  details?: {title: string; component: React.ReactNode}
  createdBy?: React.ReactNode
}) => {
  const {styles} = useStyles()
  const operations = useOperations(tx.certificates)
  const strings = useStrings()
  useShowOperationsNotice(operations)

  const notOwnedOutputs = React.useMemo(() => tx.outputs.filter((output) => !output.ownAddress), [tx.outputs])
  const ownedOutputs = React.useMemo(() => tx.outputs.filter((output) => output.ownAddress), [tx.outputs])
  const operationsComponentsDuplicated = React.useMemo(
    () => operations.components.find((component) => component.duplicated),
    [operations.components],
  )

  return (
    <View style={styles.root}>
      <Space height="lg" />

      {operationsComponentsDuplicated && (
        <>
          <WarningBanner title={strings.operationsLogWarningTitle} content={strings.operationsLogWarningText} />

          <Space height="lg" />
        </>
      )}

      <WalletInfoSection tx={tx} createdBy={createdBy} />

      <Divider verticalSpace="lg" />

      <MyWalletSection
        tx={tx}
        notOwnedOutputs={notOwnedOutputs}
        ownedOutputs={ownedOutputs}
        receiverCustomTitle={receiverCustomTitle}
        operationsFee={operations.totalFee}
      />

      {notOwnedOutputs.length === 1 && (
        <OneExternalPartySection receiverCustomTitle={receiverCustomTitle} output={notOwnedOutputs[0]} />
      )}

      {notOwnedOutputs.length > 1 && <MultiExternalPartiesSection outputs={notOwnedOutputs} />}

      <OperationsSection
        operations={operations}
        extraOperations={extraOperations}
        operationsNotice={operationsNotice}
      />

      <Details details={details} />
    </View>
  )
}

const WalletInfoSection = ({tx, createdBy}: {tx: FormattedTx; createdBy?: React.ReactNode}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const {plate, seed} = walletManager.checksum(wallet.publicKeyHex)
  const seedImage = new Blockies({seed}).asBase64()
  const {height: windowHeight} = useWindowDimensions()

  const handleShowWalletBalance = () => {
    openModal({
      title: strings.walletBalanceTitle,
      content: <WalletBalance image={seedImage} plate={plate} name={meta.name} />,
      height: windowHeight * 0.8,
    })
  }

  return (
    <>
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>{strings.walletLabel}</Text>

        <View style={styles.plate}>
          <Icon.WalletAvatar image={seedImage} style={styles.walletChecksum} size={24} />

          <Space width="sm" />

          <TouchableOpacity activeOpacity={0.5} onPress={handleShowWalletBalance}>
            <Text style={styles.walletInfoText}>{`${plate} | ${meta.name}`}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Space height="sm" />

      {createdBy != null && (
        <>
          {createdBy}

          <Space height="sm" />
        </>
      )}

      <FeeInfoItem fee={formatTokenWithText(tx.fee.quantity, wallet.portfolioPrimaryTokenInfo)} />
    </>
  )
}

const FeeInfoItem = ({fee}: {fee: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{strings.feeLabel}</Text>

      <Text style={styles.fee}>{`-${fee}`}</Text>
    </View>
  )
}

const MyWalletSection = ({
  tx,
  notOwnedOutputs,
  ownedOutputs,
  operationsFee,
}: {
  tx: FormattedTx
  notOwnedOutputs: FormattedOutputs
  ownedOutputs: FormattedOutputs
  receiverCustomTitle?: React.ReactNode
  operationsFee: Balance.Quantity
}) => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const address = ownedOutputs[0]?.rewardAddress ?? ownedOutputs[0]?.address ?? '-'

  return (
    <Accordion label={strings.myWalletLabel}>
      <Space height="lg" />

      <Copiable text={address}>
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
          {address}
        </Text>

        {ownedOutputs[0]?.addressKind === CredKind.Script && (
          <>
            <Space width="xs" />

            <Icon.DigitalAsset size={24} color={colors.icon} />
          </>
        )}
      </Copiable>

      <Space height="sm" />

      <MyWalletTokens tx={tx} notOwnedOutputs={notOwnedOutputs} operationsFee={operationsFee} />
    </Accordion>
  )
}

const MyWalletTokens = ({
  tx,
  notOwnedOutputs,
  operationsFee,
}: {
  tx: FormattedTx
  notOwnedOutputs: FormattedOutputs
  operationsFee: Balance.Quantity
}) => {
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()

  const totalPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs
        .flatMap((output) => output.assets.filter((asset) => asset.tokenInfo.nature === Portfolio.Token.Nature.Primary))
        .reduce((previous, current) => Quantities.sum([previous, current.quantity]), Quantities.zero),
    [notOwnedOutputs],
  )
  const totalPrimaryTokenSpent = React.useMemo(
    () => Quantities.sum([totalPrimaryTokenSent, tx.fee.quantity, operationsFee]),
    [totalPrimaryTokenSent, tx.fee.quantity, operationsFee],
  )
  const totalPrimaryTokenSpentLabel = formatTokenWithText(totalPrimaryTokenSpent, wallet.portfolioPrimaryTokenInfo)

  const notPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs.flatMap((output) =>
        output.assets.filter((asset) => asset.tokenInfo.nature !== Portfolio.Token.Nature.Primary),
      ),
    [notOwnedOutputs],
  )

  return (
    <View style={styles.tokensSection}>
      <View style={styles.tokenItems}>
        <MyWalletSectionLabel />

        <Space fill />

        <TokenItem tokenInfo={wallet.portfolioPrimaryTokenInfo} label={`-${totalPrimaryTokenSpentLabel}`} />

        {notPrimaryTokenSent.map((token, index) => (
          <TokenItem
            key={index}
            tokenInfo={token.tokenInfo}
            label={formatTokenWithText(token.quantity, token.tokenInfo)}
            isPrimaryToken={false}
          />
        ))}
      </View>
    </View>
  )
}

const MyWalletSectionLabel = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.tokensSectionLabel}>
      <Icon.Send size={30} color={colors.send} />

      <Space width="_2xs" />

      <Text style={styles.tokenSectionLabel}>{strings.sendLabel}</Text>
    </View>
  )
}

const OneExternalPartySection = ({
  output,
  receiverCustomTitle,
}: {
  output: FormattedOutput
  receiverCustomTitle?: React.ReactNode
}) => {
  const address = output?.rewardAddress ?? output?.address ?? '-'
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <>
      <Space height="sm" />

      <View style={styles.externalPartyAddress}>
        <Text style={styles.externalPartyAddressText}>{strings.receiveToLabel}:</Text>

        {receiverCustomTitle ?? (
          <Copiable text={address}>
            <Text
              style={[styles.addressText, styles.externalPartiesSectionAddress]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {address}
            </Text>

            {output?.addressKind === CredKind.Script && (
              <>
                <Space width="xs" />

                <Icon.DigitalAsset size={24} color={colors.icon} />
              </>
            )}
          </Copiable>
        )}
      </View>
    </>
  )
}

const MultiExternalPartiesSection = ({outputs}: {outputs: FormattedOutputs}) => {
  const {styles, colors} = useStyles()
  const {wallet} = useSelectedWallet()
  const strings = useStrings()

  const receivers = outputs.map((output, index) => {
    const totalPrimaryToken =
      output.assets.filter((asset) => asset.tokenInfo.nature === Portfolio.Token.Nature.Primary)[0]?.quantity ??
      Quantities.zero
    const totalPrimaryTokenLabel = formatTokenWithText(totalPrimaryToken, wallet.portfolioPrimaryTokenInfo)
    const notPrimaryToken = output.assets.filter((asset) => asset.tokenInfo.nature !== Portfolio.Token.Nature.Primary)
    const address = output?.rewardAddress ?? output?.address ?? '-'

    return (
      <View key={index}>
        <Space height="lg" />

        <Copiable text={address}>
          <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
            {address}
          </Text>

          {output?.addressKind === CredKind.Script && (
            <>
              <Space width="xs" />

              <Icon.DigitalAsset size={24} color={colors.icon} />
            </>
          )}
        </Copiable>

        <Space height="sm" />

        <View style={styles.tokensSection}>
          <View style={styles.tokenItems}>
            <ExternalPartiesSectionLabel />

            <Space fill />

            <TokenItem tokenInfo={wallet.portfolioPrimaryTokenInfo} label={totalPrimaryTokenLabel} isSent={false} />

            {notPrimaryToken.map((token, index) => (
              <TokenItem
                key={index}
                tokenInfo={token.tokenInfo}
                label={formatTokenWithText(token.quantity, token.tokenInfo)}
                isPrimaryToken={false}
                isSent={false}
              />
            ))}
          </View>
        </View>
      </View>
    )
  })

  return (
    <View>
      <Divider verticalSpace="lg" />

      <Accordion label={strings.multiExternalPartiesSectionLabel}>
        <Space height="lg" />

        <InfoBanner content={strings.multiExternalPartiesSectionNotice} />

        {receivers}
      </Accordion>
    </View>
  )
}

const ExternalPartiesSectionLabel = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.tokensSectionLabel}>
      <Icon.Received size={30} color={colors.received} />

      <Space width="_2xs" />

      <Text style={styles.tokenSectionLabel}>{strings.receiveLabel}</Text>
    </View>
  )
}

const OperationsSection = ({
  operations,
  extraOperations,
  operationsNotice,
}: {
  operations: Operations
  extraOperations?: Array<React.ReactNode>
  operationsNotice?: React.ReactNode
}) => {
  const strings = useStrings()
  if (extraOperations == null && operations.components?.length === 0) return null

  const componentsNotDuplicated = operations.components
    .filter((component) => !component.duplicated)
    .map(({component}) => component)
  const componentDuplicated = operations.components.filter((component) => component.duplicated)

  return (
    <View>
      <Divider verticalSpace="lg" />

      <Accordion label={strings.operationsLabel}>
        <Space height="lg" />

        {operationsNotice != null && (
          <>
            <Space height="lg" />

            {operationsNotice}
          </>
        )}

        <Space height="lg" />

        {[...componentsNotDuplicated, ...(extraOperations ?? [])].map((operation, index) => {
          if (index === 0) return operation

          return (
            <React.Fragment key={index}>
              <Space height="sm" />

              {operation}
            </React.Fragment>
          )
        })}

        {componentDuplicated.length > 0 && (
          <Details
            details={{title: strings.operationsLogTitle, component: <OperationsModal operations={operations} />}}
          />
        )}
      </Accordion>
    </View>
  )
}

const OperationsModal = ({operations}: {operations: Operations}) => {
  const strings = useStrings()
  const components = operations.components.map(({component}) => component)

  return (
    <View>
      <WarningBanner title={strings.operationsLogWarningTitle} content={strings.operationsLogWarningText} />

      <Accordion label={strings.operationsLabel}>
        <Space height="lg" />

        {components.map((operation, index) => {
          if (index === 0) return operation

          return (
            <>
              <Space height="sm" />

              {operation}
            </>
          )
        })}
      </Accordion>
    </View>
  )
}

export type ReviewDetailsProps = {title: string; component: React.ReactNode; height?: number}

const Details = ({details}: {details?: ReviewDetailsProps}) => {
  const {openModal} = useModal()
  const {styles} = useStyles()

  if (details == null) return null

  const handleOnPress = () => {
    openModal({
      title: details.title ?? '',
      content: <View style={styles.details}>{details.component}</View>,
      height: details.height ?? 400,
    })
  }

  return (
    <View>
      <Space height="lg" />

      <View style={styles.detailsRow}>
        <TouchableOpacity onPress={handleOnPress} activeOpacity={0.5}>
          <Text style={styles.detailsButton}>{details?.title}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const CreatedByInfoItem = ({logo, url}: {logo?: string; url: string}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{strings.createdBy}</Text>

      <View style={styles.plate}>
        {logo != null && <Image source={{uri: logo}} style={styles.logo} />}

        <Space width="sm" />

        <TouchableOpacity onPress={() => Linking.openURL(url)}>
          <Text style={styles.link}>{url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const OperationsNotice = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {closeModal} = useModal()
  const {setOperationsNoticeShown} = useSetOperationsNoticeShown()

  const handleOnpress = () => {
    setOperationsNoticeShown()
    closeModal()
  }

  return (
    <View style={styles.modal}>
      <Space height="lg" />

      <OperationsNoticeIcon />

      <Space height="_2xl" />

      <Text style={styles.modalText}>{strings.operationsNoticeText}</Text>

      <Space fill />

      <View style={styles.actions}>
        <Button title={strings.operationsNoticeButton} onPress={handleOnpress} />
      </View>
    </View>
  )
}

const operationsNoticeShownKey = 'operations-notice-shown-key'
const useShowOperationsNotice = (operations: Operations) => {
  const storage = useAsyncStorage()
  const {openModal} = useModal()
  const strings = useStrings()

  const query = useQuery({
    useErrorBoundary: true,
    suspense: true,
    queryKey: ['useShowOperationsNotice'],
    queryFn: () => storage.getItem(operationsNoticeShownKey).then((value) => parseBoolean(value) ?? true),
  })

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const openOperationsNotice = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        openModal({title: strings.operationsNoticeTitle, content: <OperationsNotice />, height: 570}), 500
      })
    }

    if (operations.components.length > 0 && query.data) openOperationsNotice()

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

const useSetOperationsNoticeShown = () => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () => storage.setItem(operationsNoticeShownKey, JSON.stringify(false)),
    invalidateQueries: [['useShowOperationsNotice']],
  })

  return {
    ...mutation,
    setOperationsNoticeShown: mutation.mutate,
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      backgroundColor: color.bg_color_max,
    },
    infoItem: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    infoLabel: {
      ...atoms.body_2_md_regular,
      color: color.gray_600,
    },
    walletInfoText: {
      ...atoms.body_2_md_medium,
      color: color.text_primary_medium,
    },
    plate: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    fee: {
      color: color.gray_900,
      ...atoms.body_2_md_regular,
    },
    externalPartyAddress: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    externalPartyAddressText: {
      ...atoms.body_2_md_medium,
      color: color.text_gray_medium,
    },
    tokenSectionLabel: {
      ...atoms.body_1_lg_medium,
      color: color.text_gray_medium,
    },
    tokenItems: {
      ...atoms.flex_wrap,
      ...atoms.flex_row,
      ...atoms.justify_end,
      ...atoms.flex_1,
      ...atoms.gap_sm,
    },
    tokensSection: {
      ...atoms.flex_row,
      ...atoms.justify_between,
    },
    tokensSectionLabel: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    walletChecksum: {
      width: 24,
      height: 24,
    },
    externalPartiesSectionAddress: {
      maxWidth: 260,
    },
    addressText: {
      ...atoms.flex_1,
      ...atoms.body_2_md_regular,
      color: color.text_gray_medium,
    },
    detailsRow: {
      ...atoms.flex_row,
      ...atoms.justify_end,
    },
    details: {
      ...atoms.px_lg,
    },
    detailsButton: {
      ...atoms.body_2_md_medium,
      color: color.text_primary_medium,
    },
    link: {
      color: color.text_primary_medium,
      ...atoms.body_2_md_medium,
    },
    logo: {
      width: 24,
      height: 24,
    },
    modal: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.align_center,
    },
    modalText: {
      ...atoms.text_center,
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
    actions: {
      alignSelf: 'stretch',
    },
  })

  const colors = {
    send: color.el_primary_medium,
    received: color.green_static,
    icon: color.el_gray_medium,
  }

  return {styles, colors} as const
}
