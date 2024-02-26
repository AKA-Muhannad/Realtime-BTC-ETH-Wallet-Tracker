import axios from "axios";
import { Kafka, logLevel } from "kafkajs";
import { KafkaTopics } from "./events";
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BLOCKCYPHER_API_URL = process.env.BLOCKCYPHER_API_URL
const BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN
const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER!


const kafka = new Kafka({ brokers: [KAFKA_BROKER_ADDRESS], logLevel: logLevel.ERROR })
const producer = kafka.producer()

const groupId = 'balance-crawler'
const taskConsumer = kafka.consumer({ groupId, retry: { retries: 0 } })

export async function getWalletBalance(currency: string, address: string) {
    let url = `${BLOCKCYPHER_API_URL}/${currency}/main/addrs/${address}/balance`
    // if the token was exist
    if (BLOCKCYPHER_TOKEN) url += `?token=${BLOCKCYPHER_TOKEN}`

    const { data } = await axios.get(url)

    if (currency === 'btc') return data.balance / 100000000
    else return data.balance / 1000000000000000
}

async function runBalance() {
    try {
        // const admin = kafka.admin()
        // console.log('Connecting... 🤌')
        // await admin.connect()
        // console.log('Connected! ✅')
        // const topics = [];
        // // Loop through enum values and create topics
        // for (const topic of Object.values(KafkaTopics)) {
        //     topics.push({
        //         topic,
        //         numPartitions: 2, // Set the number of partitions as required
        //     });
        // }
        // console.log(topics)
        // await admin.createTopics({
        //     waitForLeaders: true,
        //     topics: topics
        // })
        await taskConsumer.subscribe({topic: KafkaTopics.TaskToReadBalance, fromBeginning: false})
        //console.log('Topic has been created successflly 👍')
        console.log('Started successflly 👍')
        
        await producer.connect()
        await taskConsumer.connect()
        
        //when we recevied each task we will load the balance
        await taskConsumer.run({
            eachMessage: async ({ message }) => {
                const { address, currency } = JSON.parse(message.value!.toString())
                const balance = await getWalletBalance(currency, address)
                const payload = JSON.stringify({ balance })
                // Loop to send all the topics
               
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