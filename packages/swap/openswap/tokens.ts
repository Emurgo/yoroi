import axios from 'axios';

export type Token = {
  info: {
    supply: {
      total: string; // total circulating supply of the token, without decimals.
      circulating: string | null; // if set the circulating supply of the token, if null the amount in circulation is unknown.
    };
    status: 'verified' | 'unverified' | 'scam' | 'outdated';
    address: {
      policyId: string; // policy id of the token.
      name: string; // hexadecimal representation of token name.
    };
    symbol: string; // shorthand token symbol.
    image?: string; // http link to the token image.
    website: string;
    description: string;
    decimalPlaces: number; // number of decimal places of the token, i.e. 6 for ADA and 0 for MILK.
    categories: string[]; // encoding categories as ids.
  };
  price: {
    volume: {
      base: number; // float, trading volume 24h in base currency (e.g. ADA).
      quote: number; // float, trading volume 24h in quote currency.
    };
    volumeChange: {
      base: number; // float, percent change of trading volume in comparison to previous 24h.
      quote: number; // float, percent change of trading volume in comparison to previous 24h.
    };
    price: number; // live trading price in base currency (e.g. ADA).
    askPrice: number; // lowest ask price in base currency (e.g. ADA).
    bidPrice: number; // highest bid price in base currency (e.g. ADA).
    priceChange: {
      '24h': number; // float, price change last 24 hours.
      '7d': number; // float, price change last 7 days.
    };
    quoteDecimalPlaces: number; // decimal places of quote token.
    baseDecimalPlaces: number; // decimal places of base token.
    price10d: number[]; //float, prices of this tokens averaged for the last 10 days, in chronological order i.e.oldest first.
  };
};

const client = axios.create({
  baseURL: 'https://api.muesliswap.com',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'applicatio/json',
  },
});

/**
 * @param policyId the policy id of the base token to calculate the price for in hexadecimal representation.
 * @param assetName the asset name of the base token to calculate the price for in hexadecimal representation.
 * @returns a list of tokens supported by MuesliSwap.
 */
export const getTokens = async (
  policyId = '',
  assetName = ''
): Promise<Token[]> => {
  const response = await client.get(
    `/list?base-policy-id=${policyId}&base-tokenname=${assetName}`
  );

  if (response.status !== 200) {
    throw new Error('Failed to fetch tokens', { cause: response.data });
  }

  return response.data;
};
