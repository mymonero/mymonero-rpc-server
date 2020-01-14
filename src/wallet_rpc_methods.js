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
const mymonero_core = require('../mymonero-ws-client/mymonero-core-js')
const nettype = mymonero_core.nettype_utils.network_type.MAINNET // TODO: pass via server options or method function args
function mnemonic_language_to_code(language)
{ // this can potentially be moved out
    switch (language) {
        case "English":
            return "en"
        case "Deutsch":
            return "de"
        case "Español":
            return "es"
        case "Français":
            return "fr"
        case "Italiano":
            return "it"
        case "Nederlands":
            return "nl"
        case "Português":
            return "pt"
        case "日本語":
            return "ja"
        case "русский язык":
            return "ru"
        case "简体中文 (中国)":
            return "zh"
        case "Esperanto":
            return "eo"
        case "Lojban":
            return "jbo"
        default:
            throw "Unrecognized language"
    }
}
//
const cryptor = require('./symmetric_string_cryptor')  
async function _read_wallet_json_for_file_named(store, filename, password)
{
    let raw_str = await store.read_stringInFileNamed(filename)
    if (typeof raw_str === 'undefined' || !raw_str) {
        return null // wallet does not exist on disk yet
    }
    let plain_str = await cryptor.New_DecryptedString__Promise(raw_str, password)
    return JSON.parse(plain_str) // thrown exception will 'reject'
}
async function _write_wallet_json_for_file_named(store, filename, password, plain_doc)
{
    let plain_str = await cryptor.New_EncryptedBase64String__Promise(JSON.stringify(plain_doc), password)
    await store.write(filename, plain_str)
}
//
async function _store_wallet_with(
    store,
    filename, password,
    address, view_key, spend_key, mnemonic, mnemonic_language
) {
    const plain_doc = 
    {
        address: address, 
        view_key: view_key, 
        spend_key: spend_key, 
        mnemonic: mnemonic, 
        mnemonic_language: mnemonic_language
    }
    await _write_wallet_json_for_file_named(store, filename, password, plain_doc)
}
var __wallet_timeout_til_save = null
async function _write_opened_wallet()
{
    await _write_wallet_json_for_file_named(store, filename, password, plain_doc)
}
function __save_wallet_after_delay_unless_canceled()
{
    if (__wallet_timeout_til_save) {
        clearTimeout(__wallet_timeout_til_save)
    }
    __wallet_timeout_til_save = setTimeout(function()
    {
        _write_opened_wallet()
    }, 50) // if no subsequent updates T ms, save
}
//
//
var opened_wallet_struct = null
function opened_wallet_struct__address()
{
    return opened_wallet_struct.doc.address
}
function opened_wallet_struct__view_key()
{
    return opened_wallet_struct.doc.view_key
}
async function _open_wallet(store, filename, password)
{
    let doc = await _read_wallet_json_for_file_named(store, filename, password)
    opened_wallet_struct = {
        filename: filename,
        password: password, // kept in mem for subsequent writes on receipt of a tx or other update
        wallet_store: store, // hanging onto this here ... unclear if there's a better way than factoring much of this into a wallet class and passing the store to the wallet itself
        doc: doc
    }
    console.log("TODO: remainder of _open_wallet… open WS conn and start filling in : ", filename, doc)
    __givenOpenWallet_open_ws(
        // These can be stored for the purpose of later getting only the latest history from the ws
        doc.last_confirmed_tx_id,
        doc.last_block_hash
    )
    //
    return doc
}
//
//
const ws_wireformat = require('../mymonero-ws-client/ws/ws_wireformat')
const WSErrorCode = ws_wireformat.WSErrorCode
//
const ws_transport = new (require("../mymonero-ws-client/ws/ws_transport.real"))({
	ws_url_base: "ws://localhost:8888" /* 8888 is real, 8889 is debug */ // 'ws://api.mymonero.com:8091' // also the default for ws_transport.real.js
})
function __givenOpenWallet_open_ws(
    optl_persisted__last_confirmed_tx_id,
    optl_persisted__last_block_hash
) {
    if (opened_wallet_struct == null) {
        throw "Expected non-null opened_wallet_struct in __open_ws"
    }

    console.log("__givenOpenWallet_open_ws("+ optl_persisted__last_confirmed_tx_id+", "+ optl_persisted__last_block_hash)

    const ws_client = new (require('../mymonero-ws-client/ws/ws_client'))({
        ws_transport: ws_transport,
        optl_persisted__last_confirmed_tx_id: optl_persisted__last_confirmed_tx_id,
        optl_persisted__last_block_hash: optl_persisted__last_block_hash,
        block_info_cb: function(feed_id, block_height, block_hash, head_tx_id, per_byte_fee, fee_mask)
        {
            // lastReceived_block_height = block_height
            console.log("block_info_cb" , feed_id, block_height, block_hash, head_tx_id, per_byte_fee, fee_mask)
        },
        subscr_initial_info_cb: function(feed_id, optl__req_id, expect_backlog_txs)
        {
            console.log("subscr_initial_info_cb" , feed_id, optl__req_id, expect_backlog_txs)
        },
        subscr_initial_backlog_txs_cb: function(feed_id, optl__req_id, tx)
        {
            // assert.notEqual(lastReceived_block_height, null);
            
        },
        subscr_initial_error_cb: function(feed_id, req_id, err_code, err_msg)
        {
            console.error("subscr_initial_error_cb!! err msg", err_code, err_msg)
            // assert.equal(err_code, WSErrorCode.badRequest);
            // assert.equal(err_msg, "Invalid field value for 'subaddress'");
            //
            // for now:
            _close_wallet() // just close the *entire* wallet because this means there was a fatal 'connection' failure
        },
        unsubscribed_cb: function(feed_id, optl__req_id)
        {
        },
        unsubscr_error_cb: function(feed_id, req_id, err_code, err_msg)
        {
            console.error("unsubscr_error_cb!! err msg", err_code, err_msg)
            // assert.equal(err_code, WSErrorCode.badRequest);
            // assert.equal(err_msg, "Invalid field value for 'subaddress'");
            //
            // TODO: close wallet here ? (are errors fatal?)
        },
        postinitial_tx_cb: function(feed_id, tx)
        {
        },
        anonymous_error_cb: function(feed_id, err_code, err_msg)
        {
            console.error("anonymous_error_cb!! err msg", err_code, err_msg)
            // TODO: close wallet here ? (are all errors fatal?)
        },
        forget_txs_cb: function(feed_id, for_address, from_tx_id)
        {
        },
        wallet_status_cb: function(feed_id, for_address, scan_block_height)
        {
            console.log("wallet_status_cb: ", feed_id, for_address, scan_block_height)
        },
        confirm_tx_cb: function(feed_id, tx_id, tx_hash, tx_height)
        {
        },
        optl__store_did_forget_txs_cb: function(tx_ids)
        {
            console.log("[wallet/optl__store_did_forget_txs_cb] with ids", tx_ids)
        }
    })
    opened_wallet_struct.ws_client = ws_client // storing the ws_client to close/free it later
    const was_connecting_for_wallet_w_addr = opened_wallet_struct.doc.address
    // ^- we can use this to check if the opened_wallet_struct at any future async point is still the same as the one we opened for in this scope
    const ws_feed_id = ws_client.connect(
        function()
        {   
            // Now that ws is open, we can subscribe for that wallet
            // (but first check if it's the same one
            if (!opened_wallet_struct || was_connecting_for_wallet_w_addr !== opened_wallet_struct__address()) {
                console.log("Opened a WS conn but bailing before opening subscr because either wallet was closed or different wallet was opened")
            } // ^-- note: this doesn't preclude a duplicate subscription being done for the same wallet on a fast close-then-open but the ws teardown on a close_wallet should handle that possibility wanyway
            //
            const payload = ws_client.new_subscribe_payload({
                address: opened_wallet_struct__address(),
                view_key: opened_wallet_struct__view_key(),
                // "since_confirmed_tx_id is handled internally in the client"
            })
            // const this__req_id = payload.req_id;
            ws_client.send_payload__feed(ws_feed_id, payload)
        },
        function(err)
        { // ws_error_cb
            console.error("An error in the client's connection ... maybe close the wallet ?")
        }
    )
    opened_wallet_struct.ws_feed_id = ws_feed_id
}
async function _close_wallet()
{
    if (opened_wallet_struct == null) {
        throw new Error("No wallet currently open")
    }
    if (opened_wallet_struct.ws_client) {
        if (opened_wallet_struct.ws_feed_id) { // close any open WS conns for that wallet
            opened_wallet_struct.ws_client.disconnect_feed(opened_wallet_struct.ws_feed_id)
        } else {
            console.warn("_close_wallet: non-nil ws_client but nil ws_feed_id")
        }
    }
    opened_wallet_struct.ws_client = null // not strictly necessary to do this
    opened_wallet_struct = null // free/release
}
//
//
//
module.exports =
{
    create_wallet: async function(params, server, res)
    {
        if (opened_wallet_struct != null) {
            return server._write_error(400, "A wallet is already open - send close_wallet first", res)
        }
        const filename = params.filename
        if (!filename) {
            return server._write_error(400, ".filename required", res)
        }
        const password = params.password
        if (!password) {
            return server._write_error(400, ".password required", res)
        }
        let lang_code
        try {
            lang_code = mnemonic_language_to_code(params.language)
        } catch (e) {
            return server._write_error(400, "Unknown language", res)
        }
        try {
            var created = (await mymonero_core.monero_utils_promise).newly_created_wallet(lang_code, nettype);
        } catch (e) {
            server._write_error(500, e, res)
            console.log(e)
            return
        }
        let doc
        try {
            doc = await _read_wallet_json_for_file_named(server.DocumentStore(), filename, password)
        } catch (err) {
            return server._write_error(500, err, res)
        }
        if (doc != null) {
            return server._write_error(400, "File with that name already exists", res)
        }
        // create the Wallet object with 'created' here, save it to the db, and set the instance as the 'open' one
        try {
            await _store_wallet_with(
                server.DocumentStore(),
                filename, password,
                created.address_string,
                created.sec_viewKey_string, created.sec_spendKey_string,
                created.mnemonic_string, created.mnemonic_language
            )
        } catch (e) {
            console.error(e)
            return server._write_error(500, "Error saving wallet", res)
        }
        try {
            await _open_wallet(server.DocumentStore(), filename, password) // this'll cause a login to occur via a WS conn open + subscr 
        } catch (e) {
            console.error(e)
            return server._write_error(500, "Error opening created & saved wallet", res)
        }
        server._write_success({/*intentionally empty*/}, res)
    }
}