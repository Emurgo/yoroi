import {FetchData, fetchData, getApiError, isLeft, createTypeGuardFromSchema} from '@yoroi/common'
import {freeze} from 'immer'
import {AxiosRequestConfig} from 'axios'
import {z} from 'zod'

const dappListHost = 'https://daehx1qv45z7c.cloudfront.net'
const initialDeps = freeze({request: fetchData}, true)

export type Api = {
  getDApps: (fetcherConfig?: AxiosRequestConfig) => Promise<DappListResponse>
}

export const dappConnectorApiMaker = ({request}: {request: FetchData} = initialDeps): Api => {
  const getDApps = async (fetcherConfig?: AxiosRequestConfig): Promise<DappListResponse> => {
    const config = {url: `${dappListHost}/data.json`} as const

    const response = await request<unknown>(config, fetcherConfig)

    if (isLeft(response)) throw getApiError(response.error)

    if (!isDappListResponse(response.value.data)) {
      throw new Error('Invalid dapp list response: ' + JSON.stringify(response.value.data))
    }

    const value = mockedData
    return {
      dapps: value.dapps.map((dapp) => ({
        id: dapp.id,
        name: dapp.name,
        description: dapp.description,
        category: dapp.category,
        logo: `${dappListHost}/${dapp.logo}`,
        uri: dapp.uri,
        origins: dapp.origins,
      })),
      filters: value.filters,
    }
  }
  return {getDApps}
}

const mockedData = {
  dapps: [
    {
      id: 'cardano_spot',
      name: 'Mocked dApp',
      description: 'Join a global Cardano Community: a single space to communicate, engage, educate with Cardano',
      category: 'News',
      logo: 'cardano-spot.png',
      uri: 'https://cardanospot.io/landing',
      origins: ['https://cardanospot.io'],
    },
    {
      id: 'minswap',
      name: 'Minswap',
      description: 'A decentralized exchange governed by a community that zaps',
      category: 'DEX',
      logo: 'minswap.png',
      uri: 'https://minswap.org/',
      origins: ['https://minswap.org'],
    },
    {
      id: 'sundaeswap',
      name: 'SundaeSwap',
      description: 'Native, scalable decentralized exchange and automated liquidity provision protocol',
      category: 'DEX',
      logo: 'sundaeswap.png',
      uri: 'https://sundae.fi/',
      origins: ['https://sondae.fi', 'https://app.sundae.fi'],
    },
    {
      id: 'muesliswap',
      name: 'MuesliSwap',
      description: "Swap tokens, earn & invest  on Cardano's leading DeFi ecosystem",
      category: 'DEX',
      logo: 'muesliswap.png',
      uri: 'https://muesliswap.com/',
      origins: ['https://muesliswap.com'],
    },
    {
      id: 'geniusyield',
      name: 'GeniusYield',
      description: 'The all-in-one platform, that combines an order book DEX with an automated yield optimizer.',
      category: 'DEX',
      logo: 'genius-yield.png',
      uri: 'https://www.geniusyield.co/',
      origins: ['https://www.geniusyield.co', 'https://app.geniusyield.co'],
    },
    {
      id: 'wingriders',
      name: 'Wingriders',
      description: 'Native and fast AMM decentralized exchange platform',
      category: 'DEX',
      logo: 'wingriders.png',
      uri: 'https://www.wingriders.com/',
      origins: ['https://www.wingriders.com', 'https://app.wingriders.com'],
    },
    {
      id: 'dex_hunter',
      name: 'DEX Hunter',
      description: 'Biggest Cardano DEX Aggregator with real-time alerts and an easy to use interface',
      category: 'DEX',
      logo: 'dexhunter.png',
      uri: 'https://www.dexhunter.io/',
      origins: ['https://www.dexhunter.io', 'https://app.dexhunter.io'],
    },
    {
      id: 'ada_markets',
      name: 'ADA Markets',
      description: 'DEX Aggregator getting you the best value swaps / splits across Cardano DEXes',
      category: 'DEX',
      logo: 'ada-markets.png',
      uri: 'https://ada.markets/',
      origins: ['https://ada.markets'],
    },
    {
      id: 'ada_handle',
      name: 'ADA Handle',
      description: 'NFT-powered naming solution for your Cardano wallet address',
      category: 'Identity',
      logo: 'ada-handle.png',
      uri: 'https://adahandle.com/',
      origins: ['https://adahandle.com', 'https://mint.handle.me'],
    },
    {
      id: 'cns',
      name: 'CNS',
      description: 'Decentralized name registry and social graph creation',
      category: 'Identity',
      logo: 'cns.png',
      uri: 'https://cns.space/',
      origins: ['https://cns.space'],
    },
    {
      id: 'book_io',
      name: 'Book.io',
      description: 'A Web3 marketplace for buying, reading, and selling eBooks and Audiobooks',
      category: 'entertainment',
      logo: 'book.png',
      uri: 'https://book.io/',
      origins: ['https://book.io'],
    },
    {
      id: 'nucast',
      name: 'Nucast',
      description: 'Nest generation video streaming and ownership platform',
      category: 'Entertainment',
      logo: 'nucast.png',
      uri: 'https://www.nucast.io/',
      origins: ['https://www.nucast.io'],
    },
    {
      id: 'taptools',
      name: 'Taptools',
      description: 'Chart analysis, wallet profiler, and portfolio tracker on Cardano',
      category: 'Trading Tools',
      logo: 'taptools.png',
      uri: 'https://www.taptools.io/',
      origins: ['https://www.taptools.io'],
    },
    {
      id: 'jpg_store',
      name: 'JPG Store',
      description: "Buy and sell NFTs on Cardano's most popular NFT marketplace",
      category: 'NFT Marketplace',
      logo: 'jpg-store.png',
      uri: 'https://www.jpg.store/',
      origins: ['https://www.jpg.store'],
    },
    {
      id: 'jam_on_bread',
      name: 'JAM ON BREAD',
      description: 'Decentralized NFT marketplace and aggregator',
      category: 'NFT Marketplace',
      logo: 'jam-on-bread.png',
      uri: 'https://jamonbread.io/',
      origins: ['https://jamonbread.io'],
    },
    {
      id: 'pxlz',
      name: 'PXLZ',
      description: 'The first interactive NFT collectibles on the Cardano blockchain',
      category: 'NFT Marketplace',
      logo: 'pxlz.png',
      uri: 'https://pxlz.org/',
      origins: ['https://pxlz.org'],
    },
    {
      id: 'liqwid',
      name: 'Liqwid',
      description: 'Earn interest, borrow assets, and build on the most hydrated liquidity protocol on Cardano',
      category: 'DeFi',
      logo: 'liqwid.png',
      uri: 'https://liqwid.finance/',
      origins: ['https://liqwid.finance'],
    },
    {
      id: 'lenfi',
      name: 'Lenfi',
      description: 'Permissionless lending, borrowing, liquidity pool creation, and more',
      category: 'DeFi',
      logo: 'lenfi.png',
      uri: 'https://lenfi.io/',
      origins: ['https://lenfi.io'],
    },
    {
      id: 'fluidtokens',
      name: 'FluidTokens',
      description: 'Lend, borrow, rent, and boost',
      category: 'DeFi',
      logo: 'fluidtokens.png',
      uri: 'https://fluidtokens.com/',
      origins: ['https://fluidtokens.com'],
    },
    {
      id: 'levvy',
      name: 'Levvy',
      description: 'Lend and borrow with NFTs and Tokens',
      category: 'DeFi',
      logo: 'levvy.png',
      uri: 'https://levvy.fi/',
      origins: ['https://levvy.fi'],
    },
    {
      id: 'optionflow',
      name: 'OptionFlow',
      description: 'A Decentralized Option Protocol on the Cardano Blockchain',
      category: 'DeFi',
      logo: 'optionflow.png',
      uri: 'https://app.optionflow.finance/',
      origins: ['https://app.optionflow.finance'],
    },
    {
      id: 'djed',
      name: 'Djed',
      description: "Cardano's native overcollateralized stablecoin, developed by IOG and powered by COTI",
      category: 'Stablecoin',
      logo: 'djed.png',
      uri: 'https://djed.xyz/',
      origins: ['https://djed.xyz'],
    },
    {
      id: 'iagon',
      name: 'Iagon',
      description: 'A cloud computing platform offering access to decentralized storage and compute',
      category: 'Decentralised Storage',
      logo: 'iagon.png',
      uri: 'https://iagon.com/',
      origins: ['https://iagon.com'],
    },
  ],
  filters: {
    Media: ['News', 'Entertainment'],
    Investment: ['DeFi', 'DEX', 'NFT Marketplace', 'Stablecoin'],
    NFT: ['NFT Marketplace'],
    Trading: ['DEX', 'Trading Tools', 'Stablecoin'],
    Community: ['DAO', 'Decentralised Storage'],
  },
}

const DappResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  logo: z.string(),
  uri: z.string(),
  origins: z.array(z.string()),
})

const DappListResponseSchema = z.object({
  dapps: z.array(DappResponseSchema),
  filters: z.record(z.array(z.string())),
})

const isDappListResponse = createTypeGuardFromSchema(DappListResponseSchema)

export interface DappListResponse {
  dapps: DappResponse[]
  filters: Record<string, string[]>
}

interface DappResponse {
  id: string
  name: string
  description: string
  category: string
  logo: string
  uri: string
  origins: string[]
}
