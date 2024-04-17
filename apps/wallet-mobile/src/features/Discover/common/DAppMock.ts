import {ImageSourcePropType} from 'react-native'

import ADAHandle from '../../../assets/img/dApp/ada-handle.png'
import ADAMarkets from '../../../assets/img/dApp/ada-markets.png'
import Book from '../../../assets/img/dApp/book.png'
import CardanoSpot from '../../../assets/img/dApp/cardano-spot.png'
import CNS from '../../../assets/img/dApp/cns.png'
import Djed from '../../../assets/img/dApp/djed.png'
import FluidTokens from '../../../assets/img/dApp/fluidtokens.png'
import GeniusYield from '../../../assets/img/dApp/genius-yield.png'
import Google from '../../../assets/img/dApp/google.png'
import DEXHunter from '../../../assets/img/dApp/hunter.png'
import Iagon from '../../../assets/img/dApp/iagon.png'
import JamOnBread from '../../../assets/img/dApp/jam-on-bread.png'
import Lenfi from '../../../assets/img/dApp/lenfi.png'
import Levvy from '../../../assets/img/dApp/levvy.png'
import Liqwid from '../../../assets/img/dApp/liqwid.png'
import Minswap from '../../../assets/img/dApp/minswap.png'
import MuesliSwap from '../../../assets/img/dApp/muesliswap.png'
import Nucast from '../../../assets/img/dApp/nucast.png'
import OptionFlow from '../../../assets/img/dApp/optionflow.png'
import PXLZ from '../../../assets/img/dApp/pxlz.png'
import SundaeSwap from '../../../assets/img/dApp/sundaeswap.png'
import Taptools from '../../../assets/img/dApp/taptools.png'
import Wingriders from '../../../assets/img/dApp/wingriders.png'

export interface DAppItem {
  id: string
  name: string
  description?: string
  category: string
  logo: ImageSourcePropType
  uri: string
  origins: string[]
}

export const mockDAppList: DAppItem[] = [
  {
    id: 'cardano_spot',
    name: 'Cardano Spot',
    description: 'Join a global Cardano Community: a single space to communicate, engage, educate with Cardano',
    category: 'News',
    logo: CardanoSpot,
    uri: 'https://cardanospot.io/landing',
    origins: ['https://cardanospot.io'],
  },
  {
    id: 'minswap',
    name: 'Minswap',
    description: 'A decentralized exchange governed by a community that zaps',
    category: 'DEX',
    logo: Minswap,
    uri: 'https://minswap.org/',
    origins: ['https://minswap.org'],
  },
  {
    id: 'sundaeswap',
    name: 'SundaeSwap',
    description: 'Native, scalable decentralized exchange and automated liquidity provision protocol',
    category: 'DEX',
    logo: SundaeSwap,
    uri: 'https://sundae.fi/',
    origins: ['https://sondae.fi'],
  },
  {
    id: 'muesliswap',
    name: 'MuesliSwap',
    description: "Swap tokens, earn & invest  on Cardano's leading DeFi ecosystem",
    category: 'DEX',
    logo: MuesliSwap,
    uri: 'https://muesliswap.com/',
    origins: ['https://muesliswap.com'],
  },
  {
    id: 'geniusyield',
    name: 'GeniusYield',
    description: 'The all-in-one platform, that combines an order book DEX with an automated yield optimizer.',
    category: 'DEX',
    logo: GeniusYield,
    uri: 'https://www.geniusyield.co/',
    origins: ['https://www.geniusyield.co'],
  },
  {
    id: 'wingriders',
    name: 'Wingriders',
    description: 'Native and fast AMM decentralized exchange platform',
    category: 'DEX',
    logo: Wingriders,
    uri: 'https://www.wingriders.com/',
    origins: ['https://www.wingriders.com'],
  },
  {
    id: 'dex_hunter',
    name: 'DEX Hunter',
    description: 'Biggest Cardano DEX Aggregator with real-time alerts and an easy to use interface',
    category: 'DEX',
    logo: DEXHunter,
    uri: 'https://www.dexhunter.io/',
    origins: ['https://www.dexhunter.io'],
  },
  {
    id: 'ada_markets',
    name: 'ADA Markets',
    description: 'DEX Aggregator getting you the best value swaps / splits across Cardano DEXes',
    category: 'DEX',
    logo: ADAMarkets,
    uri: 'https://ada.markets/',
    origins: ['https://ada.markets'],
  },
  {
    id: 'ada_handle',
    name: 'ADA Handle',
    description: 'NFT-powered naming solution for your Cardano wallet address',
    category: 'Identity',
    logo: ADAHandle,
    uri: 'https://adahandle.com/',
    origins: ['https://adahandle.com'],
  },
  {
    id: 'cns',
    name: 'CNS',
    description: 'Decentralized name registry and social graph creation',
    category: 'Identity',
    logo: CNS,
    uri: 'https://cns.space/',
    origins: ['https://cns.space'],
  },
  {
    id: 'book_io',
    name: 'Book.io',
    description: 'A Web3 marketplace for buying, reading, and selling eBooks and Audiobooks',
    category: 'entertainment',
    logo: Book,
    uri: 'https://book.io/',
    origins: ['https://book.io'],
  },
  {
    id: 'nucast',
    name: 'Nucast',
    description: 'Nest generation video streaming and ownership platform',
    category: 'Entertainment',
    logo: Nucast,
    uri: 'https://www.nucast.io/',
    origins: ['https://www.nucast.io'],
  },
  {
    id: 'taptools',
    name: 'Taptools',
    description: 'Chart analysis, wallet profiler, and portfolio tracker on Cardano',
    category: 'Trading Tools',
    logo: Taptools,
    uri: 'https://www.taptools.io/',
    origins: ['https://www.taptools.io'],
  },
  {
    id: 'jpg_store',
    name: 'JPG Store',
    description: "Buy and sell NFTs on Cardano's most popular NFT marketplace",
    category: 'NFT Marketplace',
    logo: Taptools,
    uri: 'https://www.jpg.store/',
    origins: ['https://www.jpg.store'],
  },
  {
    id: 'jam_on_bread',
    name: 'JAM ON BREAD',
    description: 'Decentralized NFT marketplace and aggregator',
    category: 'NFT Marketplace',
    logo: JamOnBread,
    uri: 'https://jamonbread.io/',
    origins: ['https://jamonbread.io'],
  },
  {
    id: 'pxlz',
    name: 'PXLZ',
    description: 'The first interactive NFT collectibles on the Cardano blockchain',
    category: 'NFT Marketplace',
    logo: PXLZ,
    uri: 'https://pxlz.org/',
    origins: ['https://pxlz.org'],
  },
  {
    id: 'liqwid',
    name: 'Liqwid',
    description: 'Earn interest, borrow assets, and build on the most hydrated liquidity protocol on Cardano',
    category: 'DeFi',
    logo: Liqwid,
    uri: 'https://liqwid.finance/',
    origins: ['https://liqwid.finance'],
  },
  {
    id: 'lenfi',
    name: 'Lenfi',
    description: 'Permissionless lending, borrowing, liquidity pool creation, and more',
    category: 'DeFi',
    logo: Lenfi,
    uri: 'https://lenfi.io/',
    origins: ['https://lenfi.io'],
  },
  {
    id: 'fluidtokens',
    name: 'FluidTokens',
    description: 'Lend, borrow, rent, and boost',
    category: 'DeFi',
    logo: FluidTokens,
    uri: 'https://fluidtokens.com/',
    origins: ['https://fluidtokens.com'],
  },
  {
    id: 'levvy',
    name: 'Levvy',
    description: 'Lend and borrow with NFTs and Tokens',
    category: 'DeFi',
    logo: Levvy,
    uri: 'https://levvy.fi/',
    origins: ['https://levvy.fi'],
  },
  {
    id: 'optionflow',
    name: 'OptionFlow',
    description: 'A Decentralized Option Protocol on the Cardano Blockchain',
    category: 'DeFi',
    logo: OptionFlow,
    uri: 'https://app.optionflow.finance/',
    origins: ['https://app.optionflow.finance'],
  },
  {
    id: 'djed',
    name: 'Djed',
    description: "Cardano's native overcollateralized stablecoin, developed by IOG and powered by COTI",
    category: 'Stablecoin',
    logo: Djed,
    uri: 'https://djed.xyz/',
    origins: ['https://djed.xyz'],
  },
  {
    id: 'iagon',
    name: 'Iagon',
    description: 'A cloud computing platform offering access to decentralized storage and compute',
    category: 'Decentralised Storage',
    logo: Iagon,
    uri: 'https://iagon.com/',
    origins: ['https://iagon.com'],
  },
]

export const GOOGLE_DAPP_ID = 'google_search'

export const getGoogleSearchItem = (searchQuery: string): DAppItem => ({
  id: GOOGLE_DAPP_ID,
  name: searchQuery,
  description: 'Google',
  category: 'search',
  logo: Google,
  uri: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
  origins: ['https://www.google.com'],
})
