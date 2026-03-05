package oauth

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/google/uuid"
)

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

type User struct {
	Username           string `json:"username"`
	Email              string `json:"email"`
	Avatar             string `json:"avatar"`
	FirstName          string `json:"first_name"`
	LastName           string `json:"last_name"`
	FirstNameEn        string `json:"first_name_en"`
	LastNameEn         string `json:"last_name_en"`
	IsTechnicalAccount bool   `json:"is_technical_account"`
	IsActive           bool   `json:"is_active"`
	SysId              int    `json:"sys_id"`
}

// Словарь для хранения кодов авторизации
var authorizationCodes = make(map[string]string)

func Start() error {
	http.HandleFunc("/oauth/authorize/", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		clientID := q.Get("client_id")
		redirectURI := q.Get("redirect_uri")
		responseType := q.Get("response_type")
		//_ := q.Get("scope")
		//_ := q.Get("state")
		//q.Get("client_id")
		if clientID != "OneFlow" || responseType != "code" {
			http.Error(w, "Invalid parameters", http.StatusBadRequest)
			return
		}

		// Генерируем код авторизации и сохраняем его
		authorizationCode := uuid.New().String()
		authorizationCodes[authorizationCode] = clientID

		// Перенаправляем пользователя с кодом авторизации
		redirectURL := redirectURI + "?code=" + authorizationCode
		http.Redirect(w, r, redirectURL, http.StatusFound)
	})

	http.HandleFunc("/oauth/token/", func(w http.ResponseWriter, r *http.Request) {
		// Проверяем метод запроса
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		// Получаем параметры запроса для получения токена
		clientID := r.FormValue("client_id")
		clientSecret := r.FormValue("client_secret")
		grantType := r.FormValue("grant_type")
		code := r.FormValue("code")

		// Проверяем параметры запроса
		if clientID != "OneFlow" || clientSecret != "oneflow-secret" || grantType != "authorization_code" {
			log.Printf("Wrong params: clientID: %s clientSecret: %s grantType: %s", clientID, clientSecret, grantType)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Проверяем код авторизации
		storedClientID, ok := authorizationCodes[code]
		if !ok || storedClientID != clientID {
			log.Printf("Invalid code %s for client %s", code, clientID)
			http.Error(w, "Invalid authorization code", http.StatusBadRequest)
			return
		}

		// Возвращаем токен доступа
		tokenResponse := TokenResponse{
			AccessToken: uuid.New().String(),
			TokenType:   "bearer",
		}
		jsonResponse, err := json.Marshal(tokenResponse)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_, err = w.Write(jsonResponse)
	})

	http.HandleFunc("/oauth/info/", func(w http.ResponseWriter, r *http.Request) {
		// Проверяем наличие токена доступа
		accessToken := r.Header.Get("Authorization")
		if accessToken == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		user := User{
			Username:           "john",
			Email:              "john@example.com",
			Avatar:             "",
			FirstName:          "Джон",
			LastName:           "До",
			FirstNameEn:        "Jhon",
			LastNameEn:         "Doe",
			IsTechnicalAccount: false,
			IsActive:           false,
			SysId:              123,
		}
		jsonResponse, err := json.Marshal(user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_, err = w.Write(jsonResponse)

	})

	// Запускаем сервер в горутине, чтобы не блокировать выполнение
	go func() {
		if err := http.ListenAndServe(":9100", nil); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Printf("OAuth server error: %v\n", err)
		}
	}()

	return nil
}
