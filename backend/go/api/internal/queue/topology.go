package queue

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

var RabbitMQTopology = []Topology{
	{
		Exchange: Exchange{
			Name: "go.api.events",
			Type: "topic",
		},
		Queues: []Queue{
			{
				Name:     "go.processor.run.created",
				Bindings: []string{"run.created"},
			},
			{
				Name:     "go.processor.run.pause-requested",
				Bindings: []string{"run.pause-requested"},
			},
			{
				Name:     "go.processor.run.resume-requested",
				Bindings: []string{"run.resume-requested"},
			},
			{
				Name:     "go.processor.run.finalize-requested",
				Bindings: []string{"run.finalize-requested"},
			},
		},
	},
	{
		Exchange: Exchange{
			Name: "go.api.randomize",
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
			Name: "go.processor.events",
			Type: "topic",
		},
		Queues: []Queue{
			{
				Name:     "go.api.run.started",
				Bindings: []string{"run.started"},
			},
			{
				Name:     "go.api.run.failed",
				Bindings: []string{"run.failed"},
			},
			{
				Name:     "go.api.run.completed",
				Bindings: []string{"run.completed"},
			},
		},
	},
}
