import {
  isBoolean,
  parseSafe,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Balance, Portfolio} from '@yoroi/types'

import {CredKind} from '@emurgo/cross-csl-core'
import {useQuery} from '@tanstack/react-query'
import * as React from 'react'
import {
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'

import {TokenItem} from '~/features/ReviewTx/common/TokenItem'
import {WalletBalance} from '~/features/ReviewTx/common/WalletBalance'
import {Operations, useOperations} from '~/features/ReviewTx/common/operations'
import {
  FormattedOutput,
  FormattedOutputs,
  FormattedTx,
} from '~/features/ReviewTx/common/types'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {Divider} from '~/ui/Divider/Divider'
import {Icon} from '~/ui/Icon'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {WarningBanner} from '~/ui/WarningBanner/WarningBanner'
import {formatTokenWithText} from '~/wallets/utils/format'
import {Quantities} from '~/wallets/utils/utils'

import {Accordion} from '../../../../common/Accordion'
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
  const {atoms: ta} = useTheme()
  const operations = useOperations(tx.certificates)
  const strings = useStrings()
  useShowOperationsNotice(operations)

  const notOwnedOutputs = React.useMemo(
    () => tx.outputs.filter((output) => !output.ownAddress),
    [tx.outputs],
  )
  const ownedOutputs = React.useMemo(
    () => tx.outputs.filter((output) => output.ownAddress),
    [tx.outputs],
  )
  const operationsComponentsDuplicated = React.useMemo(
    () => operations.components.find((component) => component.duplicated),
    [operations.components],
  )

  return (
    <View style={[a.flex_1, a.px_lg, ta.bg_color_max]}>
      <Space.Height.lg />

      {operationsComponentsDuplicated && (
        <>
          <WarningBanner
            title={strings.txReview.operations.warning.title}
            content={strings.txReview.operations.warning.text}
          />

          <Space.Height.lg />
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
        <OneExternalPartySection
          receiverCustomTitle={receiverCustomTitle}
          output={notOwnedOutputs[0]}
        />
      )}

      {notOwnedOutputs.length > 1 && (
        <MultiExternalPartiesSection outputs={notOwnedOutputs} />
      )}

      <OperationsSection
        operations={operations}
        extraOperations={extraOperations}
        operationsNotice={operationsNotice}
      />

      <Details details={details} />
    </View>
  )
}

const WalletInfoSection = ({
  tx,
  createdBy,
}: {
  tx: FormattedTx
  createdBy?: React.ReactNode
}) => {
  const {palette: p, atoms: ta} = useTheme()
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const {openModal} = useModal()
  const {plate, seed} = walletManager.checksum(wallet.publicKeyHex)
  const seedImage = new Blockies({seed}).asBase64()
  const {height: windowHeight} = useWindowDimensions()

  const handleShowWalletBalance = () => {
    openModal({
      title: strings.txReview.walletBalance.title,
      content: (
        <Modal.Content>
          <WalletBalance image={seedImage} plate={plate} name={meta.name} />
        </Modal.Content>
      ),
      height: windowHeight * 0.7,
    })
  }

  return (
    <>
      <View style={[a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {strings.txReview.overview.wallet}
        </Text>

        <View style={[a.flex_row, a.align_center]}>
          <Icon.WalletAvatar
            image={seedImage}
            style={{width: 24, height: 24}}
            size={24}
          />

          <Space.Width.sm />

          <TouchableOpacity
            activeOpacity={0.5}
            onPress={handleShowWalletBalance}
          >
            <Text
              style={[a.body_2_md_medium, {color: p.text_primary_medium}]}
            >{`${plate} | ${meta.name}`}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Space.Height.sm />

      {createdBy != null && (
        <>
          {createdBy}

          <Space.Height.sm />
        </>
      )}

      <FeeInfoItem
        fee={formatTokenWithText(
          tx.fee.quantity,
          wallet.portfolioPrimaryTokenInfo,
        )}
      />
    </>
  )
}

const FeeInfoItem = ({fee}: {fee: string}) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.justify_between]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.txReview.fee}
      </Text>

      <Text style={[ta.text_gray_max, a.body_2_md_regular]}>{`-${fee}`}</Text>
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
  const {palette: p} = useTheme()
  const address =
    ownedOutputs[0]?.rewardAddress ?? ownedOutputs[0]?.address ?? '-'

  return (
    <Accordion label={strings.txReview.overview.myWalletLabel}>
      <Space.Height.lg />

      <Copiable text={address}>
        <Text
          style={[a.flex_1, a.body_2_md_regular, {color: p.text_gray_medium}]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {address}
        </Text>

        {ownedOutputs[0]?.addressKind === CredKind.Script && (
          <>
            <Space.Width.xs />

            <Icon.DigitalAsset size={24} color={p.el_gray_medium} />
          </>
        )}
      </Copiable>

      <Space.Height.sm />

      <MyWalletTokens
        tx={tx}
        notOwnedOutputs={notOwnedOutputs}
        operationsFee={operationsFee}
      />
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
  const {wallet} = useSelectedWallet()

  const totalPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs
        .flatMap((output) =>
          output.assets.filter(
            (asset) =>
              asset.tokenInfo.nature === Portfolio.Token.Nature.Primary,
          ),
        )
        .reduce(
          (previous, current) => Quantities.sum([previous, current.quantity]),
          Quantities.zero,
        ),
    [notOwnedOutputs],
  )
  const totalPrimaryTokenSpent = React.useMemo(
    () =>
      Quantities.sum([totalPrimaryTokenSent, tx.fee.quantity, operationsFee]),
    [totalPrimaryTokenSent, tx.fee.quantity, operationsFee],
  )
  const totalPrimaryTokenSpentLabel = formatTokenWithText(
    totalPrimaryTokenSpent,
    wallet.portfolioPrimaryTokenInfo,
  )

  const notPrimaryTokenSent = React.useMemo(
    () =>
      notOwnedOutputs.flatMap((output) =>
        output.assets.filter(
          (asset) => asset.tokenInfo.nature !== Portfolio.Token.Nature.Primary,
        ),
      ),
    [notOwnedOutputs],
  )

  return (
    <View style={[a.flex_row, a.justify_between]}>
      <View
        style={[a.flex_wrap, a.flex_row, a.justify_end, a.flex_1, a.gap_sm]}
      >
        <MyWalletSectionLabel />

        <Space.Height._2xs fill />

        <TokenItem
          tokenInfo={wallet.portfolioPrimaryTokenInfo}
          label={`-${totalPrimaryTokenSpentLabel}`}
        />

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
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.align_center]}>
      <Icon.Send size={30} color={ta.el_primary_medium.color} />

      <Space.Width._2xs />

      <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
        {strings.txReview.overview.sendLabel}
      </Text>
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
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <>
      <Space.Height.sm />

      <View style={[a.flex_row, a.align_center, a.flex_row, a.justify_between]}>
        <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>
          {strings.txReview.overview.receiveToLabel}:
        </Text>

        {receiverCustomTitle ?? (
          <Copiable text={address}>
            <Text
              style={[
                a.flex_1,
                a.body_2_md_regular,
                ta.text_gray_medium,
                {maxWidth: 260},
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {address}
            </Text>

            {output?.addressKind === CredKind.Script && (
              <>
                <Space.Width.xs />

                <Icon.DigitalAsset size={24} color={ta.el_gray_medium.color} />
              </>
            )}
          </Copiable>
        )}
      </View>
    </>
  )
}

const MultiExternalPartiesSection = ({
  outputs,
}: {
  outputs: FormattedOutputs
}) => {
  const {palette: p} = useTheme()
  const {wallet} = useSelectedWallet()
  const strings = useStrings()

  const receivers = outputs.map((output, index) => {
    const totalPrimaryToken =
      output.assets.filter(
        (asset) => asset.tokenInfo.nature === Portfolio.Token.Nature.Primary,
      )[0]?.quantity ?? Quantities.zero
    const totalPrimaryTokenLabel = formatTokenWithText(
      totalPrimaryToken,
      wallet.portfolioPrimaryTokenInfo,
    )
    const notPrimaryToken = output.assets.filter(
      (asset) => asset.tokenInfo.nature !== Portfolio.Token.Nature.Primary,
    )
    const address = output?.rewardAddress ?? output?.address ?? '-'

    return (
      <View key={index}>
        <Space.Height.lg />

        <Copiable text={address}>
          <Text
            style={[a.flex_1, a.body_2_md_regular, {color: p.text_gray_medium}]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {address}
          </Text>

          {output?.addressKind === CredKind.Script && (
            <>
              <Space.Width.xs />

              <Icon.DigitalAsset size={24} color={p.el_gray_medium} />
            </>
          )}
        </Copiable>

        <Space.Height.sm />

        <View style={[a.flex_row, a.justify_between]}>
          <View
            style={[a.flex_wrap, a.flex_row, a.justify_end, a.flex_1, a.gap_sm]}
          >
            <ExternalPartiesSectionLabel />

            <Space.Height._2xs fill />

            <TokenItem
              tokenInfo={wallet.portfolioPrimaryTokenInfo}
              label={totalPrimaryTokenLabel}
              isSent={false}
            />

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

      <Accordion
        label={strings.txReview.overview.multiExternalPartiesSectionLabel}
      >
        <Space.Height.lg />

        <InfoBanner
          content={strings.txReview.overview.multiExternalPartiesSectionNotice}
        />

        {receivers}
      </Accordion>
    </View>
  )
}

const ExternalPartiesSectionLabel = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.align_center]}>
      <Icon.Received size={30} color={p.green_static} />

      <Space.Width._2xs />

      <Text style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}>
        {strings.txReview.receiveLabel}
      </Text>
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
  if (extraOperations == null && operations.components?.length === 0)
    return null

  const componentsNotDuplicated = operations.components
    .filter((component) => !component.duplicated)
    .map(({component}) => component)
  const componentDuplicated = operations.components.filter(
    (component) => component.duplicated,
  )

  return (
    <View>
      <Divider verticalSpace="lg" />

      <Accordion label={strings.txReview.operationsLabel}>
        <Space.Height.lg />

        {operationsNotice != null && (
          <>
            <Space.Height.lg />

            {operationsNotice}
          </>
        )}

        <Space.Height.lg />

        {[...componentsNotDuplicated, ...(extraOperations ?? [])].map(
          (operation, index) => {
            if (index === 0) return operation

            return (
              <React.Fragment key={index}>
                <Space.Height.sm />

                {operation}
              </React.Fragment>
            )
          },
        )}

        {componentDuplicated.length > 0 && (
          <Details
            details={{
              title: strings.txReview.operations.log,
              component: <OperationsModal operations={operations} />,
            }}
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
      <WarningBanner
        title={strings.txReview.operations.warning.title}
        content={strings.txReview.operations.warning.text}
      />

      <Accordion label={strings.txReview.operationsLabel}>
        <Space.Height.lg />

        {components.map((operation, index) => {
          if (index === 0) return operation

          return (
            <>
              <Space.Height.sm />

              {operation}
            </>
          )
        })}
      </Accordion>
    </View>
  )
}

export type ReviewDetailsProps = {
  title: string
  component: React.ReactNode
  height?: number
}

const Details = ({details}: {details?: ReviewDetailsProps}) => {
  const {openModal} = useModal()
  const {atoms: ta} = useTheme()

  if (details == null) return null

  const handleOnPress = () => {
    openModal({
      title: details.title ?? '',
      content: <Modal.Content>{details.component}</Modal.Content>,
      height: details.height ?? 400,
    })
  }

  return (
    <View>
      <Space.Height.lg />

      <View style={[a.flex_row, a.justify_end]}>
        <TouchableOpacity onPress={handleOnPress} activeOpacity={0.5}>
          <Text style={[a.body_2_md_medium, ta.text_primary_medium]}>
            {details?.title}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const CreatedByInfoItem = ({
  logo,
  url,
}: {
  logo?: string
  url: string
}) => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <View style={[a.flex_row, a.justify_between]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.txReview.createdBy}
      </Text>

      <View style={[a.flex_row, a.align_center]}>
        {logo != null && (
          <Image source={{uri: logo}} style={{width: 24, height: 24}} />
        )}

        <Space.Width.sm />

        <TouchableOpacity onPress={() => Linking.openURL(url)}>
          <Text style={[ta.text_primary_medium, a.body_2_md_medium]}>
            {url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const OperationsNoticeModalContent = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()

  return (
    <Modal.Content>
      <View style={[a.align_center]}>
        <Space.Height.lg />

        <OperationsNoticeIcon />
      </View>

      <Space.Height._2xl />

      <Text style={[a.text_center, a.body_1_lg_regular, ta.text_gray_medium]}>
        {strings.txReview.overview.operationsNoticeText}
      </Text>

      <Space.Height._2xs fill />
    </Modal.Content>
  )
}

const OperationsNoticeModalFooter = () => {
  const strings = useStrings()
  const {setOperationsNoticeShown} = useSetOperationsNoticeShown()
  const {closeModal} = useModal()

  const handleOnpress = () => {
    closeModal()
    setOperationsNoticeShown()
  }

  return (
    <Modal.Footer>
      <Button
        title={strings.txReview.overview.operationsNoticeButton}
        onPress={handleOnpress}
      />
    </Modal.Footer>
  )
}

const operationsNoticeShownKey = 'operations-notice-shown-key'
const useShowOperationsNotice = (operations: Operations) => {
  const storage = useAsyncStorage()
  const {openModal} = useModal()
  const strings = useStrings()
  const screenHeight = useWindowDimensions().height
  const hasOpenedInSession = React.useRef(false)

  const query = useQuery({
    queryKey: ['useShowOperationsNotice'],
    queryFn: () =>
      storage.getItem(operationsNoticeShownKey).then((value) => {
        const parsed = parseSafe(value)
        return isBoolean(parsed) ? parsed : true
      }),
    initialData: false,
    staleTime: Infinity, // Never refetch - only load once
    gcTime: Infinity, // Keep in cache forever
  })

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const openOperationsNotice = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        openModal({
          title: strings.txReview.overview.operationsNoticeTitle,
          content: <OperationsNoticeModalContent />,
          footer: <OperationsNoticeModalFooter />,
          height: Math.min(screenHeight * 0.9, 650),
          canDiscard: true,
        })
        hasOpenedInSession.current = true
      }, 500)
    }

    const shouldOpen =
      operations.components.length > 0 &&
      !query.isLoading &&
      query.data === true &&
      !hasOpenedInSession.current

    if (shouldOpen) {
      openOperationsNotice()
    }

    return () => {
      clearTimeout(timeout)
      timeout = undefined
    }
  }, [
    operations.components.length,
    query.data,
    query.isLoading,
    openModal,
    strings,
    screenHeight,
  ])
}

const useSetOperationsNoticeShown = () => {
  const storage = useAsyncStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async () => {
      await storage.setItem(operationsNoticeShownKey, JSON.stringify(false))
    },
    invalidateQueries: [],
  })

  return {
    ...mutation,
    setOperationsNoticeShown: mutation.mutate,
  }
}
