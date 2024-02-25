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
const ws_1 = __importDefault(require("ws"));
const events_1 = require("./events");
const utils_1 = require("./utils");
const dotenv_1 = __importDefault(require("dotenv"));
const path = __importStar(require("path"));
dotenv_1.default.config({ path: path.resolve('../../.env') });
const WEB_SOCKET = process.env.WEB_SOCKET;
const ws = new ws_1.default(WEB_SOCKET);
const address = process.argv[1];
console.log(address);
const currency = (0, utils_1.getCurrencyFromAddress)(address);
let balance;
let price;
function shutdown() {
    return __awaiter(this, void 0, void 0, function* () {
        Array.apply(null, Array(4)).forEach(() => process.stdout.write('\n'));
        yield ws.close();
        process.exit(0);
    });
}
function runCLI() {
    try {
        ws.on('open', () => {
            (0, utils_1.sendSocketMessage)(ws, events_1.WebSocketEvents.SetupWallet, address);
            // the user can update the wallet balance by press Enter key
            (0, utils_1.setupKeyListener)({
                onEnter: () => (0, utils_1.sendSocketMessage)(ws, events_1.WebSocketEvents.ReadBalance),
                onClose: () => shutdown(),
            });
            (0, utils_1.loadWalletBalanceLoop)(ws, 60);
        });
        ws.on('message', (json) => {
            const { data, type } = JSON.parse(json);
            switch (type) {
                case events_1.WebSocketEvents.BalanceUpdated:
                    {
                        balance = data.balance;
                        (0, utils_1.printBalance)(currency, price, balance);
                        break;
                    }
                case events_1.WebSocketEvents.PriceUpdated:
                    {
                        price = data.price;
                        (0, utils_1.printBalance)(currency, price, balance);
                        break;
                    }
            }
        });
        ws.on('close', () => shutdown());
    }
    catch (error) {
        console.log('something went wrong ❌');
        console.log(error);
    }
}
runCLI();
