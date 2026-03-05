package migrations

import (
	"errors"
	"fmt"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/stdlib"
	"gitlab.corp.mail.ru/ai/streamflow/backend/cplane/internal/logger"
	"os"
	"regexp"
	"sort"
	"strconv"
)

type Migration struct {
	Version  int
	Filename string
}

func RunMigrations(pool *pgxpool.Pool, l *logger.Logger) {
	migrationsPath := "/migrations/up"

	dbCon := stdlib.OpenDBFromPool(pool)

	// Create migration instance
	driver, err := postgres.WithInstance(dbCon, &postgres.Config{})
	if err != nil {
		l.Error("Ошибка подключения к бд: ", err)
		return
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://"+migrationsPath,
		"postgres",
		driver,
	)
	if err != nil {
		l.Error("Ошибка при создании мигратора: ", err)
		return
	}

	version, _, err := m.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		l.Error("Ошибка получения версии базы: %v", err)
		return
	}

	l.Info(fmt.Sprintf("Текущая версия базы: %d\n", version))

	// Находим все файлы миграций и определяем максимальную версию
	migrations, err := getMigrations(migrationsPath)
	if err != nil {
		l.Error("Ошибка определения последней версии: %v", err)
		return
	}

	maxVersion := migrations[len(migrations)-1].Version

	l.Info(fmt.Sprintf("Последняя версия миграции: %d\n", maxVersion))

	if version >= uint(maxVersion) {
		l.Info("База уже обновлена до последней версии.")
		return
	}

	// Применяем только одну миграцию (следующую за текущей)
	l.Info("Применяются новые миграции...")
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		l.Error("Ошибка при применении миграций: %v", err)
		return
	}
}

func getMigrations(migrationsDir string) ([]Migration, error) {
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return []Migration{}, err
	}

	// Регулярка для поиска файлов вида: 000001_name.up.sql
	re := regexp.MustCompile(`^(\d+)_.*\.(up)\.sql$`)
	var migrations []Migration

	for _, file := range files {
		matches := re.FindStringSubmatch(file.Name())
		if len(matches) == 3 {
			v, err := strconv.Atoi(matches[1])
			if err == nil {
				migrations = append(migrations, Migration{
					Version:  v,
					Filename: file.Name(),
				})
			}
		}
	}

	if len(migrations) == 0 {
		return []Migration{}, fmt.Errorf("не найдены миграции")
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}
