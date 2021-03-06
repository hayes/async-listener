// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


if (!process.addAsyncListener) require('../index.js');
if(!global.setImmediate) global.setImmediate = setTimeout;

var assert = require('assert');
var net = require('net');
var fs = require('fs');

var actualAsync = 0;
var expectAsync = 0;


process.on('exit', function() {
  console.log('expected', expectAsync);
  console.log('actual  ', actualAsync);
  assert.equal(expectAsync, actualAsync);
  console.log('ok');
});


// --- Begin Testing --- //

function onAsync() {
  actualAsync++;
}


var id;
process.nextTick(function() {
  process.removeAsyncListener(id);
});
id = process.addAsyncListener({create: onAsync});


// Test listeners side-by-side
var b = setInterval(function() {
  clearInterval(b);
});
expectAsync++;

var c = setInterval(function() {
  clearInterval(c);
});
expectAsync++;

setTimeout(function() { });
expectAsync++;

setTimeout(function() { });
expectAsync++;

process.nextTick(function() { });
expectAsync++;

process.nextTick(function() { });
expectAsync++;

setImmediate(function() { });
expectAsync++;

setImmediate(function() { });
expectAsync++;

setTimeout(function() { }, 100);
expectAsync++;

setTimeout(function() { }, 100);
expectAsync++;


// Async listeners should propagate with nested callbacks
var interval = 3;

process.nextTick(function() {
  setTimeout(function() {
    setImmediate(function() {
      var i = setInterval(function() {
        if (--interval <= 0)
          clearInterval(i);
      });
      expectAsync++;
    });
    expectAsync++;
    process.nextTick(function() {
      setImmediate(function() {
        setTimeout(function() { }, 200);
        expectAsync++;
      });
      expectAsync++;
    });
    expectAsync++;
  });
  expectAsync++;
});
expectAsync++;


// Test callbacks from fs I/O
fs.stat('something random', function() { });
expectAsync++;

setImmediate(function() {
  fs.stat('random again', function() { });
  expectAsync++;
});
expectAsync++;


// Test net I/O
var server = net.createServer(function() { });
expectAsync++;

server.listen(8080, function() {
  server.close();
  expectAsync++;
});
expectAsync++;
