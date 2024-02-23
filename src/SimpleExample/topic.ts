import { Kafka } from "kafkajs";
import dotenv from 'dotenv';


async function run() {
    try {
        const kafka = new Kafka({
            clientId: 'myapp',
            brokers: [process.env.KAFKA_BROKER!]
        })
        // admin interface to create a topic
        const admin = kafka.admin()
        console.log('Connecting... 🤌')
        await admin.connect()
        console.log('Connected! ✅')

        // it's A-M , N-Z
        await admin.createTopics({
            topics: [{
                topic: 'Users',
                numPartitions: 2,
            }]
        })
        console.log('Topic has been created successflly 👍')
        await admin.disconnect()
    } catch (error) {
        console.log(`Something went wrong!! ❌`)
        console.log(error)
    } finally {
        process.exit(0)
    }
}

run()