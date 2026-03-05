package dto

import "time"

type BannerType string

const (
	BannerTypeReleaseBlock BannerType = "release_block"
	BannerTypeWarning      BannerType = "warning"
	BannerTypeInfo         BannerType = "info"
)

// Цвета по умолчанию для каждого типа
var bannerTypeColors = map[BannerType]string{
	BannerTypeReleaseBlock: "#FF0000", // красный
	BannerTypeWarning:      "#FFA500", // оранжевый
	BannerTypeInfo:         "#0000FF", // синий
}

func (bt BannerType) IsUnknown() bool {
	if _, exists := bannerTypeColors[bt]; exists {
		return false
	}

	return true
}

func (bt BannerType) Color() string {
	if color, exists := bannerTypeColors[bt]; exists {
		return color
	}

	return "#000000" // черный по умолчанию
}

type AppBanner struct {
	Id        int32      `json:"id"`
	Type      string     `json:"type"`
	Title     string     `json:"title"`
	Message   string     `json:"message"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Active    bool       `json:"active"`
	Color     string     `json:"color"`
	ColorDark string     `json:"color_dark"`
	Starts    *time.Time `json:"starts,omitempty"`
	Ends      *time.Time `json:"ends,omitempty"`
}
