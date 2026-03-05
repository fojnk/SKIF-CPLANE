package dto

type Permission struct {
	ObjectType      string `json:"object_type"`
	ObjectAttribute string `json:"object_attribute"`
	ObjectID        int32  `json:"object_id"`
	Action          string `json:"action"`
}
