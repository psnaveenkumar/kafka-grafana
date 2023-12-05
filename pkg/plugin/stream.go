package plugin

import (
	"context"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func (d *Datasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {
	log.DefaultLogger.Info("RunStream called", "request", req)

	for {
		select {
		case <-ctx.Done():
			log.DefaultLogger.Info("Context done, finish streaming", "path", req.Path)
			return nil
		default:
			msg, event := d.client.ConsumerPull()
			if event == nil {
				continue
			}
			frame := data.NewFrame("response")
			frame.Fields = append(frame.Fields,
				data.NewField("time", nil, make([]time.Time, 1)),
			)
			var frame_time time.Time
			if d.client.TimestampMode == "now" {
				frame_time = time.Now()
			} else {
				frame_time = msg.Timestamp
			}
			log.DefaultLogger.Info("Offset", msg.Offset)
			log.DefaultLogger.Info("timestamp", frame_time)
			frame.Fields[0].Set(0, frame_time)

			//cnt := 1

			frame.Fields = append(frame.Fields,
				data.NewField("name", nil, []string{msg.Value.Name}),
				data.NewField("value", nil, []float64{msg.Value.Value}),
				data.NewField("quality", nil, []string{msg.Value.Quality}),
				data.NewField("timestamp", nil, []time.Time{msg.Timestamp}),
			)
			err := sender.SendFrame(frame, data.IncludeAll)

			if err != nil {
				log.DefaultLogger.Error("Error sending frame", "error", err)
				continue
			}
		}
	}
}

func (d *Datasource) SubscribeStream(_ context.Context, req *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	log.DefaultLogger.Info("SubscribeStream called", "request", req)
	// Extract the query parameters
	var path []string = strings.Split(req.Path, "_")
	topic := path[0]
	partition, _ := strconv.Atoi(path[1])
	autoOffsetReset := path[2]
	timestampMode := path[3]
	// Initialize Consumer and Assign the topic
	d.client.TopicAssign(topic, int32(partition), autoOffsetReset, timestampMode)
	//status := backend.SubscribeStreamStatusPermissionDenied
	status := backend.SubscribeStreamStatusOK

	return &backend.SubscribeStreamResponse{
		Status: status,
	}, nil
}

func (d *Datasource) PublishStream(_ context.Context, _ *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	return &backend.PublishStreamResponse{
		Status: backend.PublishStreamStatusPermissionDenied,
	}, nil
}
