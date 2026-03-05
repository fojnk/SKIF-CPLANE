package logger

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

type LoggerConfig struct {
	Level            string `yaml:"level"`
	FilePath         string `yaml:"file_path"`
	RotateMaxSizeMB  int    `yaml:"rotate_max_size_MB"`
	RotateMaxAgeDays int    `yaml:"rotate_max_age_days"`
}

type Logger struct {
	l *zap.Logger
}

func NewLogger(config *LoggerConfig) (*Logger, error) {
	if config == nil {
		return &Logger{l: zap.NewNop()}, nil
	}

	file := zapcore.AddSync(&lumberjack.Logger{
		Filename: config.FilePath,
		MaxSize:  config.RotateMaxSizeMB,
		MaxAge:   config.RotateMaxAgeDays,
	})

	var level zapcore.Level
	switch config.Level {
	case "debug":
		level = zapcore.DebugLevel
	case "info":
		level = zapcore.InfoLevel
	case "warn":
		level = zapcore.WarnLevel
	case "error":
		level = zapcore.ErrorLevel
	}

	productionCfg := zap.NewProductionEncoderConfig()
	fileEncoder := zapcore.NewJSONEncoder(productionCfg)
	core := zapcore.NewTee(
		zapcore.NewCore(fileEncoder, file, level),
	)

	return &Logger{
		l: zap.New(core),
	}, nil
}

func (l *Logger) With(key, value string) *Logger {
	return &Logger{
		l: l.l.With(zap.String(key, value)),
	}
}

func (l *Logger) Info(msg string) {
	l.l.Info(msg)
}

func (l *Logger) Warn(msg string) {
	l.l.Warn(msg)
}

func (l *Logger) Error(msg string, err error) {
	l.l.Error(msg, zap.Error(err))
}

func (l *Logger) Debug(msg string) {
	l.l.Debug(msg)
}

func (l *Logger) NewLoggerMiddleware() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			next.ServeHTTP(ww, r)

			if r.RequestURI == "/api/v1/ping" {
				return
			}

			latency := time.Since(start)
			fields := []zapcore.Field{
				zap.Int("status", ww.Status()),
				zap.Duration("took", latency),
				zap.String("remote", r.RemoteAddr),
				zap.String("request", r.RequestURI),
				zap.String("method", r.Method),
			}
			requestID := fmt.Sprintf("%s", r.Context().Value(middleware.RequestIDKey))
			fields = append(fields, zap.String("request_id", requestID))
			l.l.Info("request completed", fields...)
		}
		return http.HandlerFunc(fn)
	}
}
