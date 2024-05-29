import { amountBreakdown } from "@yoroi/portfolio"
import { Portfolio } from "@yoroi/types"

type TFormatterPortfolioAmountProps = Portfolio.Token.Amount & {decimalPlaces?: number}

export const formatterPortfolioAmount = ({info, quantity, decimalPlaces = 2}: TFormatterPortfolioAmountProps) => {
  return amountBreakdown({info, quantity}).bn.toFormat(decimalPlaces)
}
