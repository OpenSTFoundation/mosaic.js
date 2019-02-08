'use strict';

const Web3 = require('web3');

const AbiBinProvider = require('../AbiBinProvider');
const Utils = require('../utils/Utils');

const ContractName = 'MerklePatriciaProof';

// TODO: docs mentioning library contract
class MerklePatriciaProof {
  // TODO: docs
  constructor(web3, libraryAddress) {
    if (web3 instanceof Web3) {
      this.web3 = web3;
    } else {
      const err = new TypeError(
        "Mandatory Parameter 'web3' is missing or invalid",
      );
      throw err;
    }

    if (!Web3.utils.isAddress(libraryAddress)) {
      const err = new TypeError(
        "Mandatory Parameter 'libraryAddress' is missing or invalid.",
      );
      throw err;
    }

    this.address = libraryAddress;
  }

  // TODO: docs
  static async deploy(web3, txOptions) {
    const tx = MerklePatriciaProof.deployRawTx(web3);

    const _txOptions = txOptions;
    if (!_txOptions.gas) {
      _txOptions.gas = await tx.estimateGas();
    }

    return Utils.sendTransaction(tx, _txOptions).then((txReceipt) => {
      const address = txReceipt.contractAddress;
      return new MerklePatriciaProof(web3, address);
    });
  }

  // TODO: docs
  static deployRawTx(web3) {
    const abiBinProvider = new AbiBinProvider();
    const abi = abiBinProvider.getABI(ContractName);
    const bin = abiBinProvider.getBIN(ContractName);

    const args = [];
    const contract = new web3.eth.Contract(abi, null, null);

    return contract.deploy({
      data: bin,
      arguments: args,
    });
  }
}

module.exports = MerklePatriciaProof;