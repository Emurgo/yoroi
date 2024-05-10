import BigNumber from 'bignumber.js'

import {parseInputToBigInt} from './parse-input-to-bigint'

describe('parse-input-to-bigint', () => {
  it('parseInputToBigInt', () => {
    const english = {
      prefix: '',
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
      secondaryGroupSize: 0,
      fractionGroupSize: 0,
      fractionGroupSeparator: ' ',
      suffix: '',
    }

    const italian = {
      ...english,
      decimalSeparator: ',',
      groupSeparator: ' ',
    }

    BigNumber.config({
      FORMAT: italian,
    })

    expect(
      parseInputToBigInt({input: '', decimalPlaces: 3, format: italian}),
    ).toEqual(['', 0n])
    expect(
      parseInputToBigInt({input: ',', decimalPlaces: 3, format: italian}),
    ).toEqual(['0,', 0n])
    expect(
      parseInputToBigInt({input: '1', decimalPlaces: 3, format: italian}),
    ).toEqual(['1', 1000n])
    expect(
      parseInputToBigInt({input: '123,55', decimalPlaces: 3, format: italian}),
    ).toEqual(['123,55', 123550n])
    expect(
      parseInputToBigInt({
        input: '1234,6666',
        decimalPlaces: 3,
        format: italian,
      }),
    ).toEqual(['1 234,666', 1234666n])
    expect(
      parseInputToBigInt({input: '55,', decimalPlaces: 3, format: italian}),
    ).toEqual(['55,', 55000n])
    expect(
      parseInputToBigInt({input: '55,0', decimalPlaces: 3, format: italian}),
    ).toEqual(['55,0', 55000n])
    expect(
      parseInputToBigInt({input: '55,10', decimalPlaces: 3, format: italian}),
    ).toEqual(['55,10', 55100n])
    expect(
      parseInputToBigInt({
        input: 'ab1.5c,6.5',
        decimalPlaces: 3,
        format: italian,
      }),
    ).toEqual(['15,65', 15650n])

    BigNumber.config({FORMAT: english})

    expect(
      parseInputToBigInt({input: '', decimalPlaces: 3, format: english}),
    ).toEqual(['', 0n])
    expect(
      parseInputToBigInt({input: '1', decimalPlaces: 3, format: english}),
    ).toEqual(['1', 1000n])
    expect(
      parseInputToBigInt({input: '123.55', decimalPlaces: 3, format: english}),
    ).toEqual(['123.55', 123550n])
    expect(
      parseInputToBigInt({
        input: '1234.6666',
        decimalPlaces: 3,
        format: english,
      }),
    ).toEqual(['1,234.666', 1234666n])
    expect(
      parseInputToBigInt({input: '55.', decimalPlaces: 3, format: english}),
    ).toEqual(['55.', 55000n])
    expect(
      parseInputToBigInt({input: '55.0', decimalPlaces: 3, format: english}),
    ).toEqual(['55.0', 55000n])
    expect(
      parseInputToBigInt({input: '55.10', decimalPlaces: 3, format: english}),
    ).toEqual(['55.10', 55100n])
    expect(
      parseInputToBigInt({
        input: 'ab1.5c,6.5',
        decimalPlaces: 3,
        format: english,
      }),
    ).toEqual(['1.56', 1560n])

    expect(
      parseInputToBigInt({
        input: '1.23456',
        decimalPlaces: 0,
        format: english,
        precision: 3,
      }),
    ).toEqual(['1.234', 1n])
    expect(
      parseInputToBigInt({
        input: '1.23456',
        decimalPlaces: 2,
        format: english,
        precision: 3,
      }),
      // how? simple, precision of 3 keep 1.234, 2 decimals drop the 4, toFixed 0
      // 123 with 2 decimals = 1.23
      // so be mindfull when using precision and decimalPlaces together
    ).toEqual(['1.234', 123n])
  })
})
