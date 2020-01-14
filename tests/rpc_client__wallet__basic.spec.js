// Copyright (c) 2014-2020, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict";
const assert = require('assert')
const axios = require('axios')
//
// test constants
const filename0 = "mytestwallet"
const password0 = "mytestpassword"
const wallet_language = "English"
//
const addr1 = "43zxvpcj5Xv9SEkNXbMCG7LPQStHMpFCQCmkmR4u5nzjWwq5Xkv5VmGgYEsHXg4ja2FGRD5wMWbBVMijDTqmmVqm93wHGkg"
const vk1 = "7bea1907940afdd480eff7c4bcadb478a0fbb626df9e3ed74ae801e18f53e104"
const sk1 = "4e6d43cd03812b803c6f3206689f5fcc910005fc7e91d50d79b0776dbefcd803"
const seedwords1 = "foxes selfish humid nexus juvenile dodge pepper ember biscuit elapse jazz vibrate biscuit"
//
const rpc_server_url = 'http://localhost:18082/json'
//
var first__done_fn = null;
describe("RPC client tests - Wallet RPC - basic wallet functions", function()
{
	it("can create_wallet", function(done)
	{
		this.timeout(60 * 1000);
		//
		var payload = {
			jsonrpc: "2.0", id: "0",
			method: "create_wallet", params: {
				filename: filename0+"-"+(new Date()).getTime(),
				password: password0,
				language: wallet_language
			}
		}
		const req = axios.post(rpc_server_url, payload)
		req.then(function(res) {
			console.log("Got res data" , res.data)
			done();
		}).catch(function(e) {
			assert.fail(e.response.data);
		})
	});
	//
	//
	//

});


