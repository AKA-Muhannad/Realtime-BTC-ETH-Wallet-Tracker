"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrencyFromAddress = exports.printBalance = exports.formatUSD = exports.loadWalletBalanceLoop = exports.sendSocketMessage = exports.setupKeyListener = void 0;
const readline_1 = __importDefault(require("readline"));
const events_1 = require("./events");
function setupKeyListener(handlers) {
    readline_1.default.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (_str, key) => {
        if (key.ctrl && key.name === 'c')
            handlers.onClose();
        else if (key.name === 'return')
            handlers.onEnter();
    });
}
exports.setupKeyListener = setupKeyListener;
function sendSocketMessage(ws, type, data) {
    if (ws.readyState === ws.CLOSED)
        return;
    const message = JSON.stringify({ type, data: data || null });
    ws.send(message);
}
exports.sendSocketMessage = sendSocketMessage;
function loadWalletBalanceLoop(ws, seconds) {
    setTimeout(() => {
        if (ws.readyState !== ws.CLOSED) {
            sendSocketMessage(ws, events_1.WebSocketEvents.ReadBalance);
            loadWalletBalanceLoop(ws, seconds);
        }
    }, seconds * 1000);
}
exports.loadWalletBalanceLoop = loadWalletBalanceLoop;
function formatUSD(amount) {
    const format = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    return format.format(amount);
}
exports.formatUSD = formatUSD;
function printBalance(currency, price, balance) {
    process.stdout.write(`Wallet 💰:  ${currency.toUpperCase()}\n`);
    process.stdout.write(`Price 🤑:   ${price ? formatUSD(Number(price)) : '...'}\n`);
    process.stdout.write(`Balance 💸: ${balance || '...'}\n`);
    process.stdout.write(`Value 💵:   ${balance !== undefined && price ? formatUSD(balance * price) : '...'}\n`);
    process.stdout.moveCursor(0, -4);
}
exports.printBalance = printBalance;
function getCurrencyFromAddress(address) {
    return address.startsWith('0x') ? 'eth' : 'btc';
}
exports.getCurrencyFromAddress = getCurrencyFromAddress;
