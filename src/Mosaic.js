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

const Chain = require('./Chain');

/**
 * Mosaic stores access to two chains of a mosaic set-up: origin and auxiliary.
 * @param {Chain} origin The origin chain of this mosaic set-up.
 * @param {Chain} auxiliary The auxiliary chain of this mosaic set-up.
 */
class Mosaic {
  /**
   * Creates a new Web3 instance.
   * @param {Chain} origin The origin chain of this mosaic set-up.
   * @param {Chain} auxiliary The auxiliary chain of this mosaic set-up.
   */
  constructor(origin, auxiliary) {
    if (!(origin instanceof Chain)) {
      throw new TypeError('origin must be an instance of Chain.');
    }

    if (!(auxiliary instanceof Chain)) {
      throw new TypeError('auxiliary must be an instance of Chain.');
    }

    const mosaicPropertyConfiguration = {
      configurable: false,
      enumerable: true,
      writable: false,
    };

    Object.defineProperties(this, {
      origin: {
        value: origin,
        ...mosaicPropertyConfiguration,
      },
      auxiliary: {
        value: auxiliary,
        ...mosaicPropertyConfiguration,
      },
    });
  }
}

module.exports = Mosaic;