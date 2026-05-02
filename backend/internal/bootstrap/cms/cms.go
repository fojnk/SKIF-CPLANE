package cms

import (
	"context"
	"embed"
	"encoding/json"
	"strings"
	"time"

	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/repository"
	appsvc "gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/service/app"
)

//go:embed defaults/about.md defaults/study.md defaults/about_links.md defaults/updates.seed.json
var defaultsFiles embed.FS

type seedUpdate struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Content     string `json:"content"`
	ReleaseDate string `json:"release_date"`
	IsPublished bool   `json:"is_published"`
}

func readEmbedded(path string) (string, error) {
	b, err := defaultsFiles.ReadFile(path)
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(b)), nil
}

func isBlank(s string) bool {
	return strings.TrimSpace(s) == ""
}

func readSeedUpdates() ([]seedUpdate, error) {
	raw, err := defaultsFiles.ReadFile("defaults/updates.seed.json")
	if err != nil {
		return nil, err
	}
	var seeds []seedUpdate
	if err := json.Unmarshal(raw, &seeds); err != nil {
		return nil, err
	}
	return seeds, nil
}

// EnsureDefaults fills CMS tables when they are still empty (fresh install). Safe to run on every startup.
func EnsureDefaults(ctx context.Context, repo *repository.Repository, l *logger.Logger) {
	if repo == nil || l == nil {
		return
	}
	app := appsvc.NewAppService(repo)

	about, err := app.GetAppAbout(ctx)
	if err != nil {
		l.Error("cms bootstrap: read app about", err)
	} else if isBlank(about.Content) && isBlank(about.Links) {
		content, rerr := readEmbedded("defaults/about.md")
		if rerr != nil {
			l.Error("cms bootstrap: read defaults/about.md", rerr)
		} else {
			links, lerr := readEmbedded("defaults/about_links.md")
			if lerr != nil {
				l.Error("cms bootstrap: read defaults/about_links.md", lerr)
			} else {
				_, uerr := app.UpdateAppAbout(ctx, &content, &links)
				if uerr != nil {
					l.Error("cms bootstrap: update app about", uerr)
				} else {
					l.Info("cms bootstrap: applied default «О платформе» content")
				}
			}
		}
	}

	upcoming, err := app.GetAppUpcoming(ctx)
	if err != nil {
		l.Error("cms bootstrap: read app upcoming", err)
	} else if isBlank(upcoming.Content) {
		content, rerr := readEmbedded("defaults/study.md")
		if rerr != nil {
			l.Error("cms bootstrap: read defaults/study.md", rerr)
		} else {
			_, uerr := app.UpdateAppUpcoming(ctx, content)
			if uerr != nil {
				l.Error("cms bootstrap: update app upcoming", uerr)
			} else {
				l.Info("cms bootstrap: applied default «Обучение» content")
			}
		}
	}

	_, total, err := app.ListAppUpdates(ctx, true, 1, 0)
	if err != nil {
		l.Error("cms bootstrap: list app updates", err)
		return
	}
	if total > 0 {
		return
	}

	seeds, err := readSeedUpdates()
	if err != nil {
		l.Error("cms bootstrap: read default updates", err)
		return
	}
	for _, row := range seeds {
		ts, perr := time.Parse(time.RFC3339, row.ReleaseDate)
		if perr != nil {
			l.Error("cms bootstrap: parse release_date", perr)
			continue
		}
		_, cerr := app.CreateAppUpdate(ctx, row.Title, row.Description, row.Content, nil, nil, ts, row.IsPublished)
		if cerr != nil {
			l.Error("cms bootstrap: create app update", cerr)
			return
		}
	}
	l.Info("cms bootstrap: applied default app updates")
}
