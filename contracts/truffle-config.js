const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
const GAS_LIMIT = 8e7

module.exports = {
  networks: {
    goerli: {
      provider: () =>
        new HDWalletProvider(
          process.env.GOERLI_MNEMONIC,
          process.env.GOERLI_PROVIDER_URL
        ),
      network_id: 5, // Goerli's id
      gas: GAS_LIMIT,
      gasPrice: 10e8, // 1 GWEI
      //confirmations: 6, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 50, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: false, // Skip dry run before migrations? (default: false for public nets )
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.7.0', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
  },
}
