package kafka

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

const MAX_EARLIEST int64 = 100

type Client struct {
	Consumer           *kafka.Consumer
	BootstrapServers   string
	TimestampMode      string
	SecurityProtocol   string
	SaslMechanisms     string
	SaslUsername       string
	SaslPassword       string
	Debug              string
	HealthcheckTimeout int32
}

type Data struct {
	Name           string    `json:"name"`
	ValueTimestamp time.Time `json:"valuetimestamp"`
	Quality        string    `json:"quality"`
	Value          float64   `json:"value"`
}

type Message struct {
	Value Data
	//Value     map[string]interface{}
	Timestamp time.Time
	Offset    kafka.Offset
}

const (
	groupID          = "kafka-datasource"
	enableAutoCommit = "false"
)

func NewClient(cfg Config) Client {
	return Client{
		BootstrapServers:   cfg.BootstrapServers,
		HealthcheckTimeout: cfg.HealthcheckTimeout,
	}
}

func (c *Client) initConsumer() {
	config := kafka.ConfigMap{
		"bootstrap.servers":  c.BootstrapServers,
		"group.id":           groupID,
		"enable.auto.commit": enableAutoCommit,
	}

	consumer, err := kafka.NewConsumer(&config)
	if err != nil {
		panic(err)
	}

	c.Consumer = consumer
}

func (c *Client) SubscribeTopics(topics []string) {
	c.Consumer.SubscribeTopics(topics, nil)
}

func (c *Client) TopicAssign(topic string, partition int32, autoOffsetReset string,
	timestampMode string) {
	//log.DefaultLogger.Info("check health", "request",)

	c.initConsumer()
	c.TimestampMode = timestampMode
	var err error
	var offset int64
	var high, low int64
	switch autoOffsetReset {
	case "latest":
		offset = int64(kafka.OffsetEnd)
	case "earliest":
		low, high, err = c.Consumer.QueryWatermarkOffsets(topic, partition, 100)
		if err != nil {
			panic(err)
		}
		if high-low > MAX_EARLIEST {
			offset = high - MAX_EARLIEST
		} else {
			offset = low
		}
	default:
		offset = int64(kafka.OffsetEnd)
	}

	topic_partition := kafka.TopicPartition{
		Topic:     &topic,
		Partition: partition,
		Offset:    kafka.Offset(offset),
		Metadata:  new(string),
		Error:     err,
	}
	partitions := []kafka.TopicPartition{topic_partition}
	err = c.Consumer.Assign(partitions)

	if err != nil {
		panic(err)
	}
}

func (c *Client) ConsumerPull() (Message, kafka.Event) {
	var message Message
	ev := c.Consumer.Poll(100)

	if ev == nil {
		return message, ev
	}

	switch e := ev.(type) {
	case *kafka.Message:
		json.Unmarshal([]byte(e.Value), &message.Value)
		message.Offset = e.TopicPartition.Offset
		message.Timestamp = e.Timestamp
	case kafka.Error:
		fmt.Fprintf(os.Stderr, "%% Error: %v: %v\n", e.Code(), e)
		if e.Code() == kafka.ErrAllBrokersDown {
			panic(e)
		}
	default:
	}
	return message, ev
}

func (c *Client) HealthCheck() error {
	c.initConsumer()

	topic := ""
	_, err := c.Consumer.GetMetadata(&topic, true, 200)
	if err != nil && err.(kafka.Error).Code() == kafka.ErrTransport {
		return err
	}

	return nil
}

func (c *Client) Close() {
	c.Consumer.Close()
}
