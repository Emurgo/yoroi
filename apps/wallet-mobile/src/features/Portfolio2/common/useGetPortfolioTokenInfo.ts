import { type Portfolio } from "@yoroi/types"
import { ImageSourcePropType } from "react-native"
import { useQuery, UseQueryOptions } from "react-query"

import AdaLogo from '../../../assets/img/ada.png'

interface IPortfolioTokenInfo {
    logo: ImageSourcePropType | string
    symbol: string
    name: string
    amount: Portfolio.Token.Amount
}

const mockADA = {
    "info": {
        application: "coin",
        decimals: 6,
        description: "Cardano",
        fingerprint: "",
        icon: "",
        id: ".",
        mediaType: "",
        name: "TADA",
        nature: "primary",
        originalImage: "",
        reference: "",
        status: "valid",
        symbol: "₳",
        tag: "",
        ticker: "TADA",
        type: "ft",
        website: "https://www.cardano.org/"
    },
    quantity: BigInt(4800000)
} as Portfolio.Token.Amount


const MockTokenList = [{
    logo: AdaLogo,
    name: 'ADA',
    symbol: "₳",
    amount: mockADA
}, {
    logo: AdaLogo,
    name: 'TADA',
    symbol: "₳",
    amount: mockADA
}, {
    logo: AdaLogo,
    symbol: 'AGIX',
    name: 'Agix',
    amount: mockADA
}, {
    logo: AdaLogo,
    symbol: 'HOSKY',
    name: 'Hosky',
    amount: mockADA
}] as IPortfolioTokenInfo[]


export const useGetPortfolioTokenInfo = (
    name: string,
    options: UseQueryOptions<IPortfolioTokenInfo, Error, IPortfolioTokenInfo, ['useGetPortfolioTokenInfo', string]> = {},
) => {
    const query = useQuery({
        useErrorBoundary: true,
        ...options,
        queryKey: ['useGetPortfolioTokenInfo', name],
        queryFn: async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return MockTokenList.find((token) => token.name === name) as IPortfolioTokenInfo
        },
    })

    return query
}
