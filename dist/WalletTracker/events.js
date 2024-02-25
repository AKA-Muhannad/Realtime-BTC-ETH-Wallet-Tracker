"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaTopics = exports.WebSocketEvents = void 0;
var WebSocketEvents;
(function (WebSocketEvents) {
    // From client to server
    WebSocketEvents["SetupWallet"] = "setup_wallet";
    WebSocketEvents["ReadBalance"] = "read_balance";
    // From server to client
    WebSocketEvents["BalanceUpdated"] = "balance_updated";
    WebSocketEvents["PriceUpdated"] = "price_updated";
})(WebSocketEvents || (exports.WebSocketEvents = WebSocketEvents = {}));
var KafkaTopics;
(function (KafkaTopics) {
    KafkaTopics["TaskToReadBalance"] = "task_to_read_balance";
    KafkaTopics["WalletBalance"] = "wallet_balance";
    KafkaTopics["CurrencyPrice"] = "currency_price";
})(KafkaTopics || (exports.KafkaTopics = KafkaTopics = {}));
