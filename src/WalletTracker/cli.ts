import WebSocket from "ws"
import { WebSocketEvents } from "./events"
import {
    getCurrencyFromAddress, loadWalletBalanceLoop, printBalance, sendSocketMessage, setupKeyListener,
} from './utils'
import dotenv from 'dotenv';
import * as path from 'path';
import { json } from "stream/consumers";

dotenv.config({ path: path.resolve('../../.env') });

const WEB_SOCKET = process.env.WEB_SOCKET!
const ws = new WebSocket(WEB_SOCKET)
const address = process.argv[2]
const currency = getCurrencyFromAddress(address)

let balance: number | undefined
let price: number | undefined

async function shutdown() {
    Array.apply(null, Array(4)).forEach(() => process.stdout.write('\n'))
    await ws.close()
    process.exit(0)
}


ws.on('open', () => {
    sendSocketMessage(ws, WebSocketEvents.SetupWallet, address)

    // the user can update the wallet balance by press Enter key
    setupKeyListener({
        onEnter: () => sendSocketMessage(ws, WebSocketEvents.ReadBalance),
        onClose: () => shutdown(),
    })
})

ws.on('message', (json: string) => {
    const { data, type } = JSON.parse(json)

    switch (type) {
        case WebSocketEvents.BalanceUpdated:
            {
                balance = data.balance
                printBalance(currency, price, balance)
                break
            }
        case WebSocketEvents.PriceUpdated:
            {
                price = data.price
                printBalance(currency, price, balance)
                break
            }
    }
})

ws.on('close', () => shutdown())