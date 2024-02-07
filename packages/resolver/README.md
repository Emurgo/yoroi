# Yoroi Resolver Module

A module for resolving Cardano addresses from domains or handles.

Currently, the following services are supported:

- [CNS](https://cns.space)
- [handle](https://handle.me)
- [Unstoppable Domains](https://unstoppabledomains.com)

## Instalation

`yarn install @yoroi/resolver`

or

`npm install @yoroi/resolver`

## Usage

There are two strategies supported to get a crypto address:

- **all**: Will attempt to resolve on all services.

Response: `[{nameServer: 'cns', address: string | null, error: Error instance | null}, {nameServer: 'unstoppable', address: string | null, error: Error instance | null}, {nameServer: 'handle', address: string | null, error: Error instance | null}]`

- **first**: Will return the service that resolves first.

Response: `[{nameServer: 'cns' | 'unstoppable' | 'handle', address: string | null, error: Error instance | null}]`

## API Reference

- **`resolverApiMaker`**

Accepted arguments:

  1. apiConfig: `{unstoppable: '<unstoppable api key>'}`
  2. cslFactory: Cardano Serialization Library initiator

Returns: `getCardanoAddresses`


 - **`getCardanoAddresses`**

Accepted arguments:

  1. resolve: `string`. Domain or handle to look for.
  2. strategy: `all` | `first`

Returns depending on the strategy selected:

All:

`[{nameServer: 'cns', address: string | null, error: Error instance | null}, {nameServer: 'unstoppable', address: string | null, error: Error instance | null}, {nameServer: 'handle', address: string | null, error: Error instance | null}]`

First:

`[{nameServer: 'cns' | 'unstoppable' | 'handle', address: string | null, error: Error instance | null}]`
