### Getting set up with Superfluid SDK

in `/packages/contracts` add your MNEMONIC to the `.env` file.

```bash
npx truffle --network goerli console

# load libraries
SuperfluidSDK = require("@superfluid-finance/ethereum-contracts")
const { toWad, toBN, fromWad, wad4human } = require("@decentral.ee/web3-helpers")

# Initialize the Superfluid SDK
sf = new SuperfluidSDK.Framework({version: "0.1.2-preview-20201014", web3Provider: web3.currentProvider })

# Alias your accounts
bob = accounts[0]
alice = accounts[1]
dan = accounts[2]

# Get the token addresses
daiAddress = await sf.resolver.get("tokens.fDAI");
dai = await sf.contracts.TestToken.at(daiAddress);
daixWrapper = await sf.getERC20Wrapper(dai);
daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress);

# Mint yourself some DAI
dai.mint(bob, web3.utils.toWei("100", "ether"), { from: bob })
(async () => (wad4human(await dai.balanceOf(bob))))()

# Approve and Upgrade your DAI to DAIx
dai.approve(daix.address, "1"+"0".repeat(42), { from: bob })
daix.upgrade(web3.utils.toWei("50", "ether"), { from: bob })
(async () => (wad4human(await daix.balanceOf(bob))))()

# You are now ready to start bidding!
```
