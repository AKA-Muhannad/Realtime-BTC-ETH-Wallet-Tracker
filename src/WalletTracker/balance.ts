import axios from "axios";
import { Kafka, logLevel } from "kafkajs";
import { KafkaTopics } from "./events";
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BLOCKCYPHER_API_URL = process.env.BLOCKCYPHER_API_URL
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN
const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER!


console.log(BLOCKCYPHER_API_URL)
console.log(BLOCKCYPHER_TOKEN)
console.log(KAFKA_BROKER_ADDRESS)

const kafka = new Kafka({ brokers: [KAFKA_BROKER_ADDRESS], logLevel: logLevel.ERROR })
const producer = kafka.producer()

const groupId = 'balance-crawler'
const taskConsumer = kafka.consumer({ groupId, retry: { retries: 0 } })

async function getWalletBalance(currency: string, address: string) {
    let url = `${BLOCKCYPHER_API_URL}/${currency}/main/addrs/${address}/balance`
    if (BLOCKCYPHER_TOKEN) url += `?token=${BLOCKCYPHER_TOKEN}`

    const { data } = await axios.get(url)

    if (currency === 'btc') return data.balance / 100000000
    else return data.balance / 1000000000000000
}

async function runBalance() {
    try {
        await producer.connect()
        await taskConsumer.connect()

        await taskConsumer.subscribe({
            topic: KafkaTopics.TaskToReadBalance,
            fromBeginning: false
        })

        //when we recevied each task we will load the balance
        await taskConsumer.run({
            eachMessage: async ({ message }) => {
                const { address, currency } = JSON.parse(message.value!.toString())
                const balance = await getWalletBalance(currency, address)
                const payload = JSON.stringify({ balance })
                await producer.send({
                    topic: KafkaTopics.WalletBalance,
                    messages: [
                        { key: address, value: payload }
                    ]
                })
            }
        })
    } catch (error) {
        console.log('something went wrong ❌')
        console.log(error)
    }

}

runBalance()