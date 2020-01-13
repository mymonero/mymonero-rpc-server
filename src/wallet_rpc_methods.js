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
//
const nettype = mymonero_core.nettype_utils.network_type.MAINNET // TODO: pass via server options or method function args
//
function mnemonic_language_to_code(language)
{
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
module.exports =
{
    create_wallet: function(params, server, res)
    {
        // params.filename
        // params.password
        const filename = params.filename
        const password = params.password
        const lang_code = mnemonic_language_to_code(params.language)
        mymonero_core.monero_utils_promise.then(function(monero_utils) {
            try {
                var created = monero_utils.newly_created_wallet(lang_code, nettype);
            } catch (e) {
                server._write_error(500, e, res)
                console.log(e)
            }
            //
            //
            console.log("newly_created_wallet", created)
            // TODO: save this newly created wallet in the sqlite db for wallets 


            server._write_success({/*intentionally blank*/}, res)
        })
    }
}