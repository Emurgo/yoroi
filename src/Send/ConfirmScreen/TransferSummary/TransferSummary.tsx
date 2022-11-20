import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {LayoutAnimation, Linking, StyleSheet, TextProps, TouchableOpacity, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {Avatar as RNPAvatar} from 'react-native-paper'

import AdaImage from '../../../assets/img/asset_ada.png'
import NoImage from '../../../assets/img/asset_no_image.png'
import {Boundary, Card, Hr, Icon, Spacer, Text} from '../../../components'
import {useBalances, usePrimaryPaired, usePrimaryToken, useTokenInfo} from '../../../hooks'
import globalMessages, {txLabels} from '../../../i18n/global-messages'
import {
  formatTokenAmount,
  formatTokenWithSymbol,
  formatTokenWithText,
  getAssetDenominationOrId,
  getTokenFingerprint,
} from '../../../legacy/format'
import {getNetworkConfigById} from '../../../legacy/networks'
import {COLORS} from '../../../theme'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiAmount, YoroiAmounts, YoroiEntries, YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'

export const TransferSummary = ({wallet, unsignedTx}: {wallet: YoroiWallet; unsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  console.log(JSON.stringify(unsignedTx.amounts))
  return (
    <ScrollView>
      <Receivers wallet={wallet} entries={unsignedTx.entries} />

      <Separator />

      <Boundary loading={{fallbackProps: {size: 'small'}}}>
        <TotalCard wallet={wallet} unsignedTx={unsignedTx} />
      </Boundary>

      <Spacer height={26} />

      <Text style={[styles.textDetail, styles.textDetailColor]}>{`${strings.transaction} ${strings.details}`}</Text>

      <Spacer height={16} />

      {/* check with design */}
      {/* <Boundary loading={{fallbackProps: {size: 'small'}}}>
        <PrimaryAmount wallet={wallet} unsignedTx={unsignedTx} />
      </Boundary> */}

      <Fees wallet={wallet} fees={unsignedTx.fee} />

      <BalanceAfter wallet={wallet} unsignedTx={unsignedTx} />

      <TokenTotals wallet={wallet} unsignedTx={unsignedTx} />
    </ScrollView>
  )
}

const TotalCard = ({wallet, unsignedTx}: {wallet: YoroiWallet; unsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const primaryToken = usePrimaryToken(wallet)
  const primaryCost = Amounts.sum([unsignedTx.amounts, unsignedTx.fee])
  const cost = Amounts.getAmount(primaryCost, wallet.defaultAsset.identifier)
  const tokens = Amounts.toArray(Amounts.remove(unsignedTx.amounts, [wallet.defaultAsset.identifier]))

  return (
    <Card style={{alignItems: 'stretch', flexDirection: 'row'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.cardText}>{strings.total}</Text>
        <Text style={[styles.cardText, styles.strong]} testID="costText">
          {formatTokenWithSymbol(new BigNumber(cost.quantity), primaryToken)}
        </Text>
      </View>
      <Boundary loading={{fallbackProps: {size: 'small'}}}>
        <PairedCost cost={cost} />
      </Boundary>
      <Text style={[styles.cardText, styles.alignRight]} testID="assetsAmountText">
        {strings.assets(tokens.length)}
      </Text>
    </Card>
  )
}

const Fees = ({wallet, fees}: {wallet: YoroiWallet; fees: YoroiAmounts}) => {
  const strings = useStrings()
  const primaryToken = usePrimaryToken(wallet)
  return (
    <Row
      title={strings.fees}
      label={formatTokenWithText(
        new BigNumber(Amounts.getAmount(fees, primaryToken.identifier).quantity),
        primaryToken,
      )}
    />
  )
}

const BalanceAfter = ({wallet, unsignedTx}: {wallet: YoroiWallet; unsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const primaryToken = usePrimaryToken(wallet)
  const balances = useBalances(wallet)

  // prettier-ignore
  const balancesAfter = Amounts.diff(
    balances,
    Amounts.sum([
      unsignedTx.amounts,
      unsignedTx.fee,
    ]),
  )
  const primaryAmountAfter = Amounts.getAmount(balancesAfter, '')

  return (
    <Row
      title={strings.balanceAfterTx}
      label={formatTokenWithSymbol(new BigNumber(primaryAmountAfter.quantity), primaryToken)}
    />
  )
}

const Receivers = ({wallet, entries}: {wallet: YoroiWallet; entries: YoroiEntries}) => {
  const strings = useStrings()
  const receivers = Object.keys(entries)

  return (
    <>
      <Text style={[styles.strong, styles.title]}>{strings.receiver}</Text>
      {receivers.map((address, index) => (
        <TouchableOpacity
          key={address}
          activeOpacity={0.5}
          onPress={() => Linking.openURL(getNetworkConfigById(wallet.networkId).EXPLORER_URL_FOR_ADDRESS(address))}
        >
          <Text style={[styles.textDetail, styles.textDetailColor]} testID={`textReceiver_${index}`}>
            {address}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  )
}

// exporting to save -- check with desing
export const PrimaryAmount = ({wallet, unsignedTx}: {wallet: YoroiWallet; unsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const primaryTokenInfo = usePrimaryToken(wallet)
  const primaryAmount = Amounts.getAmount(unsignedTx.amounts, primaryTokenInfo.identifier)

  return (
    <Row
      title={strings.amount}
      label={formatTokenWithSymbol(new BigNumber(primaryAmount.quantity), primaryTokenInfo)}
    />
  )
}

const TokenTotals = ({wallet, unsignedTx}: {wallet: YoroiWallet; unsignedTx: YoroiUnsignedTx}) => {
  const strings = useStrings()
  const tokens = Amounts.toArray(unsignedTx.amounts)
  const sortedTokens = tokens.sort((a, b) =>
    Quantities.isGreaterThan(a.quantity, b.quantity) || a.tokenId === wallet.defaultAsset.identifier ? -1 : 1,
  )
  const qtyTokens = Math.max(tokens.length - 1, 0) // we don't count the default asset

  return (
    <Row title={strings.tokens(qtyTokens)} label={qtyTokens.toString()}>
      {sortedTokens.map((amount) => (
        <Boundary key={amount.tokenId} loading={{fallbackProps: {size: 'small'}}}>
          <Token amount={amount} wallet={wallet} />
        </Boundary>
      ))}
    </Row>
  )
}

const Token = ({wallet, amount}: {wallet: YoroiWallet; amount: YoroiAmount}) => {
  const tokenInfo = useTokenInfo({wallet, tokenId: amount.tokenId})
  const denomination = getAssetDenominationOrId(tokenInfo)

  return (
    <>
      <Spacer height={16} />
      {tokenInfo.isDefault && amount.quantity != null ? (
        <PairedTokenRow
          denomination={denomination}
          avatar={AdaImage}
          fingerprint="Cardano"
          formattedAmount={formatTokenAmount(new BigNumber(amount.quantity), tokenInfo)}
          amount={amount}
        />
      ) : (
        <TokenRow
          avatar={NoImage}
          denomination={denomination}
          fingerprint={getTokenFingerprint(tokenInfo)}
          amount={formatTokenAmount(new BigNumber(amount.quantity), tokenInfo)}
        />
      )}
    </>
  )
}

const PairedCost = ({cost}: {cost: YoroiAmount}) => {
  const paired = usePrimaryPaired(cost)
  return (
    <Text style={[styles.cardDetailColor, styles.textDetail, styles.alignRight]}>
      {paired?.product} {paired?.currency}
    </Text>
  )
}

const Separator = () => (
  <>
    <Spacer height={16} />
    <Hr />
    <Spacer height={16} />
  </>
)

const Row = ({title, label, children}: {title: string; label: string; children?: React.ReactNode}) => {
  const [show, setShow] = React.useState(true)
  return (
    <>
      <View style={[styles.row, styles.between]}>
        <RowTitle>{title}</RowTitle>

        <View style={styles.row}>
          {children != null ? (
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                setShow(!show)
              }}
              style={styles.row}
            >
              <RowLabel>{label}</RowLabel>
              <Spacer width={11} />
              <Icon.Chevron direction={show ? 'up' : 'down'} size={24} color={COLORS.WORD_BADGE_TEXT} />
            </TouchableOpacity>
          ) : (
            <RowLabel>{label}</RowLabel>
          )}
        </View>
      </View>

      {show && children}

      <Separator />
    </>
  )
}
const RowTitle = ({style, ...props}: TextProps) => (
  <Text
    {...props}
    style={[style, styles.title, styles.strong, styles.titleColor, styles.textLimit]}
    ellipsizeMode="middle"
    numberOfLines={1}
  />
)
const RowLabel = ({style, ...props}: TextProps) => <Text {...props} style={[style, styles.title, styles.labelColor]} />

const PairedTokenRow = ({
  avatar,
  denomination,
  amount,
  formattedAmount,
  fingerprint,
}: {
  avatar: string
  denomination: string
  amount: YoroiAmount
  formattedAmount: string
  fingerprint: string
}) => {
  const paired = usePrimaryPaired(amount)
  const formattedPaired = `${paired?.product} ${paired?.currency}`
  return (
    <TokenRow
      avatar={avatar}
      denomination={denomination}
      amount={formattedAmount}
      fingerprint={fingerprint}
      paired={formattedPaired}
    />
  )
}

const TokenRow = ({
  avatar,
  denomination,
  amount,
  fingerprint,
  paired,
}: {
  avatar: string
  denomination: string
  amount: string
  fingerprint: string
  paired?: string
}) => {
  return (
    <View>
      <View style={[styles.row, styles.between]}>
        <View style={styles.row}>
          {avatar != null && <Avatar source={avatar} />}

          <View>
            <Denomination>{denomination}</Denomination>
            <Fingerprint>{fingerprint}</Fingerprint>
          </View>
        </View>

        <View style={styles.row}>
          <View>
            <Amount>{amount}</Amount>
            {paired != null && <Paired>{paired}</Paired>}
          </View>
        </View>
      </View>
    </View>
  )
}
const Avatar = (props) => (
  <View style={styles.avatar}>
    <RNPAvatar.Image
      {...props}
      size={26}
      style={{alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}
    />
  </View>
)
const Denomination = ({style, ...props}: TextProps) => (
  <Text
    {...props}
    style={[style, styles.textDetail, styles.strong, styles.titleColor, styles.textLimit]}
    ellipsizeMode="middle"
    numberOfLines={1}
  />
)
const Fingerprint = ({style, ...props}: TextProps) => (
  <Text
    {...props}
    style={[style, styles.subText, styles.textDetailColor, styles.textLimit]}
    ellipsizeMode="middle"
    numberOfLines={1}
  />
)
const Amount = ({style, ...props}: TextProps) => (
  <Text {...props} style={[style, styles.textDetail, styles.titleColor, styles.alignRight]} />
)
const Paired = ({style, ...props}: TextProps) => (
  <Text {...props} style={[style, styles.subText, styles.textDetailColor, styles.alignRight]} />
)

const useStrings = () => {
  const intl = useIntl()

  return {
    amount: intl.formatMessage(txLabels.amount),
    total: intl.formatMessage(globalMessages.total),
    transaction: intl.formatMessage(globalMessages.transaction),
    details: intl.formatMessage(globalMessages.details),
    tokens: (qty: number) => intl.formatMessage(globalMessages.tokens, {qty}),
    receiver: intl.formatMessage(txLabels.receiver),
    balanceAfterTx: intl.formatMessage(txLabels.balanceAfter),
    fees: intl.formatMessage(txLabels.fees),
    assets: (cnt: number) => intl.formatMessage(txLabels.assets, {cnt}),
  }
}

const styles = StyleSheet.create({
  avatar: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  textLimit: {
    maxWidth: 160,
  },
  strong: {
    fontFamily: 'Rubik-Medium',
    fontWeight: '500',
  },
  cardText: {
    fontSize: 18,
    lineHeight: 26,
    color: COLORS.WHITE,
  },
  cardDetailColor: {
    color: COLORS.WHITE,
    opacity: 0.5,
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
  },
  subText: {
    fontSize: 12,
    lineHeight: 18,
  },
  textDetail: {
    fontSize: 14,
    lineHeight: 22,
  },
  textDetailColor: {
    color: COLORS.WORD_BADGE_TEXT,
  },
  between: {
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleColor: {
    color: '#242838',
  },
  labelColor: {
    color: '#8A92A3',
  },
})
