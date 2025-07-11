import {primaryTokenInfoMainnet} from '@yoroi/blockchains'
import {isLeft, truncateString} from '@yoroi/common'
import {infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Portfolio, Swap} from '@yoroi/types'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {useIntl} from 'react-intl'
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {Divider} from 'react-native-paper'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import {ViewProps} from 'react-native-svg/lib/typescript/fabric/utils'

import {useWalletNavigation} from '../../../../kernel/navigation'
import {usePortfolioTokenInfos} from '../../../Portfolio/common/hooks/usePortfolioTokenInfos'
import {useSearch, useSearchOnNavBar} from '../../../Search/SearchContext'
import {Boundary} from '../../../ui/Boundary/Boundary'
import {Button, ButtonType} from '../../../ui/Button/Button'
import {Counter} from '../../../ui/Counter/Counter'
import {EmptyCompletedOrdersIllustration} from '../../../ui/EmptyCompletedOrdersIllustration/EmptyCompletedOrdersIllustration'
import {EmptyOpenOrdersIllustration} from '../../../ui/EmptyOpenOrdersIllustration/EmptyOpenOrdersIllustration'
import {Icon} from '../../../ui/Icon'
import {useModal} from '../../../ui/Modal/ModalContext'
import {ProtocolAvatar} from '../../../ui/ProtocolAvatar/ProtocolAvatar'
import {RefreshButton} from '../../../ui/RefreshButton/RefreshButton'
import {ServiceUnavailable} from '../../../ui/ServiceUnavailable/ServiceUnavailable'
import {Space} from '../../../ui/Space/Space'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

type Filter = 'open' | 'completed'

export const ListOrders = () => {
  const {navigateToTxHistory} = useWalletNavigation()
  const [filter, setFilter] = React.useState<Filter>('open')
  const swapForm = useSwap()

  const strings = useStrings()
  const {color} = useTheme()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
    isChild: true,
    onBack: navigateToTxHistory,
  })

  return (
    <View
      style={[
        styles.root,
        a.p_lg,
        a.gap_lg,
        {backgroundColor: color.bg_color_max},
      ]}
    >
      <View
        style={[
          styles.group,
          a.flex_row,
          a.gap_md,
          a.justify_center,
          a.align_center,
        ]}
      >
        <View>
          <Button
            onPress={() => setFilter('open')}
            type={ButtonType.SecondaryText}
            title={strings.openOrders}
            size="M"
            fontOverride={a.body_1_lg_medium}
            {...(filter === 'open' && {
              style: [styles.activeButton, {backgroundColor: color.gray_100}],
            })}
          />
        </View>

        <View>
          <Button
            onPress={() => setFilter('completed')}
            type={ButtonType.SecondaryText}
            title={strings.completedOrders}
            size="M"
            fontOverride={a.body_1_lg_medium}
            {...(filter === 'completed' && {
              style: [styles.activeButton, {backgroundColor: color.gray_100}],
            })}
          />
        </View>

        <RefreshButton onPress={swapForm.refetchOrders} />
      </View>

      <Boundary
        loading={{
          fallback: (
            <View style={[styles.list, a.gap_md]}>
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
          fallbackRender={({resetErrorBoundary}) => (
            <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <Content filter={filter} />
        </ErrorBoundary>
      </Boundary>
    </View>
  )
}

const Content = ({filter}: {filter: Filter}) => {
  const strings = useStrings()
  const {visible: isSearching} = useSearch()
  const swapForm = useSwap()
  const orders = swapForm.orders?.filter(
    ({status}) =>
      (status === 'open' && filter === 'open') ||
      (status !== 'open' && status !== 'canceled' && filter === 'completed'),
  )
  const {color} = useTheme()

  return (
    <View style={styles.flex}>
      <View style={styles.flex}>
        <FlatList
          contentContainerStyle={[styles.list, a.gap_md]}
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
          closingText={
            filter === 'open'
              ? strings.listOpenOrders
              : strings.listCompletedOrders
          }
        />
      )}
    </View>
  )
}

const tokenName = (token?: Portfolio.Token.Info) =>
  token?.ticker ?? token?.name ?? token?.id ?? '-'

const Order = ({order}: {order: Swap.Order}) => {
  const intl = useIntl()
  const strings = useStrings()
  const {
    selected: {
      networkManager: {explorers},
    },
  } = useWalletManager()
  const {color} = useTheme()
  const [expanded, setExpanded] = React.useState<boolean>(false)
  const swapForm = useSwap()
  const tokenInInfo = swapForm.tokenInfos.get(order.tokenIn)
  const tokenOutInfo = swapForm.tokenInfos.get(order.tokenOut)

  const amountOut =
    order.actualAmountOut === 0
      ? order.expectedAmountOut
      : order.actualAmountOut
  const priceCalc = amountOut === 0 ? 0 : order.amountIn / amountOut
  const roundedPrice = priceCalc
    .toFixed(tokenOutInfo?.decimals ?? 0)
    .replace(/\.0+$/, '')
  const price = roundedPrice !== '0' ? roundedPrice : priceCalc.toFixed(6)

  const priceStr = `1 ${tokenName(tokenInInfo)} = ${price} ${tokenName(tokenOutInfo)}`

  const amountOutStr = `${Number(amountOut.toFixed(tokenOutInfo?.decimals ?? 0))} ${tokenName(tokenOutInfo)}`

  const lastTxHash = order.updateTxHash ?? order.txHash ?? ''
  const shortenedTxHash = `${truncateString({value: lastTxHash, maxLength: 22})}#${order.outputIndex ?? 0}`

  return (
    <View
      style={[
        styles.card,
        a.p_lg,
        a.border,
        {
          borderRadius: 8,
          borderColor: color.gray_200,
          backgroundColor: color.bg_color_max,
        },
      ]}
    >
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <View
          style={[styles.cardHeader, a.flex_row, a.justify_between, a.pb_md]}
        >
          <View
            style={[styles.composedText, a.flex_row, a.align_center, a.gap_sm]}
          >
            <TokenInfoIcon info={tokenInInfo} size="sm" />

            <Text style={[styles.heading, {color: color.text_gray_medium}]}>
              {tokenName(tokenInInfo)}
            </Text>

            <Text style={[styles.heading, {color: color.text_gray_medium}]}>
              /
            </Text>

            <TokenInfoIcon info={tokenOutInfo} size="sm" />

            <Text style={[styles.heading, {color: color.text_gray_medium}]}>
              {tokenName(tokenOutInfo)}
            </Text>
          </View>

          <Icon.Chevron
            direction={expanded ? 'up' : 'down'}
            color={color.el_gray_max}
            size={24}
          />
        </View>
      </TouchableOpacity>

      <View style={[styles.list, a.gap_md]}>
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
            <Row
              label={strings.listOrdersTotal}
              value={`${order.amountIn} ${tokenName(tokenInInfo)}`}
            />

            <Row
              label={strings.route}
              value={
                <ProtocolAvatar protocol={order.protocol} preventOpenLink />
              }
            />

            {lastTxHash !== '' && (
              <Row
                label={strings.listOrdersTxId}
                value={
                  <Button
                    type={ButtonType.Link}
                    style={[styles.inlineLink, a.justify_end, {padding: 0}]}
                    onPress={() =>
                      Linking.openURL(explorers.cexplorer.tx(lastTxHash))
                    }
                    title={shortenedTxHash}
                  />
                }
              />
            )}
          </React.Fragment>
        )}

        {order.status === 'open' && tokenInInfo && (
          <OrderCancellation
            order={order}
            tokenInInfo={tokenInInfo}
            price={priceStr}
            amount={amountOutStr}
          />
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

const OrderCancellation = ({
  order,
  tokenInInfo,
  price,
  amount,
}: CancellationProps) => {
  const strings = useStrings()
  const {openModal, closeModal} = useModal()
  const swapForm = useSwap()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const {navigateToTxReview} = useWalletNavigation()
  const navigateTo = useNavigateTo()
  const {color} = useTheme()

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
              <Details
                order={order}
                tokenInInfo={tokenInInfo}
                price={price}
                amount={amount}
                response={response}
              />
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
        <Button
          type={ButtonType.Secondary}
          title={strings.listOrdersSheetBack}
          onPress={closeModal}
        />
      ) : (
        <View
          style={[
            styles.group,
            a.flex_row,
            a.gap_md,
            a.justify_center,
            a.align_center,
          ]}
        >
          <Button
            type={ButtonType.Secondary}
            title={strings.listOrdersSheetBack}
            onPress={closeModal}
          />

          {response.value.data.cbor !== undefined && (
            <Button
              type={ButtonType.Critical}
              title={strings.listOrdersSheetConfirm}
              onPress={onOrderCancelConfirm}
            />
          )}
        </View>
      ),
      height: 400,
    })
  }

  return (
    <Button
      style={[styles.cancelButton, a.self_start, a.px_0]}
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
  const {color} = useTheme()

  if (isLeft(response))
    return (
      <View style={styles.root}>
        <Text style={[styles.errorMessage, {color: color.text_warning}]}>
          {response.error.message}
        </Text>
      </View>
    )

  const fee = response.value.data.additionalCancellationFee

  return (
    <View style={styles.root}>
      <React.Fragment>
        <Row
          label={strings.route}
          value={<ProtocolAvatar protocol={order.protocol} preventOpenLink />}
        />

        <Row label={strings.listOrdersSheetAssetPrice} value={price} />

        <Row label={strings.listOrdersSheetAssetAmount} value={amount} />

        <Row
          label={strings.listOrdersSheetTotalReturned}
          value={`${order.amountIn} ${tokenName(tokenInInfo)}`}
        />

        {fee !== undefined && (
          <Row
            label={strings.listOrdersSheetCancellationFee}
            value={`${fee} ${primaryTokenInfoMainnet.ticker}}`}
          />
        )}
      </React.Fragment>

      <Space fill />
    </View>
  )
}

const Row = ({
  label,
  value,
}: {
  label: string
  value: string | React.ReactNode
}) => {
  const {color} = useTheme()

  return (
    <View style={[styles.row, a.flex_row, a.justify_between]}>
      <Text style={[styles.rowLabel, {color: color.text_gray_low}]}>
        {label}
      </Text>

      {typeof value === 'string' ? (
        <Text style={[styles.rowValue, {color: color.text_gray_medium}]}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  )
}

const ListEmptyComponent = ({filter}: {filter: Filter}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <View
      style={[styles.notOrdersYetContainer, a.text_center, a.gap_lg, a.pt_2xl]}
    >
      {filter === 'open' ? (
        <React.Fragment>
          <EmptyOpenOrdersIllustration
            style={[
              styles.illustration,
              a.flex_1,
              {alignSelf: 'center', width: 280, height: 224},
            ]}
          />

          <Text style={[styles.contentText, {color: color.gray_max}]}>
            {isSearching
              ? `${strings.emptySearchOpenOrders} "${assetSearchTerm}"`
              : strings.emptyOpenOrders}
          </Text>

          {!isSearching && (
            <Text style={[styles.contentSubText, {color: color.text_gray_low}]}>
              {strings.emptyOpenOrdersSub}
            </Text>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <EmptyCompletedOrdersIllustration
            style={[
              styles.illustration,
              a.flex_1,
              {alignSelf: 'center', width: 280, height: 224},
            ]}
          />

          <Text style={[styles.contentText, {color: color.gray_max}]}>
            {isSearching
              ? `${strings.emptySearchCompletedOrders} "${assetSearchTerm}"`
              : strings.emptyCompletedOrders}
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
  const strings = useStrings()
  const {wallet} = useSelectedWallet()

  const portfolioTokenInfos = usePortfolioTokenInfos(
    {wallet, tokenIds: [order.tokenIn, order.tokenOut]},
    {suspense: true},
  )
  const tokenInInfo = portfolioTokenInfos.tokenInfos?.get(order.tokenIn)
  const tokenOutInfo = portfolioTokenInfos.tokenInfos?.get(order.tokenOut)
  const {color} = useTheme()

  if (tokenInInfo == null)
    throw new Error('Swap Cancellation:: invalid state: tokenInInfo')
  if (tokenOutInfo == null)
    throw new Error('Swap Cancellation:: invalid state: tokenOutInfo')

  const amountOut =
    order.actualAmountOut === 0
      ? order.expectedAmountOut
      : order.actualAmountOut

  const amountOutStr = `${Number(amountOut.toFixed(tokenOutInfo?.decimals ?? 0))} ${tokenName(tokenOutInfo)}`

  const isFromPrimary = tokenOutInfo?.nature === Portfolio.Token.Nature.Primary
  const fromDetail = isFromPrimary
    ? tokenOutInfo?.description
    : tokenOutInfo?.fingerprint
  const fromName = infoExtractName(tokenOutInfo)

  const isToPrimary = tokenOutInfo?.nature === Portfolio.Token.Nature.Primary
  const toDetail = isToPrimary
    ? tokenOutInfo?.description
    : tokenOutInfo?.fingerprint
  const toName = infoExtractName(tokenOutInfo)
  const amountInStr = `${Number(order.amountIn.toFixed(tokenInInfo?.decimals ?? 0))} ${tokenName(tokenOutInfo)}`

  return (
    <View>
      <Text style={[styles.amountItemLabel, {color: color.text_gray_medium}]}>
        {strings.swapFrom}
      </Text>

      <View style={[styles.token, a.flex_row, a.align_center]}>
        <Left>
          <TokenInfoIcon info={tokenOutInfo} size="md" />
        </Left>

        <Middle>
          <View style={styles.row}>
            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              style={[styles.name, {color: color.gray_900}]}
              testID="tokenInfoText"
            >
              {fromName}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={[styles.detail, {color: color.gray_600}]}
            testID="tokenFingerprintText"
          >
            {fromDetail}
          </Text>
        </Middle>

        <Right style={styles.end}>
          <Text style={[styles.quantity, {color: color.gray_900}]}>
            {amountOutStr}
          </Text>
        </Right>
      </View>

      <Space height="lg" />

      <Text style={[styles.amountItemLabel, {color: color.text_gray_medium}]}>
        {strings.swapTo}
      </Text>

      <View style={[styles.token, a.flex_row, a.align_center]}>
        <Left>
          <TokenInfoIcon info={tokenInInfo} size="md" />
        </Left>

        <Middle>
          <View style={styles.row}>
            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              style={[styles.name, {color: color.gray_900}]}
              testID="tokenInfoText"
            >
              {toName}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={[styles.detail, {color: color.gray_600}]}
            testID="tokenFingerprintText"
          >
            {toDetail}
          </Text>
        </Middle>

        <Right style={styles.end}>
          <Text style={[styles.quantity, {color: color.gray_900}]}>
            {amountInStr}
          </Text>
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
  <View
    style={[style, {flex: 1, justifyContent: 'center', paddingHorizontal: 8}]}
    {...props}
  />
)
const Right = ({style, ...props}: ViewProps) => (
  <View style={style} {...props} />
)

const styles = StyleSheet.create({
  flex: {
    ...a.flex_1,
  },
  group: {},
  root: {},
  activeButton: {},
  list: {},
  illustration: {
    alignSelf: 'center',
    width: 280,
    height: 224,
  },
  notOrdersYetContainer: {},
  contentText: {
    ...a.flex_1,
    ...a.text_center,
    ...a.heading_3_medium,
  },
  contentSubText: {
    ...a.flex_1,
    ...a.text_center,
    ...a.body_1_lg_regular,
  },
  card: {},
  cardHeader: {},
  composedText: {},
  heading: {
    ...a.body_1_lg_medium,
  },
  row: {},
  rowLabel: {
    ...a.body_1_lg_regular,
  },
  rowValue: {
    ...a.body_1_lg_regular,
    ...a.flex_shrink,
    ...a.text_right,
  },
  inlineLink: {},
  cancelButton: {},
  errorMessage: {
    ...a.body_3_sm_regular,
  },
  end: {
    ...a.align_end,
  },
  name: {
    ...a.body_1_lg_medium,
  },
  detail: {
    maxWidth: 140,
    ...a.body_3_sm_regular,
  },
  token: {},
  amountItemLabel: {
    fontSize: 12,
    ...a.pb_sm,
  },
  quantity: {
    ...a.body_1_lg_regular,
  },
})
