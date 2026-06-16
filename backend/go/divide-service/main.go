package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

type DividePayload struct {
	RunID     string  `json:"runId"`
	Value     float64 `json:"value"`
	StepID    string  `json:"stepId"`
	Operation string  `json:"operation"`
	By        float64 `json:"by"`
}

type SuccessResult struct {
	RunID  string  `json:"runId"`
	StepID string  `json:"stepId"`
	Result float64 `json:"result"`
}

type ErrorResult struct {
	RunID  string `json:"runId"`
	StepID string `json:"stepId"`
	Error  string `json:"error"`
}

func main() {
	rabbitMQ := NewRabbitMQ()
	err := rabbitMQ.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}

	topology := []Topology{
		{
			Exchange: Exchange{
				Name: "go.processor.events",
				Type: "topic",
			},
			Queues: []Queue{
				{
					Name:     "go.divide.execution.requested",
					Bindings: []string{"execution.division-requested"},
				},
			},
		},
		{
			Exchange: Exchange{
				Name: "go.divide.randomize",
				Type: "topic",
			},
			Queues: []Queue{
				{
					Name:     "go.randomize",
					Bindings: []string{"#"},
				},
			},
		},
		{
			Exchange: Exchange{
				Name: "go.divide.events",
				Type: "topic",
			},
			Queues: []Queue{
				{
					Name:     "go.processor.step.finished",
					Bindings: []string{"step.finished"},
				},
			},
		},
	}

	rabbitMQ.Setup(topology)

	rabbitMQ.Consume("go.divide.execution.requested", func(body []byte, headers map[string]interface{}, metadata map[string]interface{}) error {
		var payload DividePayload
		err := json.Unmarshal(body, &payload)
		if err != nil {
			log.Printf("Failed to unmarshal message: %v", err)
			return err
		}

		result, err := executeDivide(payload.Value, payload.By)

		config := PublishConfig{
			Headers: &amqp.Table{},
		}

		if err != nil {
			errorResult := ErrorResult{
				RunID:  payload.RunID,
				StepID: payload.StepID,
				Error:  err.Error(),
			}
			return rabbitMQ.Publish("step.finished", errorResult, config)
		}

		successResult := SuccessResult{
			RunID:  payload.RunID,
			StepID: payload.StepID,
			Result: result,
		}
		return rabbitMQ.Publish("step.finished", successResult, config)
	})

	fmt.Println("🚀 divide service is running...")

	select {} // Keep the main function running
}

func executeDivide(value, by float64) (float64, error) {
	time.Sleep(1000 * time.Millisecond)

	if rand.Float64() < 0.1 {
		return 0, fmt.Errorf("[divide-service]: random error occurred")
	}

	return value / by, nil
}
