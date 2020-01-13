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
const http = require('http')
const url = require('url')
//
class Server
{
    constructor(options)
    {
        this.port = options.port || 18083
        this.server_name = options.server_name || "an RPC server"
    }
    //
    // Interface - Imperatives
    start()
    {
        const self = this
        if (self.hasStarted == true) {
            throw "[Server/start] Code fault; start() may only be called once"
            return
        }
        self.hasStarted = true
        console.log("Starting " + this.server_name + " on " + this.port)
        function _server_handler_fn(req, res) 
        {
            if (req.method != 'POST') {
                self._write_error(400, "Expected POST", res) // TODO: what does RPC server do?
                return
            }
            __gather_RPC_POST(req, res, function(method_name, params)
            {
                self._overridable_didReceiveReq(method_name, params, res)
            })
        }
        function __gather_RPC_POST(req, res__forExc, success_fn) // not specifically necessary to factor this, but useful for clarity
        { // handles errors via res__forExc
            let body = ""
            req.on('data', chunk => {
                body += chunk.toString() // converting Buffer to string
            });
            req.on('end', function()
            {
                var req_body; 
                try {
                    req_body = JSON.parse(body)
                } catch (e) {
                    self._write_error(400, "Unable to parse JSON POST body", res__forExc) // TODO: what does RPC server do?
                    return
                }
                const method_name = req_body.method
                const params = req_body.params
                if (typeof method_name !== 'string' || !method_name.length) {
                    self._write_error(400, "Expected string body .method", res__forExc) // TODO: what does RPC server do?
                    return
                }
                success_fn(method_name, params)
            })
        }
        http.createServer(_server_handler_fn).listen(this.port)
    }
    //
    // Internal - Imperatives - 
    _write_error(code, msg, res)
    {
        res.writeHead(code, { 'Content-Type': 'text/plain' })
        res.write(msg)
        res.end()
    }
    _write_success(body, res)
    {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.write(JSON.stringify(body)) 
        res.end()
    }
    //
    // Internal - Delegation
    _overridable_didReceiveReq(method_name, optl__params, res)
    { // see e.g. wallet_rpc_server.js
        res.writeHead(500, {'Content-Type': 'text/plain'})
        res.write("Do not instantiate rpc_server_base directly but extend and implement _overridable_didReceiveReq") // TODO: what does RPC server do?
        res.end()
    }
}
module.exports = Server