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
/*
THIS FILE ONLY FOR TEST THE KAFKA
*/
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
const faker_1 = require("@faker-js/faker");
const path = __importStar(require("path"));
dotenv_1.default.config({ path: path.resolve('../../.env') });
const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER; // the address it cannot be null!
const EXAMPLE_TOPIC = 'example-topic';
const EXAMPLE_CONSUMER = 'example-consumer';
const kafka = new kafkajs_1.Kafka({
    brokers: [KAFKA_BROKER_ADDRESS], // We specified one kafka broker
    logLevel: kafkajs_1.logLevel.ERROR
});
const producer = kafka.producer();
// to consume the messages
const consumer = kafka.consumer({ groupId: EXAMPLE_CONSUMER });
// connect the producter
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield producer.connect();
            yield consumer.connect();
            yield consumer.subscribe({ topic: EXAMPLE_TOPIC });
            yield consumer.run({
                eachMessage: ({ message }) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    console.log({
                        offest: message.offset,
                        value: (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString(),
                        key: (_b = message.key) === null || _b === void 0 ? void 0 : _b.toString()
                    });
                })
            });
            // disconnect the consumer and the producer before stopping the app
            process.on('SIGTERM', () => __awaiter(this, void 0, void 0, function* () {
                yield consumer.disconnect();
                yield producer.disconnect();
                process.exit(0);
            }));
            while (true) {
                yield new Promise((res) => __awaiter(this, void 0, void 0, function* () {
                    yield producer.send({
                        topic: EXAMPLE_TOPIC,
                        messages: [{
                                key: faker_1.faker.string.uuid(),
                                value: faker_1.faker.internet.userName()
                            }]
                    });
                    setTimeout(() => res(null), 3 * Math.random() * 1000);
                }));
            }
        }
        catch (error) {
            console.log(`Something went wrong!! ❌`);
            console.log(error);
        }
    });
}
main();
