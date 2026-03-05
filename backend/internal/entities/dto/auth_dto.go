package dto

type OAuthAccessToken struct {
	AccessToken  string `json:"access_token" binding:"required"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
	TokenType    string `json:"token_type"`
}

type UserInfo struct {
	Username           string   `json:"username"`
	Email              string   `json:"email" binding:"required"`
	Avatar             string   `json:"avatar"`
	FirstName          string   `json:"first_name"`
	LastName           string   `json:"last_name"`
	FirstNameEn        string   `json:"first_name_en"`
	LastNameEn         string   `json:"last_name_en"`
	IsTechnicalAccount bool     `json:"is_technical_account"`
	IsActive           bool     `json:"is_active"`
	SysId              int      `json:"sys_id" binding:"required"`
	LdapGroups         []string `json:"ldap_groups"`
}

type UserProfile struct {
	OneSecretId   string
	OneSecretName string
}
