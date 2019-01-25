'use strict';

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

const BN = require('bn.js');
const Web3Utils = require('web3-utils');
const Contracts = require('../../libs/Contracts');
const utils = require('../../libs/utils/util.js');

class Facilitator {
  constructor(originWeb3, simpleToken, gateway, staker, txOptions) {
    const oThis = this;
    oThis.web3 = originWeb3;
    oThis.valueToken = simpleToken;
    oThis.simpleToken = simpleToken;
    oThis.gateway = gateway;
    oThis.staker = staker;
    oThis.txOptions = txOptions || {
      gasPrice: '0x5B9ACA00'
    };
  }

  perform(_amount, _beneficiary, _gasPrice, _gasLimit) {
    const oThis = this;

    let _nonce, amountToApprove, _hashLock;

    let haslockInfo = StakeHelper.createSecretHashLock();
    _hashLock = haslockInfo.hashLock;

    let promiseChain = oThis.getBounty();

    _amount = String(_amount);

    promiseChain = promiseChain.then((_bounty) => {
      let bnBounty = new BN(_bounty);
      let bnAmount = new BN(_amount);
      let bnAmountToApprove = bnBounty.add(bnAmount);
      amountToApprove = bnAmountToApprove.toString(10);

      console.log('\t - Amount to approve:', amountToApprove);
      return _bounty;
    });

    promiseChain = promiseChain
      .then(() => {
        return oThis.getNonce();
      })
      .then((nonce) => {
        _nonce = nonce;
      });

    promiseChain = promiseChain.then(() => {
      return oThis.approveStakeAmount(amountToApprove);
    });

    promiseChain = promiseChain
      .then(() => {
        return oThis.stake(_amount, _beneficiary, _gasPrice, _gasLimit, _nonce, _hashLock);
      })
      .then((stakeReceipt) => {
        return {
          receipt: stakeReceipt,
          haslockInfo: haslockInfo
        };
      });

    return promiseChain;
  }

  getNonce(staker, originWeb3, gateway) {
    const oThis = this;

    let web3 = originWeb3 || oThis.web3;
    gateway = gateway || oThis.gateway;
    staker = staker || oThis.staker;

    let contract = Contracts.getEIP20Gateway(web3, gateway);

    console.log(`* Fetching Staker Nonce`);
    return contract.methods
      .getNonce(staker)
      .call()
      .then((_nonce) => {
        console.log(`\t - Gateway Nonce for ${staker}:`, _nonce);
        return _nonce;
      });
  }

  getBounty(staker, originWeb3, gateway) {
    const oThis = this;

    let web3 = originWeb3 || oThis.web3;
    gateway = gateway || oThis.gateway;
    staker = staker || oThis.staker;

    let contract = Contracts.getEIP20Gateway(web3, gateway);

    console.log(`* Fetching Gateway Bounty`);
    return contract.methods
      .bounty()
      .call()
      .then((_bounty) => {
        console.log('\t - Gateway Bounty:', _bounty);
        return _bounty;
      });
  }

  approveStakeAmount(_value, txOptions, originWeb3, valueToken, gateway, staker) {
    const oThis = this;

    let web3 = originWeb3 || oThis.web3;
    valueToken = valueToken || oThis.valueToken;
    gateway = gateway || oThis.gateway;
    staker = staker || oThis.staker;

    let tx = oThis._approveStakeAmountRawTx(_value, txOptions, web3, valueToken, gateway, staker);

    console.log(`* Approving Stake Amount`);
    return tx
      .send(txOptions)
      .on('transactionHash', function(transactionHash) {
        console.log('\t - transaction hash:', transactionHash);
      })
      .on('receipt', function(receipt) {
        console.log('\t - Receipt:\n\x1b[2m', JSON.stringify(receipt), '\x1b[0m\n');
      })
      .on('error', function(error) {
        console.log('\t !! Error !!', error, '\n\t !! ERROR !!\n');
        return Promise.reject(error);
      });
  }

  _approveStakeAmountRawTx(_value, txOptions, web3, valueToken, gateway, staker) {
    const oThis = this;

    txOptions = Object.assign(
      {
        from: staker,
        to: valueToken,
        gas: '100000'
      },
      oThis.txOptions || {},
      txOptions || {}
    );

    let contract = Contracts.getEIP20Token(web3, valueToken, txOptions);
    let tx = contract.methods.approve(gateway, _value);

    return tx;
  }

  stake(_amount, _beneficiary, _gasPrice, _gasLimit, _nonce, _hashLock, txOptions, originWeb3, gateway, staker) {
    const oThis = this;

    let web3 = originWeb3 || oThis.web3;
    gateway = gateway || oThis.gateway;
    staker = staker || oThis.staker;

    let tx = oThis._stakeRawTx(
      _amount,
      _beneficiary,
      _gasPrice,
      _gasLimit,
      _nonce,
      _hashLock,
      txOptions,
      web3,
      gateway,
      staker
    );
    console.log(`* Staking SimpleToken`);
    return tx
      .send(txOptions)
      .on('transactionHash', function(transactionHash) {
        console.log('\t - transaction hash:', transactionHash);
      })
      .on('receipt', function(receipt) {
        console.log('\t - Receipt:\n\x1b[2m', JSON.stringify(receipt), '\x1b[0m\n');
      })
      .on('error', function(error) {
        console.log('\t !! Error !!', error, '\n\t !! ERROR !!\n');
        return Promise.reject(error);
      });
  }

  _stakeRawTx(_amount, _beneficiary, _gasPrice, _gasLimit, _nonce, _hashLock, txOptions, web3, gateway, staker) {
    const oThis = this;

    txOptions = Object.assign(
      {
        from: staker,
        to: gateway,
        gas: '7000000'
      },
      oThis.txOptions || {},
      txOptions || {}
    );

    let contract = Contracts.getEIP20Gateway(web3, gateway, txOptions);
    let tx = contract.methods.stake(_amount, _beneficiary, _gasPrice, _gasLimit, _nonce, _hashLock);

    return tx;
  }

  static createSecretHashLock() {
    let secret = Crypto.randomBytes(16).toString('hex');
    return StakeHelper.toHashLock(secret);
  }

  static toHashLock(secretString) {
    let secretBytes = Buffer.from(secretString);
    return {
      secret: secretString,
      unlockSecret: '0x' + secretBytes.toString('hex'),
      hashLock: Web3Utils.keccak256(secretString)
    };
  }
}

module.exports = StakeHelper;