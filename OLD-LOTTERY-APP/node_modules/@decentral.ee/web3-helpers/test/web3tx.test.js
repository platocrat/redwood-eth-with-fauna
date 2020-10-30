const { web3tx } = require("../src");
const { expect } = require("chai");
const Tester = artifacts.require("Tester");

async function assertFailure (promise) {
    try {
        await promise;
    } catch (error) {
        return;
    }
    expect.fail();
}

contract("web3tx", accounts => {
    it("inConstruction", async () => {
        const tester1 = await web3tx(Tester.new, "Tester.new 1")();
        assert.isDefined(tester1.address);
        assert.isDefined(tester1.receipt);
        assert.isTrue(tester1.txCost > 100000);
        const tester2 = await web3tx(Tester.new, "Tester.new 2", {
            inConstruction: [{
                name: "TesterCreated",
                args: {
                    setter: accounts[0]
                }
            }]
        })();
        assert.notEqual(tester1.address, tester2.address);
        await assertFailure(web3tx(Tester.new, "Tester.new 3", {
            inConstruction: [{
                name: "TesterCreated",
                args: {
                    setter: accounts[1]
                }
            }]
        })());
    });

    it("inLogs", async () => {
        let tx;
        const tester = await web3tx(Tester.new, "Tester.new")();
        tx = await web3tx(tester.setValue, "tester.setValue 10", {
            inLogs: [{
                name: "ValueSet",
                args: {
                    setter: accounts[0],
                    value: web3.utils.toBN(10)
                }
            }]
        })(10);
        assert.isDefined(tx.receipt);
        assert.isTrue(tx.txCost > 100000);
        await assertFailure(web3tx(tester.setValue, "tester.setValue 10 expecting 11", {
            inLogs: [{
                name: "ValueSet",
                args: {
                    setter: accounts[0],
                    value: web3.utils.toBN(11)
                }
            }]
        })(10));
    });

    it("encodeABI", async () => {
        let tx;
        const tester = await web3tx(Tester.new, "Tester.new")();
        assert.equal(tester.contract.methods.setValue(2).encodeABI(), "0xfb693f770000000000000000000000000000000000000000000000000000000000000002");
    });
});
