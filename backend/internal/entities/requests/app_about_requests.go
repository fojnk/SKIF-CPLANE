package requests

type GetAppAboutRequest struct {
}

type UpdateAppAboutRequest struct {
	Content *string `json:"content,omitempty"`
	Links   *string `json:"links,omitempty"`
}
