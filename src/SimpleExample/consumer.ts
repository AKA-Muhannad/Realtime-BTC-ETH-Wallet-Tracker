import { Kafka } from "kafkajs";
import dotenv from 'dotenv';
import * as path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER!


async function runConsumer() {
    try {
        const kafka = new Kafka({
            clientId: 'myapp',
            brokers: [KAFKA_BROKER_ADDRESS]
        })
        // admin interface to create a topic
        const consumer = kafka.consumer({
            groupId: 'workers'
        })
        console.log('Consumer Connecting... 🤌')
        await consumer.connect()
        console.log('Consumer Connected! ✅')

        await consumer.subscribe({
            topic: 'Users',
            fromBeginning: true
        })

        await consumer.run({
            eachMessage: async (payload) => {
                console.log(`Message received: ${payload.message.value}`)
            }
        })


        // console.log('Topic has been created successflly 👍')
        // await consumer.disconnect()
    } catch (error) {
        console.log(`Something went wrong!! ❌`)
        console.log(error)

    } finally {
        // process.exit(0)
    }
}

runConsumer()