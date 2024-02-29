import { Spot, WebsocketStream } from '@binance/connector-typescript';
import { Kafka, logLevel } from 'kafkajs'
import { KafkaTopics } from './events'
import * as dotenv from 'dotenv';
import * as path from 'path';
// const { Spot } = require('@binance/connector')


dotenv.config({ path: path.resolve('../../.env') });

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER!

const BTC_USDT_TICKER = 'btcusdt'
const ETH_USDT_TICKER = 'ethusdt'
const client = new WebsocketStream()
const kafka = new Kafka({
    brokers: [KAFKA_BROKER_ADDRESS],
    logLevel: logLevel.ERROR
})
const producer = kafka.producer()

async function runPrice() {
    try {
        /* from here it will start
            and it will not stop until to reach to the
            await producer.disconnect()
        */
        await producer.connect()
        console.log('ss')
        // to get the updated price of BTC and ETH
        const callbacks = {
            message: async (json: string) => {
                // using destructuring extracting the stream and data properties from the parsed object
                const { stream, data } = JSON.parse(json)
                const currency = stream.split('usdt@ticker')[0]
                const price = Number(data.c)
                console.log(price)
                const payload = JSON.stringify({ price })

                await producer.send({
                    topic: KafkaTopics.CurrencyPrice,
                    messages: [
                        { key: currency, value: payload }
                    ]
                })
            }
        }
        // get the price of BTC and ETH in realtime
        const wsRef = new WebsocketStream({ callbacks: callbacks, combinedStreams: true })
        wsRef.subscribe([`${BTC_USDT_TICKER}@ticker`, `${ETH_USDT_TICKER}@ticker`])
        process.on('SIGTERM', async () => {
            wsRef.unsubscribe(KafkaTopics.CurrencyPrice)
            await producer.disconnect()
            process.exit(0)
        
        })
        // const wsRef = await client.combinedstream([
        //     `${BTC_USDT_TICKER}@ticker`,
        //     `${ETH_USDT_TICKER}@ticker`],
        //     callbacks)
        // process.on('SIGTERM', async () => {
        //     client.unsubscribe(wsRef)
        //     // stop
        //     await producer.disconnect()
        //     process.exit(0)
        // })

        console.log('Started successfully')
    } catch (error) {
        console.log('something went wrong ❌')
        console.log(error)
    }
}

runPrice()