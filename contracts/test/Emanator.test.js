const { web3tx, toWad, toBN, wad4human } = require('@decentral.ee/web3-helpers')
const { time, expectRevert } = require('@openzeppelin/test-helpers')
const deployFramework = require('@superfluid-finance/ethereum-contracts/scripts/deploy-framework')
const deployTestToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-test-token')
const deploySuperToken = require('@superfluid-finance/ethereum-contracts/scripts/deploy-super-token')
const SuperfluidSDK = require('@superfluid-finance/ethereum-contracts')
const Emanator = artifacts.require('Emanator')

contract('Emanator', (accounts) => {
  const errorHandler = (err) => {
    if (err) throw err
  }

  const ZERO_ADDRESS = '0x' + '0'.repeat(40)
  const MINIMUM_GAME_FLOW_RATE = toWad(10).div(toBN(3600 * 24 * 30))
  const WIN_LENGTH = 20 // seconds

  accounts = accounts.slice(0, 4)
  const [creator, bob, carol, dan] = accounts

  let sf
  let dai
  let daix
  let app

  beforeEach(async function () {
    await deployFramework(errorHandler)

    sf = new SuperfluidSDK.Framework({ web3Provider: web3.currentProvider })
    await sf.initialize()

    if (!dai) {
      await deployTestToken(errorHandler, [':', 'fDAI'])
      const daiAddress = await sf.resolver.get('tokens.fDAI')
      dai = await sf.contracts.TestToken.at(daiAddress)
      for (let i = 0; i < accounts.length; ++i) {
        await web3tx(dai.mint, `Account ${i} mints many dai`)(
          accounts[i],
          toWad(10000000),
          { from: accounts[i] }
        )
      }
    }

    await deploySuperToken(errorHandler, [':', 'fDAI'])

    const daixWrapper = await sf.getERC20Wrapper(dai)
    daix = await sf.contracts.ISuperToken.at(daixWrapper.wrapperAddress)

    app = await web3tx(Emanator.new, 'Deploy Emanator')(
      sf.host.address,
      sf.agreements.cfa.address,
      sf.agreements.ida.address,
      daix.address,
      WIN_LENGTH
    )

    for (let i = 1; i < accounts.length; ++i) {
      await web3tx(dai.approve, `Account ${i} approves daix`)(
        daix.address,
        toWad(100000000),
        { from: accounts[i] }
      )
      await web3tx(daix.upgrade, `Account ${i} upgrades dai`)(toWad(100), {
        from: accounts[i],
      })
      await web3tx(
        daix.approve,
        `Account ${i} approves Emanator contract`
      )(app.address, toWad(100000000), { from: accounts[i] })
      await web3tx(
        sf.host.callAgreement,
        `Account ${i} approves subscription to the app`
      )(
        sf.agreements.ida.address,
        sf.agreements.ida.contract.methods
          .approveSubscription(daix.address, app.address, 0, '0x')
          .encodeABI(),
        {
          from: accounts[i],
        }
      )
    }
  })

  async function printRealtimeBalance(label, account) {
    const b = await daix.realtimeBalanceOfNow.call(account)
    console.log(`${label} realtime balance`, wad4human(b.availableBalance))
    return b
  }

  it('Deploys the contract', async () => {
    assert.equal(await app.getAuctionBalance.call(), 0)
    await web3tx(app.bid, `Account ${bob} bids 10`)(toWad(10), { from: bob })
    assert.equal(
      (await app.getAuctionBalance.call()).toString(),
      toWad(10).toString()
    )
  })

  it('sets Bob as the high bidder', async () => {
    assert.equal(await app.getHighBidder.call(), ZERO_ADDRESS)
    await web3tx(app.bid, `Account ${bob} bids 10`)(toWad(10), { from: bob })
    assert.equal((await app.getHighBidder.call()).toString(), bob.toString())
  })

  it('allows multiple bids', async () => {
    assert.equal(await app.getAuctionBalance.call(), 0)
    await web3tx(app.bid, `Account ${bob} bids 10`)(toWad(10), { from: bob })
    appRealtimeBalance = await printRealtimeBalance('App', app.address)
    await printRealtimeBalance('Bob', bob)
    let timeLeft = await app.checkTimeRemaining()
    console.log(timeLeft)
    await web3tx(app.bid, `Account ${carol} bids 20`)(toWad(20), {
      from: carol,
    })
    console.log(timeLeft)
    appRealtimeBalance = await printRealtimeBalance('App', app.address)
    await printRealtimeBalance('Carol', carol)
    assert.equal(
      (await app.getAuctionBalance.call()).toString(),
      toWad(30).toString()
    )
    assert.equal((await app.getHighBidder.call()).toString(), carol.toString())
  })

  it('does not allow bids after the auction is over', async () => {
    assert.equal(await app.getHighBidder.call(), ZERO_ADDRESS)
    await web3tx(app.bid, `Account ${bob} bids 10`)(toWad(10), { from: bob })
    let timeLeft = await app.checkTimeRemaining()
    time.increase(timeLeft + 1)
    await web3tx(app.bid, `Account ${carol} bids 20`)(toWad(20), {
      from: carol,
    })
      .then(assert.fail)
      .catch(function (error) {
        assert.include(
          error.message,
          'revert',
          'bids submitted after an auction ends should revert'
        )
      })
    assert.equal((await app.getHighBidder.call()).toString(), bob.toString())
  })

  it('allows settling an auction and starting a new auction', async () => {
    assert.equal(await app.getHighBidder.call(), ZERO_ADDRESS)
    await web3tx(app.bid, `Account ${bob} bids 10`)(toWad(10), { from: bob })
    let timeLeft = await app.checkTimeRemaining()
    time.increase(timeLeft + 1)
    await web3tx(
      app.settleAndBeginAuction,
      `Account ${bob} settles the auction`
    )({ from: bob })
    assert.equal(await app.currentGeneration.call(), '2')
  })

  it('transfers 70% of the second auction revenue to the creator and 30% to the winner of auction 1', async () => {
    assert.equal(await app.getHighBidder.call(), ZERO_ADDRESS)
    await printRealtimeBalance('Auction Contract', app.address)
    await printRealtimeBalance('Creator', creator)
    await printRealtimeBalance('Bob', bob)
    await printRealtimeBalance('Dan', dan)
    await printRealtimeBalance('Carol', carol)

    ////// NEW AUCTION - Generation 1 /////
    console.log(
      `======= New auction - Generation ${await app.currentGeneration.call()} =======`
    )
    await web3tx(app.bid, `Bob bids 1`)(toWad(1), { from: bob })
    let timeLeft = await app.checkTimeRemaining()
    time.increase(timeLeft + 1)
    await printRealtimeBalance('Auction Contract', app.address)
    await web3tx(
      app.settleAndBeginAuction,
      `Bob settles the auction`
    )({ from: bob }).then(console.log)
    await printRealtimeBalance('Auction Contract', app.address)
    await printRealtimeBalance('Creator', creator)
    await printRealtimeBalance('Bob', bob)

    ////// NEW AUCTION - Generation 2 /////
    console.log(
      `======= New auction - Generation ${await app.currentGeneration.call()} =======`
    )
    await web3tx(app.bid, `Carol bids 10`)(toWad(10), { from: carol })
    time.increase(timeLeft + 1)
    await printRealtimeBalance('Auction Contract', app.address)
    await web3tx(
      app.settleAndBeginAuction,
      `Carol settles the auction`
    )({ from: carol })
    await printRealtimeBalance('Auction Contract', app.address)
    await printRealtimeBalance('Creator', creator)
    await printRealtimeBalance('Bob', bob)
    await printRealtimeBalance('Carol', carol)

    ////// NEW AUCTION - Generation 3 /////
    console.log(
      `======= New auction - Generation ${await app.currentGeneration.call()} =======`
    )
    await web3tx(app.bid, `Dan bids 30`)(toWad(30), { from: dan })
    time.increase(timeLeft + 1)
    await printRealtimeBalance('Auction Contract', app.address)
    await web3tx(
      app.settleAndBeginAuction,
      `Dan settles the auction`
    )({ from: dan })
    await printRealtimeBalance('Auction Contract', app.address)
    await printRealtimeBalance('Creator', creator)
    await printRealtimeBalance('Bob', bob)
    await printRealtimeBalance('Carol', carol)
    await printRealtimeBalance('Dan', dan)

    ////// NEW AUCTION - Generation 4 /////
    console.log(
      `======= New auction - Generation ${await app.currentGeneration.call()} =======`
    )
    await web3tx(app.bid, `Dan bids 100`)(toWad(100), { from: dan })
    time.increase(timeLeft + 1)
    await printRealtimeBalance('Auction Contract', app.address)
    await web3tx(
      app.settleAndBeginAuction,
      `Carol settles the auction`
    )({ from: carol })
    await printRealtimeBalance('Auction Contract', app.address)
    await printRealtimeBalance('Creator', creator)
    await printRealtimeBalance('Bob', bob)
    await printRealtimeBalance('Carol', carol)
    await printRealtimeBalance('Dan', dan)
  
    assert.equal(await app.currentGeneration.call(), '5')

    // TODO : write logic to check the expected distribution split
  })

  // OLD from LotterySuperApp
  // it("Lonely game case", async () => {
  //   let appRealtimeBalance;
  //   // bob is the first player
  //   await web3tx(sf.host.batchCall, "Bob joining the game")(
  //     createPlayBatchCall(100),
  //     { from: bob }
  //   );
  //   await expectRevert(
  //     sf.host.batchCall(createPlayBatchCall(0), { from: bob }),
  //     "Flow already exist"
  //   );
  //   assert.equal((await app.currentWinner.call()).player, bob);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   // bob quits the game
  //   await web3tx(sf.host.callAgreement, "Bob quiting the game")(
  //     sf.agreements.cfa.address,
  //     sf.agreements.cfa.contract.methods
  //       .deleteFlow(daix.address, bob, app.address, "0x")
  //       .encodeABI(),
  //     { from: bob }
  //   );
  //   assert.equal((await app.currentWinner.call()).player, ZERO_ADDRESS);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   await printRealtimeBalance("Carol", carol);
  //   // bob is the only player again
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Bob joining the game again"
  //   )(createPlayBatchCall(), { from: bob });
  //   assert.equal((await app.currentWinner.call()).player, bob);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  // });

  // it("Happy game case", async () => {
  //   let appRealtimeBalance;
  //
  //   assert.equal((await app.currentWinner.call()).player, ZERO_ADDRESS);
  //   //
  //   // Round 1: +bob, +carol, -bob, - carol
  //   //
  //   await web3tx(sf.host.batchCall, "Bob joining the game")(
  //     createPlayBatchCall(100),
  //     { from: bob }
  //   );
  //   assert.equal((await app.currentWinner.call()).player, bob);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   // carol enters the game
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Carol joining the game too"
  //   )(createPlayBatchCall(100), { from: carol });
  //   let winner = (await app.currentWinner.call()).player;
  //   console.log("Winner", winner);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, winner)).toString(),
  //     MINIMUM_GAME_FLOW_RATE.toString()
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   await printRealtimeBalance("Carol", carol);
  //   // bob quits the game
  //   await web3tx(sf.host.callAgreement, "Bob quiting the game")(
  //     sf.agreements.cfa.address,
  //     sf.agreements.cfa.contract.methods
  //       .deleteFlow(daix.address, bob, app.address, "0x")
  //       .encodeABI(),
  //     { from: bob }
  //   );
  //   assert.equal((await app.currentWinner.call()).player, carol);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, carol)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   await printRealtimeBalance("Carol", carol);
  //   // carol quits the game
  //   await web3tx(sf.host.callAgreement, "Carol quiting the game too")(
  //     sf.agreements.cfa.address,
  //     sf.agreements.cfa.contract.methods
  //       .deleteFlow(daix.address, carol, app.address, "0x")
  //       .encodeABI(),
  //     { from: carol }
  //   );
  //   assert.equal((await app.currentWinner.call()).player, ZERO_ADDRESS);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, carol)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   await printRealtimeBalance("Carol", carol);
  //   //
  //   // Round 2: +bob, +carol, -carol, -bob
  //   //
  //   // bob join the game again
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Bob joining the game again"
  //   )(createPlayBatchCall(), { from: bob });
  //   assert.equal((await app.currentWinner.call()).player, bob);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, carol)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   await printRealtimeBalance("Carol", carol);
  //   // carol join the game again too
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Carol joining the game again too"
  //   )(createPlayBatchCall(), { from: carol });
  //   await web3tx(
  //     sf.host.callAgreement,
  //     "Carol quiting the game first this time"
  //   )(
  //     sf.agreements.cfa.address,
  //     sf.agreements.cfa.contract.methods
  //       .deleteFlow(daix.address, carol, app.address, "0x")
  //       .encodeABI(),
  //     { from: carol }
  //   );
  //   assert.equal((await app.currentWinner.call()).player, bob);
  //   await web3tx(sf.host.callAgreement, "Bob quiting the game too")(
  //     sf.agreements.cfa.address,
  //     sf.agreements.cfa.contract.methods
  //       .deleteFlow(daix.address, bob, app.address, "0x")
  //       .encodeABI(),
  //     { from: bob }
  //   );
  //   assert.equal((await app.currentWinner.call()).player, ZERO_ADDRESS);
  //   assert.equal(
  //     (
  //       await sf.agreements.cfa.getNetFlow(daix.address, app.address)
  //     ).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, bob)).toString(),
  //     "0"
  //   );
  //   assert.equal(
  //     (await sf.agreements.cfa.getNetFlow(daix.address, carol)).toString(),
  //     "0"
  //   );
  //   appRealtimeBalance = await printRealtimeBalance("App", app.address);
  //   await printRealtimeBalance("Bob", bob);
  //   await printRealtimeBalance("Carol", carol);
  //   //
  //   // Round 3: +carol, +bob, -bob, - carol
  //   //
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Carol joining the game first"
  //   )(createPlayBatchCall(), { from: carol });
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Bob joining the game again"
  //   )(createPlayBatchCall(), { from: bob });
  //   await web3tx(sf.host.callAgreement, "Bob quiting the game")(
  //     sf.agreements.cfa.address,
  //     sf.agreements.cfa.contract.methods
  //       .deleteFlow(daix.address, bob, app.address, "0x")
  //       .encodeABI(),
  //     { from: bob }
  //   );
  //   await web3tx(sf.host.callAgreement, "Carol quiting the game")(
  //     sf.agreements.cfa.address,
  //     sf.agreements.cfa.contract.methods
  //       .deleteFlow(daix.address, carol, app.address, "0x")
  //       .encodeABI(),
  //     { from: carol }
  //   );
  // });
  //
  // it("Test randomness", async () => {
  //   const counters = {};
  //   counters[carol] = { name: "carol", count: 0 };
  //   counters[bob] = { name: "bob", count: 0 };
  //   counters[dan] = { name: "dan", count: 0 };
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Carol joining the game"
  //   )(createPlayBatchCall(100), { from: carol });
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Bob joining the game too"
  //   )(createPlayBatchCall(100), { from: bob });
  //   await web3tx(
  //     sf.host.batchCall,
  //     "Dan joining the game too"
  //   )(createPlayBatchCall(100), { from: dan });
  //   for (let i = 0; i < 20; ++i) {
  //     counters[(await app.currentWinner.call()).player].count++;
  //     await web3tx(sf.host.callAgreement, "Dan quiting the game")(
  //       sf.agreements.cfa.address,
  //       sf.agreements.cfa.contract.methods
  //         .deleteFlow(daix.address, dan, app.address, "0x")
  //         .encodeABI(),
  //       { from: dan }
  //     );
  //     await web3tx(
  //       sf.host.batchCall,
  //       "Dan joining the game too"
  //     )(createPlayBatchCall(), { from: dan });
  //   }
  //   console.log("Winning counters", counters);
  //   assert.isTrue(counters[bob].count > 0);
  //   assert.isTrue(counters[carol].count > 0);
  //   assert.isTrue(counters[dan].count > 0);
  // });
})
