import { Kafka, logLevel } from "kafkajs";
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

const KAFKA_BROKER_ADDRESS = process.env.KAFKA_BROKER! // the address it cannot be null!
const EXAMPLE_TOPIC = 'example-topic'


const kafka = new Kafka({
    brokers: [KAFKA_BROKER_ADDRESS], // We specified one kafka broker
     logLevel: logLevel.ERROR
})

const producer = kafka.producer()

// connect the producter
async function run() {
    await producer.connect()
}

run()