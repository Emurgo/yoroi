import { ImageSourcePropType } from 'react-native';

import ADAHandle from '../../../../assets/img/dApp/ada-handle.png';
import ADAMarkets from '../../../../assets/img/dApp/ada-markets.png';
import Book from '../../../../assets/img/dApp/book.png';
import CardanoSpot from '../../../../assets/img/dApp/cardano-spot.png';
import CNS from '../../../../assets/img/dApp/cns.png';
import GeniusYield from '../../../../assets/img/dApp/genius-yield.png';
import Google from '../../../../assets/img/dApp/google.png';
import DEXHunter from '../../../../assets/img/dApp/hunter.png';
import Minswap from '../../../../assets/img/dApp/minswap.png';
import MuesliSwap from '../../../../assets/img/dApp/muesliswap.png';
import Nucast from '../../../../assets/img/dApp/nucast.png';
import SundaeSwap from '../../../../assets/img/dApp/sundaeswap.png';
import Wingriders from '../../../../assets/img/dApp/wingriders.png';

export const DAppCategory = {
  dex: 'DEX',
  news: 'News',
  identity: 'Identity',
  entertainment: 'Entertainment',
  trading: 'Trading Tools',
  nft: 'NFT Marketplace',
  defi: 'DeFi',
  dao: 'DAO',
  stablecoin: 'Stablecoin', 
  storage: 'Decentralized Storage'
} as const

export type TDAppCategory = keyof typeof DAppCategory

export interface IDAppItem {
  name: string;
  description?: string;
  category?: TDAppCategory;
  logo: ImageSourcePropType;
}


export const mockDAppList: IDAppItem[] = [
  {
    name: 'Cardano Spot',
    description: 'Latest  Cardano updates and news, projects and many more just in one place',
    category: 'news',
    logo: CardanoSpot,
  },
  {
    name: 'Minswap',
    description: 'A decentralized exchange governed by a community that zaps',
    category: 'dex',
    logo: Minswap,
  },
  {
    name: 'SundaeSwap',
    description: 'Native, scalable decentralized exchange and automated liquidity provision protocol',
    category: 'dex',
    logo: SundaeSwap,
  },
  {
    name: 'MuesliSwap',
    description: 'Swap tokens, earn & invest  on Cardano\'s leading DeFi ecosystem',
    category: 'dex',
    logo: MuesliSwap,
  },
  {
    name: 'GeniusYield',
    description: 'The all-in-one platform, that combines an order book DEX with an automated yield option',
    category: 'dex',
    logo: GeniusYield,
  },
  {
    name: 'Wingriders',
    description: 'Native and fast AMM decentralized exchange platform',
    category: 'dex',
    logo: Wingriders,
  },
  {
    name: 'DEX Hunter',
    description: 'Biggest Cardano DEX Aggregator with real-time alerts and an easy to use interface',
    category: 'dex',
    logo: DEXHunter,
  },
  {
    name: 'ADA Markets',
    description: 'A one stop platform to give you easy access to trading on Cardano with an algo that works out',
    category: 'dex',
    logo: ADAMarkets,
  },
  {
    name: 'ADA Handle',
    description: 'A one stop platform to give you easy access to trading on Cardano with an algo that works out',
    category: 'identity',
    logo: ADAHandle,
  },
  {
    name: 'CNS',
    description: 'Decentralized name registry and social graph creation',
    category: 'identity',
    logo: CNS,
  },
  {
    name: 'Book.io',
    description: 'A Web3 marketplace for buying, reading, and selling eBooks and Audiobooks',
    category: 'entertainment',
    logo: Book,
  },
  {
    name: 'Nucast',
    description: 'Nest generation video streaming and ownership platform',
    category: 'entertainment',
    logo: Nucast,
  },
];

export const mockDAppGoogle = (searchQuery: string) => ({
  name: searchQuery,
  description: 'Google',
  logo: Google,
})
