// Copyright (c) 2014-2019, MyMonero.com
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
"use strict"
//
const path = require('path')
//
class DocumentStore
{
	constructor(options)
	{
		const self = this
		self.options = options
		{
			const options_userDataAbsoluteFilepath = options.userDataAbsoluteFilepath
			if (!options_userDataAbsoluteFilepath || typeof options_userDataAbsoluteFilepath === 'undefined') {
				throw "options.userDataAbsoluteFilepath required"
			}
			//
			self.userDataAbsoluteFilepath = options_userDataAbsoluteFilepath
			//
			self.fs = options.fs
			if (!self.fs || typeof self.fs === 'undefined') {
				throw "options.fs required"
			}
		}
		// strip trailing slashes so we can just append path components with string ops internally (join is hairy on android due to it being a url instead of a path)
		var pathTo_dataSubdir = self.userDataAbsoluteFilepath // dirs are annoying in web, so using a file ext for detection instead
		while (pathTo_dataSubdir.endsWith('/')) {
			pathTo_dataSubdir = pathTo_dataSubdir.substring(0, pathTo_dataSubdir.length - 1)
		}
		self.pathTo_dataSubdir = pathTo_dataSubdir
		// console.log("self.pathTo_dataSubdir" , self.pathTo_dataSubdir)
	}
	//
	// Internal - Accessors
	__absPathTo(filename)
	{
		const self = this
		//
		return path.join(self.pathTo_dataSubdir, filename + ".json")
	}
	//
	// Interface - Accessors
	async read_stringInFileNamed(filename)
	{
		const self = this
		const filepath = self.__absPathTo(filename)
		return new Promise(function(resolve, reject) {
			self.fs.exists(filepath, function(exists)
			{ // ^-- this is implemented with .exists instead of .open, even though .exists is deprecated, in order to remain compatible with html5-fs for Cordova
				// TODO: ^-- is this still necessary?
				if (!exists) {
					resolve(null) // no error, but does not exist
					return
				}
				self.fs.readFile(filepath, { encoding: 'utf8' }, function(err, str) {
					if (err) {
						reject(err)
					} else {
						resolve(str)
					}
				})
			})
		})
	}
	//
	// Interface - Imperatives
	async removeDocument(filename)
	{ 
		const self = this
		return new Promise(function(resolve, reject) {
			self.fs.unlink(self.__absPathTo(filename), function(err)
			{
				if (!err) {
					numRemoved += 1
				}
				if (err) {
					reject(err)
				} else {
					resolve()
				}
			})
		})
	}
	//
	// Interface - Imperatives - Files
	async write(filename, toWrite)
	{
		const self = this
		var stringContents = null
		return new Promise(function(resolve, reject) {
			if (typeof toWrite === 'string') {
				stringContents = toWrite
			} else {
				try {
					stringContents = JSON.stringify(toWrite)
				} catch (e) {
					reject(e)
					return
				}
				if (!stringContents || typeof stringContents === 'undefined') { // just to be careful
					reject(new Error("Unable to stringify document for write."))
					return
				}
			}
			self.fs.writeFile(self.__absPathTo(filename), stringContents, function(err)
			{
				if (err) {
					reject(err)
				} else {
					resolve(toWrite)
				}
			})
		})
	}
}
module.exports = DocumentStore