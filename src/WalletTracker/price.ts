import { Spot } from '@binance/connector-typescript';
import { Kafka, logLevel } from 'kafkajs'
import { KafkaTopics } from './events'
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve('../../.env') });

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER!

const BTC_USDT_TICKER = 'btcusdt'
const ETH_USDT_TICKER = 'ethusdt'
const client = new Spot()
const kafka = new Kafka({
    brokers: [KAFKA_BROKER_ADDRESS],
    logLevel: logLevel.ERROR
})
const producer = kafka.producer()

async function runPrice() {
    const callbacks = {
        message: async (json: string) => {
            const { stream, data } = JSON.parse(json)
            const currency = stream.split('usdt@ticker')[0]
            const price = Number(data.c)
            const payload = JSON.stringify({ price })

            await producer.send({
                topic: KafkaTopics.CurrencyPrice,
                messages: [{
                    key: currency,
                    value: payload
                }]
            })
        }
    }
}

runPrice()