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
const kafkajs_1 = require("kafkajs");
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
dotenv_1.default.config({ path: path.resolve(__dirname, '../../.env') });
const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER;
function runProducer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const kafka = new kafkajs_1.Kafka({
                clientId: 'myapp',
                brokers: [KAFKA_BROKER_ADDRESS]
            });
            // admin interface to create a topic
            const producer = kafka.producer();
            console.log('Connecting... 🤌');
            yield producer.connect();
            console.log('Connected! ✅');
            for (let i = 0; i < 1000000; i++) {
                yield producer.send({
                    topic: "Users",
                    messages: [{
                            value: `Testing ...${i}`,
                        }]
                });
            }
            console.log('Message has been created successflly 👍');
            yield producer.disconnect();
        }
        catch (error) {
            console.log(`Something went wrong!! ❌`);
            console.log(error);
        }
        finally {
            process.exit(0);
        }
    });
}
runProducer();
