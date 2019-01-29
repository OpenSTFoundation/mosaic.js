// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

const chai = require('chai');
const sinon = require('sinon');
const Web3 = require('web3');
const Facilitator = require('../../libs/Facilitator/Facilitator');
const SpyAssert = require('../../test_utils/SpyAssert');

const assert = chai.assert;

describe('Facilitator.getBounty()', () => {
  let facilitator;
  let web3;
  let gatewayAddress;
  let coGatewayAddress;

  beforeEach(() => {
    // runs before each test in this block
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9546'));
    gatewayAddress = '0x52c50cC9bBa156C65756abd71b172B6408Dde006';
    coGatewayAddress = '0xbF03E1680258c70B86D38A7e510F559A6440D06e';
    facilitator = new Facilitator(
      web3,
      web3,
      gatewayAddress,
      coGatewayAddress
    );
  });

  it('should return correct bounty value', async function() {
    this.timeout(5000);

    const mockedBountyAmount = 100;

    // Mock an instance of gateway contract.
    const mockGatewayContract = sinon.mock(
      facilitator.contracts.Gateway(gatewayAddress)
    );
    const gatewayContract = mockGatewayContract.object;

    // Fake the bounty call.
    const spyBounty = sinon.replace(
      gatewayContract.methods,
      'bounty',
      sinon.fake.returns(function() {
        return Promise.resolve(mockedBountyAmount);
      })
    );

    // Fake the Gateway call to return gatewayContract object;
    const spyGateway = sinon.replace(
      facilitator.contracts,
      'Gateway',
      sinon.fake.returns(gatewayContract)
    );

    // Add spy on Facilitator.getBounty.
    const spy = sinon.spy(facilitator, 'getBounty');

    // Call getBounty.
    const bounty = await facilitator.getBounty();

    // Assert the returned value.
    assert.strictEqual(
      bounty,
      mockedBountyAmount,
      'Bounty amount must be equal.'
    );

    SpyAssert.assert(spyBounty, 1, [[]]);
    SpyAssert.assert(spyGateway, 1, [[gatewayAddress]]);
    SpyAssert.assert(spy, 1, [[]]);

    // Restore all mocked and spy objects.
    mockGatewayContract.restore();
    spy.restore();
    sinon.restore();
  });
});