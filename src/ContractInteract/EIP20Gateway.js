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

'use strict';

const Web3 = require('web3');
const BN = require('bn.js');
const Contracts = require('../Contracts');
const Utils = require('../utils/Utils');
const EIP20Token = require('../ContractInteract/EIP20Token');
const Anchor = require('../ContractInteract/Anchor');

/**
 * Contract interact for EIP20Gateway.
 */
class EIP20Gateway {
  /**
   * Constructor for EIP20Gateway.
   *
   * @param {Object} web3 Web3 object.
   * @param {string} gatewayAddress Gateway contract address.
   */
  constructor(web3, gatewayAddress) {
    if (web3 instanceof Web3) {
      this.web3 = web3;
    } else {
      const err = new TypeError(
        "Mandatory Parameter 'web3' is missing or invalid",
      );
      throw err;
    }

    if (!Web3.utils.isAddress(gatewayAddress)) {
      const err = new TypeError(
        "Mandatory Parameter 'gatewayAddress' is missing or invalid.",
      );
      throw err;
    }

    this.gatewayAddress = gatewayAddress;

    this.contract = Contracts.getEIP20Gateway(this.web3, this.gatewayAddress);

    if (!this.contract) {
      const err = new Error(
        `Could not load Gateway contract for: ${this.gatewayAddress}`,
      );
      throw err;
    }

    this.proveGateway = this.proveGateway.bind(this);
    this._proveGatewayRawTx = this._proveGatewayRawTx.bind(this);
    this.stake = this.stake.bind(this);
    this._stakeRawTx = this._stakeRawTx.bind(this);
    this.progressStake = this.progressStake.bind(this);
    this._progressStakeRawTx = this._progressStakeRawTx.bind(this);
    this.getBounty = this.getBounty.bind(this);
    this.getBaseToken = this.getBaseToken.bind(this);
    this.getValueToken = this.getValueToken.bind(this);
    this.getNonce = this.getNonce.bind(this);
    this.getStateRootProviderAddress = this.getStateRootProviderAddress.bind(
      this,
    );
    this.getInboxMessageStatus = this.getInboxMessageStatus.bind(this);
    this.getOutboxMessageStatus = this.getOutboxMessageStatus.bind(this);
  }

  /**
   * Prove CoGateway contract account address on origin chain.
   *
   * @param {string} blockHeight Block number.
   * @param {string} encodedAccount Encoded account data.
   * @param {string} accountProof Account proof data.
   * @param {Object} txOptions Transaction options.
   *
   * @returns {Promise} Promise object.
   */
  proveGateway(blockHeight, encodedAccount, accountProof, txOptions) {
    if (!txOptions) {
      const err = new TypeError('Invalid transaction options.');
      return Promise.reject(err);
    }
    return this._proveGatewayRawTx(
      blockHeight,
      encodedAccount,
      accountProof,
    ).then((tx) => {
      return Utils.sendTransaction(tx, txOptions);
    });
  }

  /**
   * Get raw transaction object for prove cogateway.
   *
   * @param {string} blockHeight Block number.
   * @param {string} encodedAccount Encoded account data.
   * @param {string} accountProof Account proof data.
   *
   * @returns {Promise} Promise object.
   */
  _proveGatewayRawTx(blockHeight, encodedAccount, accountProof) {
    if (blockHeight === undefined) {
      const err = new TypeError('Invalid block height.');
      return Promise.reject(err);
    }

    if (typeof encodedAccount !== 'string') {
      const err = new TypeError('Invalid account data.');
      return Promise.reject(err);
    }

    if (typeof accountProof !== 'string') {
      const err = new TypeError('Invalid account proof.');
      return Promise.reject(err);
    }

    const tx = this.contract.methods.proveGateway(
      blockHeight,
      encodedAccount,
      accountProof,
    );
    return Promise.resolve(tx);
  }

  /**
   * Performs stake.
   *
   * @param {string} amount Amount to stake.
   * @param {string} beneficiary Beneficiary address.
   * @param {string} gasPrice Gas price that staker is willing to pay for the reward.
   * @param {string} gasLimit Maximum gas limit for reward calculation.
   * @param {string} nonce Staker nonce.
   * @param {string} hashLock Hash lock.
   * @param {Object} txOptions Transaction options.
   *
   * @returns {Object} Raw transaction object.
   */
  stake(amount, beneficiary, gasPrice, gasLimit, nonce, hashLock, txOptions) {
    if (!txOptions) {
      const err = new TypeError('Invalid transaction options.');
      return Promise.reject(err);
    }
    if (!Web3.utils.isAddress(txOptions.from)) {
      const err = new TypeError('Invalid facilitator address.');
      return Promise.reject(err);
    }
    return this._stakeRawTx(
      amount,
      beneficiary,
      gasPrice,
      gasLimit,
      nonce,
      hashLock,
    ).then((tx) => {
      return Utils.sendTransaction(tx, txOptions);
    });
  }

  /**
   * Get the raw transaction for stake.
   *
   * @param {string} amount Amount to stake.
   * @param {string} beneficiary Beneficiary address.
   * @param {string} gasPrice Gas price that staker is willing to pay for the reward.
   * @param {string} gasLimit Maximum gas limit for reward calculation.
   * @param {string} nonce Staker nonce.
   * @param {string} hashLock Hash lock.
   * @param {Object} txOptions Transaction options.
   *
   * @returns {Object} Raw transaction object.
   */
  _stakeRawTx(amount, beneficiary, gasPrice, gasLimit, nonce, hashLock) {
    if (new BN(amount).eqn(0)) {
      const err = new TypeError('Stake amount must not be zero.');
      return Promise.reject(err);
    }
    if (!Web3.utils.isAddress(beneficiary)) {
      const err = new TypeError('Invalid beneficiary address.');
      return Promise.reject(err);
    }
    if (gasPrice === undefined) {
      const err = new TypeError('Invalid gas price.');
      return Promise.reject(err);
    }
    if (gasLimit === undefined) {
      const err = new TypeError('Invalid gas limit.');
      return Promise.reject(err);
    }
    const tx = this.contract.methods.stake(
      amount,
      beneficiary,
      gasPrice,
      gasLimit,
      nonce,
      hashLock,
    );
    return Promise.resolve(tx);
  }

  /**
   * Performs progress stake.
   *
   * @param {string} messageHash Message hash.
   * @param {string} unlockSecret Unlock secret.
   * @param {Object} txOptions Transaction options.
   *
   * @returns {Promise} promise object.
   */
  progressStake(messageHash, unlockSecret, txOptions) {
    if (!txOptions) {
      const err = new TypeError('Invalid transaction options.');
      return Promise.reject(err);
    }
    return this._progressStakeRawTx(messageHash, unlockSecret).then((tx) => {
      return Utils.sendTransaction(tx, txOptions);
    });
  }

  /**
   * Get the raw transaction for progress stake
   *
   * @param {string} messageHash Message hash.
   * @param {string} unlockSecret Unlock secret.
   *
   * @returns {Promise} promise object.
   */
  _progressStakeRawTx(messageHash, unlockSecret) {
    if (typeof messageHash !== 'string') {
      const err = new TypeError('Invalid message hash.');
      return Promise.reject(err);
    }

    if (typeof unlockSecret !== 'string') {
      const err = new TypeError('Invalid unlock secret.');
      return Promise.reject(err);
    }

    const tx = this.contract.methods.progressStake(messageHash, unlockSecret);
    return Promise.resolve(tx);
  }

  /**
   * Returns the bounty amount.
   *
   * @returns {Promise} Promise object.
   */
  getBounty() {
    if (this._bountyAmount) {
      return Promise.resolve(this._bountyAmount);
    }
    return this.contract.methods
      .bounty()
      .call()
      .then((bounty) => {
        this._bountyAmount = bounty;
        return bounty;
      });
  }

  /**
   * Returns the ERC20 base token address.
   *
   * @returns {Promise} Promise object
   */
  getBaseToken() {
    if (this._baseTokenAddress) {
      return Promise.resolve(this._baseTokenAddress);
    }
    return this.contract.methods
      .baseToken()
      .call()
      .then((baseToken) => {
        this._baseTokenAddress = baseToken;
        return baseToken;
      });
  }

  /**
   * Returns the EIP20 token address.
   *
   * @returns {Promise} Promise object represents EIP20 token address.
   */
  getValueToken() {
    if (this._valueTokenAddress) {
      return Promise.resolve(this._valueTokenAddress);
    }
    return this.contract.methods
      .token()
      .call()
      .then((token) => {
        this._valueTokenAddress = token;
        return token;
      });
  }

  /**
   * Returns the nonce for the given account address.
   *
   * @param {string} accountAddress Account address for which the nonce is to be fetched.
   *
   * @returns {Promise} Promise object.
   */
  getNonce(accountAddress) {
    if (!Web3.utils.isAddress(accountAddress)) {
      const err = TypeError('Invalid account address.');
      return Promise.reject(err);
    }
    return this.contract.methods
      .getNonce(accountAddress)
      .call()
      .then((nonce) => {
        return nonce;
      });
  }

  /**
   * Returns the origin chain state root provider contract address.
   *
   * @returns {Promise} Promise object.
   */
  getStateRootProviderAddress() {
    if (this._stateRootProviderAddress) {
      return Promise.resolve(this._stateRootProviderAddress);
    }
    return this.contract.methods
      .stateRootProvider()
      .call()
      .then((stateRootProviderAddress) => {
        this._stateRootProviderAddress = stateRootProviderAddress;
        return stateRootProviderAddress;
      });
  }

  /**
   * Returns inbox message status.
   *
   * @param {string} messageHash Message hash.
   *
   * @returns {Promise} Promise object.
   */
  getInboxMessageStatus(messageHash) {
    if (typeof messageHash !== 'string') {
      const err = new TypeError('Invalid message hash.');
      return Promise.reject(err);
    }
    return this.contract.methods
      .getInboxMessageStatus(messageHash)
      .call()
      .then((status) => {
        return status;
      });
  }

  /**
   * Returns outbox message status.
   *
   * @param {string} messageHash Message hash.
   *
   * @returns {Promise} Promise object.
   */
  getOutboxMessageStatus(messageHash) {
    if (typeof messageHash !== 'string') {
      const err = new TypeError('Invalid message hash.');
      return Promise.reject(err);
    }
    return this.contract.methods
      .getOutboxMessageStatus(messageHash)
      .call()
      .then((status) => {
        return status;
      });
  }

  /**
   * Check if the account has approved gateway contract for stake amount transfer.
   *
   * @param {string} stakerAddress Staker account address.
   * @param {string} amount Approval amount.
   *
   * @returns {Promise} Promise object.
   */
  isStakeAmountApproved(stakerAddress, amount) {
    if (!Web3.utils.isAddress(stakerAddress)) {
      const err = new TypeError('Invalid staker address.');
      return Promise.reject(err);
    }
    return this.getEIP20ValueToken().then((eip20ValueToken) => {
      eip20ValueToken
        .isAmountApproved(stakerAddress, this.gatewayAddress, amount)
        .then((result) => {
          return result;
        });
    });
  }

  /**
   * Check if the account has approved gateway contract for bounty amount transfer.
   *
   * @param {string} facilityAddress Owner account address.
   *
   * @returns {Promise} Promise object.
   */
  isBountyAmountApproved(facilityAddress) {
    if (!Web3.utils.isAddress(facilityAddress)) {
      const err = new TypeError('Invalid facility address.');
      return Promise.reject(err);
    }
    return this.getEIP20BaseToken().then((eip20BaseToken) => {
      this.getBounty().then((bounty) => {
        eip20BaseToken
          .isAmountApproved(facilityAddress, this.gatewayAddress, bounty)
          .then((result) => {
            return result;
          });
      });
    });
  }

  /**
   * Returns value token object.
   *
   * @returns {Promise} Promise object.
   */
  getEIP20ValueToken() {
    if (this._eip20ValueToken) {
      return Promise.resolve(this._eip20ValueToken);
    }
    return this.getValueToken().then((valueTokenAddress) => {
      const token = new EIP20Token(this.web3, valueTokenAddress);
      this._eip20ValueToken = token;
      return token;
    });
  }

  /**
   * Returns base token object.
   *
   * @returns {Promise} Promise object.
   */
  getEIP20BaseToken() {
    if (this._eip20BaseToken) {
      return Promise.resolve(this._eip20BaseToken);
    }
    return this.getBaseToken().then((baseTokenAddress) => {
      const token = new EIP20Token(this.web3, baseTokenAddress);
      this._eip20BaseToken = token;
      return token;
    });
  }

  /**
   * Approves gateway contract address for the amount transfer.
   *
   * @param {string} amount Approve amount.
   * @param {string} txOptions Transaction options.
   *
   * @returns {Promise} Promise object.
   */
  approveStakeAmount(amount, txOptions) {
    if (!txOptions) {
      const err = new TypeError('Invalid transaction options.');
      return Promise.reject(err);
    }
    if (!Web3.utils.isAddress(txOptions.from)) {
      const err = new TypeError('Invalid from address.');
      return Promise.reject(err);
    }
    if (typeof amount !== 'string') {
      const err = new TypeError('Invalid stake amount.');
      return Promise.reject(err);
    }
    return this.getEIP20ValueToken().then((eip20Token) => {
      eip20Token
        .approve(this.gatewayAddress, amount, txOptions)
        .then((result) => {
          return result;
        });
    });
  }

  /**
   * Approves gateway contract address for the amount transfer.
   *
   * @param {string} amount Approve amount.
   * @param {string} txOptions Transaction options.
   *
   * @returns {Promise} Promise object.
   */
  approveBountyAmount(txOptions) {
    if (!txOptions) {
      const err = new TypeError('Invalid transaction options.');
      return Promise.reject(err);
    }
    if (!Web3.utils.isAddress(txOptions.from)) {
      const err = new TypeError('Invalid from address.');
      return Promise.reject(err);
    }
    return this.getEIP20BaseToken().then((eip20BaseToken) => {
      this.getBounty().then((bounty) => {
        eip20BaseToken
          .approve(this.gatewayAddress, bounty, txOptions)
          .then((result) => {
            return result;
          });
      });
    });
  }

  /**
   * Returns Anchor object.
   *
   * @returns {Promise} Promise object.
   */
  getAnchor() {
    if (this._anchor) {
      return Promise.resolve(this._anchor);
    }
    return this.getStateRootProviderAddress().then((anchorAddress) => {
      const anchor = new Anchor(this.web3, anchorAddress);
      this._anchor = anchor;
      return anchor;
    });
  }

  /**
   * Get the state root for given block height.
   *
   * @returns {Promise} Promise object.
   */
  getLatestAnchorInfo() {
    return this.getAnchor().then((anchor) => {
      anchor.getLatestStateRootBlockHeight().then((blockHeight) => {
        anchor.getStateRoot(blockHeight).then((stateRoot) => {
          return {
            blockHeight,
            stateRoot,
          };
        });
      });
    });
  }
}

module.exports = EIP20Gateway;