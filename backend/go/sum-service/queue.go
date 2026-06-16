package main

import (
	"encoding/json"

	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQ struct {
	connection *amqp.Connection
	channel    *amqp.Channel
}

func NewRabbitMQ() *RabbitMQ {
	return &RabbitMQ{}
}

func (r *RabbitMQ) Connect() error {
	conn, err := amqp.Dial("amqp://@localhost")
	if err != nil {
		return err
	}

	r.connection = conn
	r.channel, err = conn.Channel()

	if err != nil {
		return err
	}

	return nil
}

func (r *RabbitMQ) Setup(topologies []Topology) {
	for _, topology := range topologies {
		r.channel.ExchangeDeclare(
			topology.Exchange.Name,
			topology.Exchange.Type,
			true,
			false,
			false,
			false,
			nil,
		)

		for _, queue := range topology.Queues {
			r.channel.QueueDeclare(
				queue.Name,
				true,
				false,
				false,
				false,
				nil,
			)

			for _, binding := range queue.Bindings {
				r.channel.QueueBind(
					queue.Name,
					binding,
					topology.Exchange.Name,
					false,
					nil,
				)
			}
		}
	}
}

type PublishConfig struct {
	Headers *amqp.Table
}

func (r *RabbitMQ) Publish(routingKey string, message any, config PublishConfig) error {
	body, err := json.Marshal(message)

	if err != nil {
		return err
	}

	err = r.channel.Publish(
		"go.sum.randomize", // exchange
		routingKey,         // routing key
		false,              // mandatory
		false,              // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
			Headers:     *config.Headers,
		})

	if err != nil {
		return err
	}

	return nil
}

type ConsumerCallbackMessage = []byte
type ConsumerCallbackHeader = map[string]interface{}
type ConsumerCallbackMetadata = map[string]interface{}

type ConsumerCallback func(ConsumerCallbackMessage, ConsumerCallbackHeader, ConsumerCallbackMetadata) error

func (r *RabbitMQ) Consume(queue string, handle ConsumerCallback) {
	incomingMessages, err := r.channel.Consume(
		queue, //queue
		"",    // consumer-tag
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)

	if err != nil {
		panic(err)
	}

	go func() {
		for message := range incomingMessages {
			headers := message.Headers

			metadata := make(map[string]interface{})
			metadata["routing-key"] = message.RoutingKey

			err := handle(message.Body, headers, metadata)

			if err != nil {
				message.Nack(false, true)
			}

			message.Ack(false)
		}
	}()
}

type Exchange struct {
	Name string
	Type string
}

type Queue struct {
	Name     string
	Bindings []string
}

type Topology struct {
	Exchange Exchange
	Queues   []Queue
}
