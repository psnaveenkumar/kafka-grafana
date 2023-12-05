package kafka

type Config struct {
	BootstrapServers string `json:"bootstrapServers"`
	SecurityProtocol string `json:"securityProtocol"`
	SaslMechanisms   string `json:"saslMechanisms"`
	SaslUsername     string `json:"saslUsername"`
	SaslPassword     string `json:"saslPassword"`
	// TODO: If Debug is before HealthcheckTimeout, then json.Unmarshall
	// silently fails to parse the timeout from the s.JSONData.  Figure out why.
	HealthcheckTimeout int32  `json:"healthcheckTimeout"`
	Debug              string `json:"debug"`
}
