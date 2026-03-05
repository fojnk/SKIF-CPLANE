package requests

type CreateRobotRequest struct {
	Name string `json:"name" validate:"required,max=128"`
}

type GenerateTokenForRobotRequest struct {
	Name string `json:"name" validate:"required,max=128"`
}

type DeleteAllTokenForRobotRequest struct {
	Name string `json:"name" validate:"required,max=128"`
}
