# Solana VotingDApp

## Project Description

This Solana-based voting system is a decentralized application (dApp) that enables transparent and secure polling and voting mechanisms using blockchain technology. The project provides a robust, transparent, and tamper-resistant voting platform built on the Solana blockchain.

### Deployed program
- [Solana explorer](https://explorer.solana.com/address/HcPzBYe1hHF6eNzsr2abxjFfRWD5QfZa4J9UCZjNyy64?cluster=devnet)

### Key Features
- Create polls with custom options
- Cast votes securely
- Prevent duplicate voting
- Poll closure functionality
- Transparent vote tracking

## System Workflow
**Poll Creation**
   - Authenticated users can create polls
   - Define poll title, description, and voting options
   - Generate a unique Program Derived Address (PDA) for each poll

**Voting Mechanism**
   - Users can cast a single vote per poll
   - Votes are immutably recorded on-chain
   - Duplicate voting is prevented

**Poll Management**
   - Poll creators can close polls
   - Prevents further voting after closure
   - Maintains vote integrity


### Setup
For this you need:
- [Rust installed](https://www.rust-lang.org/tools/install)
    - Make sure to use stable version:
    ```bash
    rustup default stable
    ```
- [Solana installed](https://docs.solana.com/cli/install-solana-cli-tools)
    - Use v1.18.18
    - After you have Solana-CLI installed, you can switch between versions using:
    ```bash
    solana-install init 1.18.18
    ```

- [Anchor installed](https://www.anchor-lang.com/docs/installation)
    - Use v0.30.1
    - After you have Anchor installed, you can switch between versions using:
    ```bash
    avm use 0.30.1
    ```

### Commands
With the setup described above, you should be able to run the following commands.

- You should have **Yarn** installed as it is one of the steps during **Anchor** installation, so once you clone the repo, you should be able to run:
```
yarn install
```

- To build the project, run:
```
anchor build
```

- To test the project, run:
```
anchor test
```


## Security Considerations
- Implemented PDA-based access control
- Prevents duplicate voting
- Immutable vote recording
