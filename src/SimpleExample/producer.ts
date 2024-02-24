import { Kafka } from "kafkajs";
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER!

async function runProducer() {
    try {
        const kafka = new Kafka({
            clientId: 'myapp',
            brokers: [KAFKA_BROKER_ADDRESS]
        })
        // admin interface to create a topic
        const producer = kafka.producer()
        console.log('Connecting... 🤌')
        await producer.connect()
        console.log('Connected! ✅')

        for (let i = 0; i < 1_000_000; i++) {
            await producer.send({
                topic: "Users",
                messages: [{
                    value: `Testing ...${i}`,
                }]
            });
        }
        console.log('Message has been created successflly 👍')
        await producer.disconnect()
    } catch (error) {
        console.log(`Something went wrong!! ❌`)
        console.log(error)

    } finally {
        process.exit(0)
    }
}

runProducer()