package setters

import (
	"fmt"
	"strconv"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/requests"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/entities/responses"
)

func SetGetJobRequestParams(r *requests.GetJobRequest, paramName, paramValue string) *responses.ErrorResponse {
	if paramName == "job_id" {
		jobID, err := strconv.ParseInt(paramValue, 10, 64)
		if err != nil {
			return &responses.ErrorResponse{
				ExternalMessage: fmt.Sprintf("invalid job_id: %s", paramValue),
			}
		}
		r.JobID = jobID
		return nil
	}
	return &responses.ErrorResponse{
		ExternalMessage: fmt.Sprintf("unknown parameter: %s", paramName),
	}
}

func SetGetJobEventsRequestParams(r *requests.GetJobEventsRequest, paramName, paramValue string) *responses.ErrorResponse {
	switch paramName {
	case "job_id":
		jobID, err := strconv.ParseInt(paramValue, 10, 64)
		if err != nil {
			return &responses.ErrorResponse{
				ExternalMessage: fmt.Sprintf("invalid job_id: %s", paramValue),
			}
		}
		r.JobID = jobID
		return nil
	case "event_type":
		if paramValue != "" {
			r.EventType = &paramValue
		}
		return nil
	case "limit":
		if paramValue != "" {
			limit, err := strconv.ParseInt(paramValue, 10, 32)
			if err != nil {
				return &responses.ErrorResponse{
					ExternalMessage: fmt.Sprintf("invalid limit: %s", paramValue),
				}
			}
			limit32 := int32(limit)
			r.Limit = &limit32
		}
		return nil
	case "offset":
		if paramValue != "" {
			offset, err := strconv.ParseInt(paramValue, 10, 32)
			if err != nil {
				return &responses.ErrorResponse{
					ExternalMessage: fmt.Sprintf("invalid offset: %s", paramValue),
				}
			}
			offset32 := int32(offset)
			r.Offset = &offset32
		}
		return nil
	}
	return &responses.ErrorResponse{
		ExternalMessage: fmt.Sprintf("unknown parameter: %s", paramName),
	}
}

func SetCancelJobRequestParams(r *requests.CancelJobRequest, paramName, paramValue string) *responses.ErrorResponse {
	if paramName == "job_id" {
		jobID, err := strconv.ParseInt(paramValue, 10, 64)
		if err != nil {
			return &responses.ErrorResponse{
				ExternalMessage: fmt.Sprintf("invalid job_id: %s", paramValue),
			}
		}
		r.JobID = jobID
		return nil
	}
	return &responses.ErrorResponse{
		ExternalMessage: fmt.Sprintf("unknown parameter: %s", paramName),
	}
}

func SetRetryJobRequestParams(r *requests.RetryJobRequest, paramName, paramValue string) *responses.ErrorResponse {
	if paramName == "job_id" {
		jobID, err := strconv.ParseInt(paramValue, 10, 64)
		if err != nil {
			return &responses.ErrorResponse{
				ExternalMessage: fmt.Sprintf("invalid job_id: %s", paramValue),
			}
		}
		r.JobID = jobID
		return nil
	}
	return &responses.ErrorResponse{
		ExternalMessage: fmt.Sprintf("unknown parameter: %s", paramName),
	}
}

func SetGetJobTasksRequestParams(r *requests.GetJobTasksRequest, paramName, paramValue string) *responses.ErrorResponse {
	switch paramName {
	case "job_id":
		jobID, err := strconv.ParseInt(paramValue, 10, 64)
		if err != nil {
			return &responses.ErrorResponse{
				ExternalMessage: fmt.Sprintf("invalid job_id: %s", paramValue),
			}
		}
		r.JobID = jobID
		return nil
	case "status":
		if paramValue != "" {
			r.Status = &paramValue
		}
		return nil
	}
	return &responses.ErrorResponse{
		ExternalMessage: fmt.Sprintf("unknown parameter: %s", paramName),
	}
}

func SetListAllEventsRequestParams(r *requests.ListAllEventsRequest, paramName, paramValue string) *responses.ErrorResponse {
	switch paramName {
	case "job_id":
		if paramValue != "" {
			jobID, err := strconv.ParseInt(paramValue, 10, 64)
			if err != nil {
				return &responses.ErrorResponse{
					ExternalMessage: fmt.Sprintf("invalid job_id: %s", paramValue),
				}
			}
			r.JobID = &jobID
		}
		return nil
	case "entity_type":
		if paramValue != "" {
			r.EntityType = &paramValue
		}
		return nil
	case "entity_id":
		if paramValue != "" {
			entityID, err := strconv.ParseInt(paramValue, 10, 64)
			if err != nil {
				return &responses.ErrorResponse{
					ExternalMessage: fmt.Sprintf("invalid entity_id: %s", paramValue),
				}
			}
			r.EntityID = &entityID
		}
		return nil
	case "event_type":
		if paramValue != "" {
			r.EventType = &paramValue
		}
		return nil
	case "job_type":
		if paramValue != "" {
			r.JobType = &paramValue
		}
		return nil
	case "limit":
		if paramValue != "" {
			limit, err := strconv.ParseInt(paramValue, 10, 32)
			if err != nil {
				return &responses.ErrorResponse{
					ExternalMessage: fmt.Sprintf("invalid limit: %s", paramValue),
				}
			}
			limit32 := int32(limit)
			r.Limit = &limit32
		}
		return nil
	case "offset":
		if paramValue != "" {
			offset, err := strconv.ParseInt(paramValue, 10, 32)
			if err != nil {
				return &responses.ErrorResponse{
					ExternalMessage: fmt.Sprintf("invalid offset: %s", paramValue),
				}
			}
			offset32 := int32(offset)
			r.Offset = &offset32
		}
		return nil
	case "sort":
		if paramValue != "" {
			r.Sort = &paramValue
		}
		return nil
	case "order":
		if paramValue != "" {
			r.Order = &paramValue
		}
		return nil
	}
	return &responses.ErrorResponse{
		ExternalMessage: fmt.Sprintf("unknown parameter: %s", paramName),
	}
}
