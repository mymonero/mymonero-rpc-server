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
async function _store_wallet(
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
//
//
var opened_wallet_struct = null
async function _open_wallet(store, filename, password)
{
    let doc = await _read_wallet_json_for_file_named(store, filename, password)
    opened_wallet_struct = {
        filename: filename,
        password: password, // kept in mem for subsequent writes on receipt of a tx or other update
        doc: doc
    }
    console.log("TODO: remainder of _open_wallet… open WS conn and start filling in : ", filename, doc)

    return doc
}
async function _close_wallet()
{
    if (opened_wallet_struct == null) {
        throw new Error("No wallet currently open")
    }
    
    console.log("TODO: close any open WS conns for that wallet")

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
        const lang_code = mnemonic_language_to_code(params.language)
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
            await _store_wallet(
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