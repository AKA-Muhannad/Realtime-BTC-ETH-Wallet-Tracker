import { Kafka } from "kafkajs";
import dotenv from 'dotenv';
import * as path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER!

async function runTopic() {
    try {
        const kafka = new Kafka({
            clientId: 'myapp',
            brokers: [KAFKA_BROKER_ADDRESS]
        })
        // admin interface to create a topic
        const admin = kafka.admin()
        console.log('Connecting... 🤌')
        await admin.connect()
        console.log('Connected! ✅')

        // it's A-M , N-Z
        // await admin.createTopics({
        //     waitForLeaders: true,
        //     topics: [{
        //         topic: 'Users',
        //         numPartitions: 2,
        //     }]
        // })
        await admin.createTopics({
            waitForLeaders: true,

            topics: [{
                topic: "currency_price",
                numPartitions: 2,
            },
            {
                topic: 'wallet_balance',
                numPartitions: 2,
            },
            {
                topic: 'task_to_read_balance',
                numPartitions: 2,
            }]
        })
        console.log('Topic has been created successflly 👍')
        console.log('Topic has been created successflly 👍')
        await admin.disconnect()
    } catch (error) {
        console.log(`Something went wrong!! ❌`)
        console.log(error)

    }
}

runTopic()