import { Kafka, logLevel } from "kafkajs";
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import * as path from 'path';

dotenv.config({ path: path.resolve('../../.env') });

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER! // the address it cannot be null!

const EXAMPLE_TOPIC = 'example-topic'
const EXAMPLE_CONSUMER = 'example-consumer'


const kafka = new Kafka({
    brokers: [KAFKA_BROKER_ADDRESS], // We specified one kafka broker
    logLevel: logLevel.ERROR
})

const producer = kafka.producer()
// to consume the messages
const consumer = kafka.consumer({ groupId: EXAMPLE_CONSUMER })

// connect the producter
async function main() {
    try {
        await producer.connect()

        await consumer.connect()
        await consumer.subscribe({ topic: EXAMPLE_TOPIC })
        await consumer.run({
            eachMessage: async ({ message }) => {
                console.log({
                    offest: message.offset,
                    value: message.value?.toString(),
                    key: message.key?.toString()
                })
            }
        },)

        // disconnect the consumer and the producer before stopping the app
        process.on('SIGTERM', async () => {
            await consumer.disconnect()
            await producer.disconnect()
            process.exit(0)
        })
        while (true) {
            await new Promise(async (res) => {
                await producer.send({
                    topic: EXAMPLE_TOPIC,
                    messages: [{
                        key: faker.string.uuid(),
                        value: faker.internet.userName()
                    }]
                })
                setTimeout(() => res(null), 3 * Math.random() * 1000)
            })

        }

    } catch (error) {
        console.log(`Something went wrong!! ❌`)
        console.log(error)
    }
}

main()