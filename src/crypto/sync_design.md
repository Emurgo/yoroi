# Wallet design doc

The purpose of this memo is to document how and why our implementation of Cardano wallet works. Our wallet works on HD-wallet (Hierarchical Deterministic) principle and as such it is important to first discuss the central invariant these wallets must hold in order to be recoverable.

## Preliminaries

A HD-wallet is defined by its *master key* from which we can derive several *accounts*. Each account provides two lists (chains) of addresses. These are *external* addresses (used for receiving money) and *internal* addresses (sometimes called *change* addresses; this is where the wallet typically sends a transaction change). It is important to note that addresses in both chains needs to be used in a semi-sequential manner so that they can be retrieved in case the wallet needs to be restored from a backup. This is so because given an v2 address the owner of a wallet cannot easily check whether the address belongs to some of its accounts (the account->addresses is a one-way cryptographic function)

We will say that a set of addresses is *gapLimit*-recoverable if and only if for each address *A_i* (at index *i* in the chain) there
1) either *i <= gapLimit*; or
2) there exists index *j* such that *A_j* is in the set and *j < i <= j + gapLimit*

Given an account that is *gapLimit*-recoverable, there is a simple and efficient algorithm to recover all used addresses: Simply iterate sequentially over the addresses until last *gapLimit* addresses are all unused, then stop.

The goal of the wallet is therefore to ensure, for some well-agreed constant *gapLimit*, the *gapLimit*-recoverability during all of its lifetime. 

### A strawman approach

Before we can proceed, let us discuss a strawman solution. In this solution a wallet keeps at most *gapLimit* unused external addresses which are shown to the user. Once the wallet observes a transaction on one of these unused external addresses, it will mark it as used and allows the user to generate another address.

Management of internal addresses is similar, albeit more simple as the wallet needs to keep just a single temporarily-unused address (internal addresses are never shown to the user and, assuming we do not process concurrent outgoing transactions, the wallet just needs a single new change address). We will therefore focus next discussion only on the external addresses

### Problem with concurrent wallet instances

The main problem with the strawman approach is that it fails to properly synchronize in case there are multiple wallet instances using the same master key. In such scenario, it can happen that instance *A* generates a new internal or external address (this address is still within gap limit) and uses it in a transaction. Unfortunately, instance *B* did not generate this address yet and thus it is not observing it, resulting in a missed transaction.

The solution here is for a wallet to monitor transactions on all addresses until *A_{lastUsed + gapLimit}*. Once the wallet registers a (succesful) transaction *A_i* with *i > lastUsed*, it needs to update *lastUsed* and start monitoring the new addresses that fall into *lastUsed + gapLimit* limit.

With the new approach, whenever one wallet instance generates a transaction **within** *gapLimit*, the other instance will be able to properly discover the transaction and synchronize address views.

### Concurrent addresses revisited

Our design so far has a fatal flaw. Whenever one instance starts rapidly generating transactions that skip large portions of address space (but stays within gap limit), the second instance might not catch up with the address discovery if it observes **only new** transactions. As such, each time an address is "discovered" (i.e., it falls within *lastUsed + gapLimit*, we need to query the history for **all past transactions** on that address). Note that this also helps with the cases where the wallet was damaged (gap limit invariant does not hold and we just stumble across an address that was out of our initial reach)

Also note that the wallet **can monitor more** than *lastUsed + gapLimit* addresses. (It should not use them for sending though!)

### Fetching transaction history

Both at the recovery and normal wallet function we might need to fetch transaction history that is too large (or slow) to return in a single request. In this case we would like to incrementally synchronize wallet state. To do this, we need to keep *lastUpdatedTime* per address. It is important to stress that this information needs to be **per address** (see later for a relaxation of this) as any newly-discovered address needs to start fetching history from the beginning. Also, different addresses might end up being synchronize up to different times. Once we fetch new transactions (for an address), we update *lastUpdatedTime* accordingly.

Implementation note: The *lastUpdatedTime* for an address **cannot** be recovered from a set of synchronized transactions. This is because a transaction can involve several of our addresses and thus it is not clear *for which addresses* this is the last transaction. (It might happen that the same transaction is the last synchronized transaction for address A but there are more unsynchronized transactions for address B)
Note that addresses might be synchronized in parallel. The only requirement is that any new transaction that uses address behind last used address need to properly update *lastUsed* and initialize newly discovered addresses.

### Fetching transaction history - a compromise

Keeping *lastUpdatedTime* per address and querying API endpoint with different query times is too much of an overkill, especially because the current Yoroi backend API doesn't have such bulk endpoint. Instead, what we can do is to **group addresses into buckets** that have the same *lastUpdatedTime* and we query the whole bucket at once.

Because addresses in the bucket share *lastUpdatedTime* **buckets cannot change** over time (otherwise we would get addresses with mismatching *lastUpdatedTime*). At first this seems like a problem because newly discovered addresses always start from zero time. Fortunately, as noted earlier, **we can discover and monitor more addresses** than *lastUpdated + gapLimit*

As such, our proposed solution is to discover and monitor addresses in buckets of constant size (denoted *BlockSize*)

### Recovering a wallet - speedup idea, not to be implemented

The logic which we have shown so far (monitor discovered addresses and from them discover new used addresses) works fine but it is a bit slow to sync all used addresses. Discovering new addresses and synchronizing transactions on them are independent operations (apart from the fact that new transactions might reveal new used addresses). As such, the  wallet might at any time discover new addresses simply by asking API endpoint if they are used. The wallet should do this in the *blockSize* sized blocks to be compatible with the Tx syncing.

We won't implement this functionality, mainly because of race-bug concerns between normal syncing and rapid discovery code. Additionally, rapid discovery might violate invariants we set up in the next section.

### The things that could go wrong

So far we have described how to synchronize wallet when the transactions go happy-path. Unfortunately, the nature of blockchain allows transactions to be rolled back and fail. This scenario poses a several threats to the gap limit invariant the wallet tries to keep.

In particular, what could happen is that a transaction gets rolled back and thus it turns an used address into an unused. (Unfortunately, other instances of the wallet (in particular ones not backed up by Yoroi backend)  might miss the transaction being rolled back as failed transactions do not make it into the ledger.

What happens in this case is that **a followup transaction** might be sucesful but use addresses which are out of the gap limit once the original transaction rolls back. While there isn't much we can do if this happens, we can try to avoid the scenario in three ways:
1) do *not* mark addresses as used until it can be reasonably assumed they won't be rolled back (i.e. high assurance level). This strategy might be best for external addresses
2) be lenient when discovering used addresses. In particular, we can (and probably should) use higher gap limit for discovery than we try to enforce. This strategy is particularly good for internal addresses as we just use them sequentially and thus their "intended" gap limit is 0. Note that this does not cure problem, only the symptoms -- if the gap limit invariant is broken, different wallet implementations might see different state of the wallet depending on how lenient are they.
3) We should not allow quick jumps through the address space. In theory, a wallet can generate and show to the user (or use internalliy for change) **all** *lastUsed + gapLimit* addresses of the chain. A conservative solution would however always show **only first gapLimit unused addresses**. Note that if the gap limit invariant is ever broken, the second strategy forces user to eventually repair the invariant.
