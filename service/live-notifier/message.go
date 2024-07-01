package live_notifier

import "encoding/json"

type MessageAction = string

const (
	ActionUpdated MessageAction = "updated"
)

type Message struct {
	Entity   string        `json:"entity"`
	EntityID *string       `json:"entity_id"`
	Action   MessageAction `json:"action"`
}

func (lm Message) ToByte() []byte {
	result, _ := json.Marshal(lm)

	return result
}
