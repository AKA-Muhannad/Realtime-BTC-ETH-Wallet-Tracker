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
const axios_1 = __importDefault(require("axios"));
const kafkajs_1 = require("kafkajs");
const events_1 = require("./events");
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
dotenv_1.default.config({ path: path.resolve(__dirname, '../../.env') });
const BLOCKCYPHER_API_URL = process.env.BLOCKCYPHER_API_URL;
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN;
const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER;
console.log(BLOCKCYPHER_API_URL);
console.log(BLOCKCYPHER_TOKEN);
console.log(KAFKA_BROKER_ADDRESS);
const kafka = new kafkajs_1.Kafka({ brokers: [KAFKA_BROKER_ADDRESS], logLevel: kafkajs_1.logLevel.ERROR });
const producer = kafka.producer();
const groupId = 'balance-crawler';
const taskConsumer = kafka.consumer({ groupId, retry: { retries: 0 } });
function getWalletBalance(currency, address) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = `${BLOCKCYPHER_API_URL}/${currency}/main/addrs/${address}/balance`;
        if (BLOCKCYPHER_TOKEN)
            url += `?token=${BLOCKCYPHER_TOKEN}`;
        const { data } = yield axios_1.default.get(url);
        if (currency === 'btc')
            return data.balance / 100000000;
        else
            return data.balance / 1000000000000000;
    });
}
function runBalance() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield producer.connect();
            yield taskConsumer.connect();
            yield taskConsumer.subscribe({
                topic: events_1.KafkaTopics.TaskToReadBalance,
                fromBeginning: false
            });
            //when we recevied each task we will load the balance
            yield taskConsumer.run({
                eachMessage: ({ message }) => __awaiter(this, void 0, void 0, function* () {
                    const { address, currency } = JSON.parse(message.value.toString());
                    const balance = yield getWalletBalance(currency, address);
                    const payload = JSON.stringify({ balance });
                    yield producer.send({
                        topic: events_1.KafkaTopics.WalletBalance,
                        messages: [
                            { key: address, value: payload }
                        ]
                    });
                })
            });
        }
        catch (error) {
            console.log('something went wrong ❌');
            console.log(error);
        }
    });
}
runBalance();
