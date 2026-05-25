import { QueueConsumers } from "./consumer"
import { QueuePublishers } from "./publisher"

export class Queue {
    static initialize() {
        QueueConsumers.initialize()
        QueuePublishers.initialize()
    }
}
