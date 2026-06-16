package db

import (
	"context"
	"database/sql"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"

	"sectionlap/backend/models"
)

func New(databaseURL string) (*bun.DB, error) {
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(databaseURL)))

	db := bun.NewDB(sqldb, pgdialect.New())

	if err := sqldb.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func Migrate(db *bun.DB) error {
	ctx := context.Background()

	if _, err := db.NewCreateTable().Model((*models.Section)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	if _, err := db.NewCreateTable().Model((*models.Booking)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	if _, err := db.NewCreateTable().Model((*models.UserRole)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}

	return nil
}
