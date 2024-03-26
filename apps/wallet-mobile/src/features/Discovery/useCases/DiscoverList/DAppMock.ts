import { ImageSourcePropType } from 'react-native';

import ADAHandle from '../../../../assets/img/dApp/ada-handle.png';
import ADAMarkets from '../../../../assets/img/dApp/ada-markets.png';
import Book from '../../../../assets/img/dApp/book.png';
import CardanoSpot from '../../../../assets/img/dApp/cardano-spot.png';
import CNS from '../../../../assets/img/dApp/cns.png';
import Djed from '../../../../assets/img/dApp/djed.png';
import FluidTokens from '../../../../assets/img/dApp/fluidtokens.png';
import GeniusYield from '../../../../assets/img/dApp/genius-yield.png';
import Google from '../../../../assets/img/dApp/google.png';
import DEXHunter from '../../../../assets/img/dApp/hunter.png';
import Iagon from '../../../../assets/img/dApp/iagon.png';
import JamOnBread from '../../../../assets/img/dApp/jam-on-bread.png';
import Lenfi from '../../../../assets/img/dApp/lenfi.png';
import Levvy from '../../../../assets/img/dApp/levvy.png';
import Liqwid from '../../../../assets/img/dApp/liqwid.png';
import Minswap from '../../../../assets/img/dApp/minswap.png';
import MuesliSwap from '../../../../assets/img/dApp/muesliswap.png';
import Nucast from '../../../../assets/img/dApp/nucast.png';
import OptionFlow from '../../../../assets/img/dApp/optionflow.png';
import PXLZ from '../../../../assets/img/dApp/pxlz.png';
// import Summon from '../../../../assets/img/dApp/summon.png';
import SundaeSwap from '../../../../assets/img/dApp/sundaeswap.png';
import Taptools from '../../../../assets/img/dApp/taptools.png';
import Wingriders from '../../../../assets/img/dApp/wingriders.png';

export const DAppCategory = {
  dex: 'DEX',
  media: 'Social Media',
  identity: 'Identity',
  entertainment: 'Entertainment',
  trading: 'Trading Tools',
  nft: 'NFT Marketplace',
  defi: 'DeFi',
  dao: 'DAO',
  stablecoin: 'Stablecoin', 
  decentralized_storage: 'Decentralized Storage'
} as const

export type TDAppCategory = keyof typeof DAppCategory

export interface IDAppItem {
  id: string,
  name: string;
  description?: string;
  category?: TDAppCategory;
  logo: ImageSourcePropType;
}


export const mockDAppList: IDAppItem[] = [
  {
    id: 'cardano_spot',
    name: 'Cardano Spot',
    description: 'Join a global Cardano Community: a single space to communicate, engage, educate with Cardano',
    category: 'media',
    logo: CardanoSpot,
  },
  {
    id: 'minswap',
    name: 'Minswap',
    description: 'A decentralized exchange governed by a community that zaps',
    category: 'dex',
    logo: Minswap,
  },
  {
    id: 'sundaeswap',
    name: 'SundaeSwap',
    description: 'Native, scalable decentralized exchange and automated liquidity provision protocol',
    category: 'dex',
    logo: SundaeSwap,
  },
  {
    id: 'muesliswap',
    name: 'MuesliSwap',
    description: 'Swap tokens, earn & invest  on Cardano\'s leading DeFi ecosystem',
    category: 'dex',
    logo: MuesliSwap,
  },
  {
    id: 'geniusyield',
    name: 'GeniusYield',
    description: 'The all-in-one platform, that combines an order book DEX with an automated yield optimizer.',
    category: 'dex',
    logo: GeniusYield,
  },
  {
    id: 'wingriders',
    name: 'Wingriders',
    description: 'Native and fast AMM decentralized exchange platform',
    category: 'dex',
    logo: Wingriders,
  },
  {
    id: 'dex_hunter',
    name: 'DEX Hunter',
    description: 'Biggest Cardano DEX Aggregator with real-time alerts and an easy to use interface',
    category: 'dex',
    logo: DEXHunter,
  },
  {
    id: 'ada_markets',
    name: 'ADA Markets',
    description: 'DEX Aggregator getting you the best value swaps / splits across Cardano DEXes',
    category: 'dex',
    logo: ADAMarkets,
  },
  {
    id: 'ada_handle',
    name: 'ADA Handle',
    description: 'NFT-powered naming solution for your Cardano wallet address',
    category: 'identity',
    logo: ADAHandle,
  },
  {
    id: 'cns',
    name: 'CNS',
    description: 'Decentralized name registry and social graph creation',
    category: 'identity',
    logo: CNS,
  },
  {
    id: 'book_io',
    name: 'Book.io',
    description: 'A Web3 marketplace for buying, reading, and selling eBooks and Audiobooks',
    category: 'entertainment',
    logo: Book,
  },
  {
    id: 'nucast',
    name: 'Nucast',
    description: 'Nest generation video streaming and ownership platform',
    category: 'entertainment',
    logo: Nucast,
  },
  {
    id: 'taptools',
    name: 'Taptools',
    description: 'Chart analysis, wallet profiler, and portfolio tracker on Cardano',
    category: 'trading',
    logo: Taptools,
  },
  {
    id: 'jpg_store',
    name: 'JPG Store',
    description: 'Buy and sell NFTs on Cardano\'s most popular NFT marketplace',
    category: 'nft',
    logo: Taptools,
  },
  {
    id: 'jam_on_bread',
    name: 'JAM ON BREAD',
    description: 'Decentralized NFT marketplace and aggregator',
    category: 'nft',
    logo: JamOnBread,
  },
  {
    id: 'pxlz',
    name: 'PXLZ',
    description: 'The first interactive NFT collectibles on the Cardano blockchain',
    category: 'nft',
    logo: PXLZ,
  },
  {
    id: 'liqwid',
    name: 'Liqwid',
    description: 'Earn interest, borrow assets, and build on the most hydrated liquidity protocol on Cardano',
    category: 'defi',
    logo: Liqwid,
  },
  {
    id: 'lenfi',
    name: 'Lenfi',
    description: 'Permissionless lending, borrowing, liquidity pool creation, and more',
    category: 'defi',
    logo: Lenfi,
  },
  {
    id: 'fluidtokens',
    name: 'FluidTokens',
    description: 'Lend, borrow, rent, and boost',
    category: 'defi',
    logo: FluidTokens,
  },
  {
    id: 'levvy',
    name: 'Levvy',
    description: 'Lend and borrow with NFTs and Tokens',
    category: 'defi',
    logo: Levvy,
  },
  {
    id: 'optionflow',
    name: 'OptionFlow',
    description: 'A Decentralized Option Protocol on the Cardano Blockchain',
    category: 'defi',
    logo: OptionFlow,
  },
  // {
  //   id: 'summon',
  //   name: 'Summon',
  //   description: 'Cardano DAO tooling platform',
  //   category: 'dao',
  //   logo: Summon,
  // },
  {
    id: 'djed',
    name: 'Djed',
    description: 'Cardano\'s native overcollateralized stablecoin, developed by IOG and powered by COTI',
    category: 'stablecoin',
    logo: Djed,
  },
  {
    id: 'iagon',
    name: 'Iagon',
    description: 'A cloud computing platform offering access to decentralized storage and compute',
    category: 'decentralized_storage',
    logo: Iagon,
  },
];

export const mockDAppGoogle = (searchQuery: string): IDAppItem => ({
  id: 'google_search',
  name: searchQuery,
  description: 'Google',
  logo: Google,
})
