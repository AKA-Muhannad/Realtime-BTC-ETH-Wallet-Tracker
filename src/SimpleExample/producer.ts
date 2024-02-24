import { Kafka } from "kafkajs";
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    try {
        const kafka = new Kafka({
            clientId: 'myapp',
            brokers: [process.env.KAFKA_BROKER!]
        })
        // admin interface to create a topic
        const producer = kafka.producer()
        console.log('Connecting... 🤌')
        await producer.connect()
        console.log('Connected! ✅')

        for( let i =0 ; i < 1_000_000 ; i++) {
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

run()