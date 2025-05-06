import {primaryTokenInfoMainnet} from '@yoroi/blockchains'
import {isLeft, truncateString} from '@yoroi/common'
import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Api, Portfolio, Swap} from '@yoroi/types'
import _ from 'lodash'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {useIntl} from 'react-intl'
import {FlatList, Linking, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {Divider} from 'react-native-paper'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {Button, ButtonType} from '../../../../components/Button/Button'
import {Icon} from '../../../../components/Icon'
import {useModal} from '../../../../components/Modal/ModalContext'
import {RefreshButton} from '../../../../components/RefreshButton/RefreshButton'
import {Space} from '../../../../components/Space/Space'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {usePortfolioTokenInfos} from '../../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {TokenInfoIcon} from '../../../Portfolio/common/TokenAmountItem/TokenInfoIcon'
import {useSearch, useSearchOnNavBar} from '../../../Search/SearchContext'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {Counter} from '../../common/Counter/Counter'
import {EmptyCompletedOrdersIllustration} from '../../common/Illustrations/EmptyCompletedOrdersIllustration'
import {EmptyOpenOrdersIllustration} from '../../common/Illustrations/EmptyOpenOrdersIllustration'
import {useNavigateTo} from '../../common/navigation'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {ServiceUnavailable} from '../../common/ServiceUnavailable/ServiceUnavailable'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

type Filter = 'open' | 'completed'

export const ListOrders = () => {
  const {navigateToTxHistory} = useWalletNavigation()
  const [filter, setFilter] = React.useState<Filter>('open')
  const swapForm = useSwap()

  const strings = useStrings()
  const {styles, color} = useStyles()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
    isChild: true,
    onBack: navigateToTxHistory,
  })

  return (
    <View style={styles.root}>
      <View style={styles.group}>
        <View>
          <Button
            onPress={() => setFilter('open')}
            type={ButtonType.SecondaryText}
            title={strings.openOrders}
            size="M"
            fontOverride={styles.groupFont}
            {...(filter === 'open' && {style: styles.activeButton})}
          />
        </View>

        <View>
          <Button
            onPress={() => setFilter('completed')}
            type={ButtonType.SecondaryText}
            title={strings.completedOrders}
            size="M"
            fontOverride={styles.groupFont}
            {...(filter === 'completed' && {style: styles.activeButton})}
          />
        </View>

        <RefreshButton onPress={swapForm.refetchOrders} />
      </View>

      <Boundary
        loading={{
          fallback: (
            <View style={styles.list}>
              {[0, 1, 2, 3].map((index) => (
                <React.Fragment key={index}>
                  <SkeletonPlaceholder
                    borderRadius={8}
                    backgroundColor={color.gray_100}
                    highlightColor={color.gray_200}
                    speed={1000}
                  >
                    <View style={{height: 140}} />
                  </SkeletonPlaceholder>
                </React.Fragment>
              ))}
            </View>
          ),
        }}
      >
        <ErrorBoundary
          fallbackRender={({resetErrorBoundary}) => <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />}
        >
          <Content filter={filter} />
        </ErrorBoundary>
      </Boundary>
    </View>
  )
}

const Content = ({filter}: {filter: Filter}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {visible: isSearching} = useSearch()
  const swapForm = useSwap()
  const orders = swapForm.orders?.filter(
    ({status}) =>
      (status === 'open' && filter === 'open') ||
      (status !== 'open' && status !== 'canceled' && filter === 'completed'),
  )

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        <FlatList
          contentContainerStyle={styles.list}
          data={orders}
          renderItem={({item}) => <Order order={item} />}
          keyExtractor={(item) => `${item.txHash}#${item.outputIndex ?? 0}`}
          ListEmptyComponent={<ListEmptyComponent filter={filter} />}
        />
      </View>

      {!isSearching && (
        <Counter
          openingText={strings.youHave}
          counter={orders?.length ?? 0}
          closingText={filter === 'open' ? strings.listOpenOrders : strings.listCompletedOrders}
        />
      )}
    </View>
  )
}

const tokenName = (token?: Portfolio.Token.Info) => token?.ticker ?? token?.name ?? token?.id ?? '-'

const Order = ({order}: {order: Swap.Order}) => {
  const intl = useIntl()
  const strings = useStrings()
  const {
    selected: {
      networkManager: {explorers},
    },
  } = useWalletManager()
  const {styles, color} = useStyles()
  const [expanded, setExpanded] = React.useState<boolean>(false)
  const swapForm = useSwap()
  const tokenInInfo = swapForm.tokenInfos.get(order.tokenIn)
  const tokenOutInfo = swapForm.tokenInfos.get(order.tokenOut)

  const amountOut = order.actualAmountOut === 0 ? order.expectedAmountOut : order.actualAmountOut
  const priceCalc = amountOut === 0 ? 0 : order.amountIn / amountOut
  const roundedPrice = priceCalc.toFixed(tokenOutInfo?.decimals ?? 0).replace(/\.0+$/, '')
  const price = roundedPrice !== '0' ? roundedPrice : priceCalc.toFixed(6)

  const priceStr = `1 ${tokenName(tokenInInfo)} = ${price} ${tokenName(tokenOutInfo)}`

  const amountOutStr = `${Number(amountOut.toFixed(tokenOutInfo?.decimals ?? 0))} ${tokenName(tokenOutInfo)}`

  const lastTxHash = order.updateTxHash ?? order.txHash ?? ''
  const shortenedTxHash = `${truncateString({value: lastTxHash, maxLength: 22})}#${order.outputIndex ?? 0}`

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View style={styles.cardHeader}>
          <View style={styles.composedText}>
            <TokenInfoIcon info={tokenInInfo} size="sm" />

            <Text style={styles.heading}>{tokenName(tokenInInfo)}</Text>

            <Text style={styles.heading}>/</Text>

            <TokenInfoIcon info={tokenOutInfo} size="sm" />

            <Text style={styles.heading}>{tokenName(tokenOutInfo)}</Text>
          </View>

          <Icon.Chevron direction={expanded ? 'up' : 'down'} color={color.el_gray_max} size={24} />
        </View>
      </TouchableOpacity>

      <View style={styles.list}>
        <Row label={strings.listOrdersSheetAssetPrice} value={priceStr} />

        <Row label={strings.listOrdersSheetAssetAmount} value={amountOutStr} />

        {order.placedAt !== undefined && (
          <Row
            label={strings.listOrdersTimeCreated}
            value={intl.formatDate(new Date(order.placedAt), {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
        )}

        {order.lastUpdate !== undefined && (
          <Row
            label={strings.listOrdersTimeCompleted}
            value={intl.formatDate(new Date(order.lastUpdate), {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          />
        )}

        {expanded && (
          <React.Fragment>
            <Row label={strings.listOrdersTotal} value={`${order.amountIn} ${tokenName(tokenInInfo)}`} />

            <Row label={strings.route} value={<ProtocolAvatar protocol={order.protocol} preventOpenLink />} />

            {lastTxHash !== '' && (
              <Row
                label={strings.listOrdersTxId}
                value={
                  <Button
                    type={ButtonType.Link}
                    style={styles.inlineLink}
                    onPress={() => Linking.openURL(explorers.cexplorer.tx(lastTxHash))}
                    title={shortenedTxHash}
                  />
                }
              />
            )}
          </React.Fragment>
        )}

        {order.status === 'open' && tokenInInfo && (
          <OrderCancellation order={order} tokenInInfo={tokenInInfo} price={priceStr} amount={amountOutStr} />
        )}
      </View>
    </View>
  )
}

type CancellationProps = {
  order: Swap.Order
  tokenInInfo: Portfolio.Token.Info
  price: string
  amount: string
}

const OrderCancellation = ({order, tokenInInfo, price, amount}: CancellationProps) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {openModal, closeModal} = useModal()
  const swapForm = useSwap()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const {navigateToTxReview} = useWalletNavigation()
  const navigateTo = useNavigateTo()

  const onPress = async () => {
    setIsLoading(true)
    const response = await swapForm.cancel({order})
    setIsLoading(false)

    const onOrderCancelConfirm = () => {
      if (isLeft(response)) {
        navigateTo.failedTx()
      } else {
        navigateToTxReview({
          cbor: response.value.data.cbor,
          details: {
            title: strings.swapCancellationDetailsTitle,
            component: (
              <Details order={order} tokenInInfo={tokenInInfo} price={price} amount={amount} response={response} />
            ),
          },
        })
      }
    }

    openModal({
      title: strings.listOrdersSheetTitle,
      content: (
        <OrderCancellationConfirmation
          order={order}
          tokenInInfo={tokenInInfo}
          price={price}
          amount={amount}
          response={response}
        />
      ),
      footer: isLeft(response) ? (
        <Button type={ButtonType.Secondary} title={strings.listOrdersSheetBack} onPress={closeModal} />
      ) : (
        <View style={styles.group}>
          <Button type={ButtonType.Secondary} title={strings.listOrdersSheetBack} onPress={closeModal} />

          {response.value.data.cbor !== undefined && (
            <Button type={ButtonType.Critical} title={strings.listOrdersSheetConfirm} onPress={onOrderCancelConfirm} />
          )}
        </View>
      ),
      height: 400,
    })
  }

  return (
    <Button
      style={styles.cancelButton}
      type={ButtonType.SecondaryText}
      title={strings.listOrdersSheetButtonText}
      isLoading={isLoading}
      onPress={onPress}
    />
  )
}

const OrderCancellationConfirmation = ({
  order,
  tokenInInfo,
  price,
  amount,
  response,
}: CancellationProps & {response: Api.Response<Swap.CancelResponse>}) => {
  const strings = useStrings()
  const {styles} = useStyles()

  if (isLeft(response))
    return (
      <View style={styles.root}>
        <Text style={styles.errorMessage}>{response.error.message}</Text>
      </View>
    )

  const fee = response.value.data.additionalCancellationFee

  return (
    <View style={styles.root}>
      <React.Fragment>
        <Row label={strings.route} value={<ProtocolAvatar protocol={order.protocol} preventOpenLink />} />

        <Row label={strings.listOrdersSheetAssetPrice} value={price} />

        <Row label={strings.listOrdersSheetAssetAmount} value={amount} />

        <Row label={strings.listOrdersSheetTotalReturned} value={`${order.amountIn} ${tokenName(tokenInInfo)}`} />

        {fee !== undefined && (
          <Row label={strings.listOrdersSheetCancellationFee} value={`${fee} ${primaryTokenInfoMainnet.ticker}}`} />
        )}
      </React.Fragment>

      <Space fill />
    </View>
  )
}

const Row = ({label, value}: {label: string; value: string | React.ReactNode}) => {
  const {styles} = useStyles()

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>

      {typeof value === 'string' ? <Text style={styles.rowValue}>{value}</Text> : value}
    </View>
  )
}

const ListEmptyComponent = ({filter}: {filter: Filter}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()
  const {styles} = useStyles()

  return (
    <View style={styles.notOrdersYetContainer}>
      {filter === 'open' ? (
        <React.Fragment>
          <EmptyOpenOrdersIllustration style={styles.illustration} />

          <Text style={styles.contentText}>
            {isSearching ? `${strings.emptySearchOpenOrders} "${assetSearchTerm}"` : strings.emptyOpenOrders}
          </Text>

          {!isSearching && <Text style={styles.contentSubText}>{strings.emptyOpenOrdersSub}</Text>}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <EmptyCompletedOrdersIllustration style={styles.illustration} />

          <Text style={styles.contentText}>
            {isSearching ? `${strings.emptySearchCompletedOrders} "${assetSearchTerm}"` : strings.emptyCompletedOrders}
          </Text>
        </React.Fragment>
      )}
    </View>
  )
}

const Details = ({
  order,
  price,
  amount,
  response,
}: CancellationProps & {response: Api.Response<Swap.CancelResponse>}) => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  const portfolioTokenInfos = usePortfolioTokenInfos(
    {wallet, tokenIds: [order.tokenIn, order.tokenOut]},
    {suspense: true},
  )
  const tokenInInfo = portfolioTokenInfos.tokenInfos?.get(order.tokenIn)
  const tokenOutInfo = portfolioTokenInfos.tokenInfos?.get(order.tokenOut)

  if (tokenInInfo == null) throw new Error('Swap Cancellation:: invalid state: tokenInInfo')
  if (tokenOutInfo == null) throw new Error('Swap Cancellation:: invalid state: tokenOutInfo')

  const amountOut = order.actualAmountOut === 0 ? order.expectedAmountOut : order.actualAmountOut

  const amountOutStr = `${Number(amountOut.toFixed(tokenOutInfo?.decimals ?? 0))} ${tokenName(tokenOutInfo)}`

  const isFromPrimary = tokenOutInfo?.nature === Portfolio.Token.Nature.Primary
  const fromDetail = isFromPrimary ? tokenOutInfo?.description : tokenOutInfo?.fingerprint
  const fromName = infoExtractName(tokenOutInfo)

  const isToPrimary = tokenOutInfo?.nature === Portfolio.Token.Nature.Primary
  const toDetail = isToPrimary ? tokenOutInfo?.description : tokenOutInfo?.fingerprint
  const toName = infoExtractName(tokenOutInfo)
  const amountInStr = `${Number(order.amountIn.toFixed(tokenInInfo?.decimals ?? 0))} ${tokenName(tokenOutInfo)}`

  return (
    <View>
      <Text style={styles.amountItemLabel}>{strings.swapFrom}</Text>

      <View style={styles.token}>
        <Left>
          <TokenInfoIcon info={tokenOutInfo} size="md" />
        </Left>

        <Middle>
          <View style={styles.row}>
            <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
              {fromName}
            </Text>
          </View>

          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
            {fromDetail}
          </Text>
        </Middle>

        <Right style={styles.end}>
          <Text style={styles.quantity}>{amountOutStr}</Text>
        </Right>
      </View>

      <Space height="lg" />

      <Text style={styles.amountItemLabel}>{strings.swapTo}</Text>

      <View style={styles.token}>
        <Left>
          <TokenInfoIcon info={tokenInInfo} size="md" />
        </Left>

        <Middle>
          <View style={styles.row}>
            <Text numberOfLines={1} ellipsizeMode="middle" style={styles.name} testID="tokenInfoText">
              {toName}
            </Text>
          </View>

          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.detail} testID="tokenFingerprintText">
            {toDetail}
          </Text>
        </Middle>

        <Right style={styles.end}>
          <Text style={styles.quantity}>{amountInStr}</Text>
        </Right>
      </View>

      <Space height="lg" />

      <Divider />

      <Space height="lg" />

      <OrderCancellationConfirmation
        order={order}
        tokenInInfo={tokenInInfo}
        price={price}
        amount={amount}
        response={response}
      />
    </View>
  )
}

const Left = ({style, ...props}: ViewProps) => <View style={style} {...props} />
const Middle = ({style, ...props}: ViewProps) => (
  <View style={[style, {flex: 1, justifyContent: 'center', paddingHorizontal: 8}]} {...props} />
)
const Right = ({style, ...props}: ViewProps) => <View style={style} {...props} />

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    flex: {
      ...atoms.flex_1,
    },
    group: {
      ...atoms.flex_row,
      ...atoms.gap_md,
      ...atoms.justify_center,
      ...atoms.align_center,
    },
    groupFont: {
      ...atoms.body_1_lg_medium,
    },
    root: {
      ...atoms.flex_1,
      ...atoms.p_lg,
      ...atoms.gap_lg,
      backgroundColor: color.bg_color_max,
    },
    activeButton: {
      backgroundColor: color.gray_100,
    },
    list: {
      ...atoms.gap_md,
    },
    illustration: {
      ...atoms.flex_1,
      alignSelf: 'center',
      width: 280,
      height: 224,
    },
    notOrdersYetContainer: {
      ...atoms.flex_1,
      ...atoms.text_center,
      ...atoms.gap_lg,
      ...atoms.pt_2xl,
    },
    contentText: {
      ...atoms.flex_1,
      ...atoms.text_center,
      ...atoms.heading_3_medium,
      color: color.gray_max,
    },
    contentSubText: {
      ...atoms.flex_1,
      ...atoms.text_center,
      color: color.text_gray_low,
      ...atoms.body_1_lg_regular,
    },
    card: {
      ...atoms.p_lg,
      ...atoms.border,
      borderRadius: 8,
      borderColor: color.gray_200,
      backgroundColor: color.bg_color_max,
    },
    cardHeader: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.pb_md,
    },
    composedText: {
      ...atoms.flex_row,
      ...atoms.align_center,
      ...atoms.gap_sm,
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
      ...atoms.flex_shrink,
      ...atoms.text_right,
      color: color.text_gray_medium,
    },
    inlineLink: {
      padding: 0,
      ...atoms.justify_end,
    },
    cancelButton: {
      ...atoms.self_start,
      ...atoms.px_0,
    },
    errorMessage: {
      ...atoms.body_3_sm_regular,
      color: color.text_warning,
    },
    end: {
      ...atoms.align_end,
    },
    name: {
      color: color.gray_900,
      ...atoms.body_1_lg_medium,
    },
    detail: {
      color: color.gray_600,
      maxWidth: 140,
      ...atoms.body_3_sm_regular,
    },
    token: {
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    amountItemLabel: {
      fontSize: 12,
      color: color.text_gray_medium,
      ...atoms.pb_sm,
    },
    quantity: {
      color: color.gray_900,
      ...atoms.body_1_lg_regular,
    },
  })
  return {styles, color}
}
