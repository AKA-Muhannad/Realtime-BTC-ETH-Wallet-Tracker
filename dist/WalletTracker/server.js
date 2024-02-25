"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const ws_1 = require("ws");
const kafkajs_1 = require("kafkajs");
const utils_1 = require("./utils");
const events_1 = require("./events");
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
dotenv_1.default.config({ path: path.resolve('../../.env') });
const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER;
const PORT = Number(process.env.PORT);
console.log(PORT);
const kafka = new kafkajs_1.Kafka({ brokers: [KAFKA_BROKER_ADDRESS], logLevel: kafkajs_1.logLevel.ERROR });
const producer = kafka.producer();
const priceConsumerGroupId = `server-price-${(0, uuid_1.v4)()}`;
const balanceConsumerGroupId = `server-balance-${(0, uuid_1.v4)()}`;
const priceConsumer = kafka.consumer({ groupId: priceConsumerGroupId });
const balanceConsumer = kafka.consumer({ groupId: balanceConsumerGroupId });
// the serve communicates with the CLI through websocket
const wss = new ws_1.WebSocketServer({ port: PORT });
const clients = new Map(); // socketId -> WebSocket
const clientWallets = new Map(); // socketId -> Wallet
const walletBalances = new Map(); // address -> balance
const prices = { btc: null, eth: null }; // currncy -> price
function notifyClientsAboutPriceUpdate(currency, price) {
    clients.forEach((ws, id) => {
        const wallet = clientWallets.get(id);
        if ((wallet === null || wallet === void 0 ? void 0 : wallet.currency) === currency)
            (0, utils_1.sendSocketMessage)(ws, events_1.WebSocketEvents.PriceUpdated, { price });
    });
}
function notifyClientsAboutBalanceUpdate(address, balance) {
    clientWallets.forEach((wallet, clientId) => {
        if (wallet.address === address) {
            const ws = clients.get(clientId);
            if (ws)
                (0, utils_1.sendSocketMessage)(ws, events_1.WebSocketEvents.BalanceUpdated, { balance });
        }
    });
}
function pleaseCrawlBalance(address, currency) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = JSON.stringify({ address, currency });
        yield producer.send({
            topic: events_1.KafkaTopics.TaskToReadBalance,
            messages: [{ key: address, value: payload }],
        });
    });
}
function runServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield priceConsumer.connect();
            yield balanceConsumer.connect();
            yield producer.connect();
            yield priceConsumer.subscribe({ topic: events_1.KafkaTopics.CurrencyPrice, fromBeginning: false });
            yield balanceConsumer.subscribe({ topic: events_1.KafkaTopics.WalletBalance, fromBeginning: false });
            yield priceConsumer.run({
                eachMessage: ({ message }) => __awaiter(this, void 0, void 0, function* () {
                    const { price } = JSON.parse(message.value.toString());
                    const currency = message.key.toString();
                    price[currency] = price;
                    notifyClientsAboutPriceUpdate(currency, price);
                })
            });
            yield balanceConsumer.run({
                eachMessage: ({ message }) => __awaiter(this, void 0, void 0, function* () {
                    const { balance } = JSON.parse(message.value.toString());
                    const address = message.key.toString();
                    walletBalances.set(address, balance);
                    notifyClientsAboutBalanceUpdate(address, balance);
                })
            });
            wss.on('connection', (ws) => {
                const socketId = (0, uuid_1.v4)();
                clients.set(socketId, ws);
                ws.on('message', (payload) => __awaiter(this, void 0, void 0, function* () {
                    const { type, data } = JSON.parse(payload);
                    switch (type) {
                        case events_1.WebSocketEvents.SetupWallet:
                            {
                                const address = data;
                                const currency = (0, utils_1.getCurrencyFromAddress)(address);
                                clientWallets.set(socketId, { address, currency });
                                const price = prices[currency];
                                if (price)
                                    notifyClientsAboutPriceUpdate(currency, price);
                                const balance = walletBalances.get(address);
                                if (balance)
                                    notifyClientsAboutBalanceUpdate(address, balance);
                                else
                                    yield pleaseCrawlBalance(address, currency);
                                break;
                            }
                    }
                }));
            });
        }
        catch (error) {
            console.log('something went wrong ❌');
            console.log(error);
        }
    });
}
runServer();
