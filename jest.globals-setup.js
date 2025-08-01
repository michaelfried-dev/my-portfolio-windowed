// Polyfill TextEncoder/TextDecoder for Jest before any modules are loaded
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Polyfill ReadableStream, WritableStream, and TransformStream for Jest/Node.js
const {
  ReadableStream,
  WritableStream,
  TransformStream,
} = require('web-streams-polyfill/dist/ponyfill.js')
global.ReadableStream = ReadableStream
global.WritableStream = WritableStream
global.TransformStream = TransformStream

// Polyfill MessagePort, MessageChannel, and MessageEvent for Node.js/Jest
try {
  const { MessageChannel, MessagePort } = require('worker_threads')
  global.MessageChannel = MessageChannel
  global.MessagePort = MessagePort
  global.MessageEvent = class MessageEvent {}
} catch (e) {
  // worker_threads not available (very old Node), skip
}
