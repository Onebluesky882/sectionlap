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

	// Additive migrations for new columns
	_, _ = db.ExecContext(ctx, `ALTER TABLE sections ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ`)

	// Foreign key constraints (idempotent — ignored if already exist)
	fks := []string{
		`ALTER TABLE sections ADD CONSTRAINT fk_sections_teacher
		 FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE`,
		`ALTER TABLE bookings ADD CONSTRAINT fk_bookings_section
		 FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE`,
		`ALTER TABLE bookings ADD CONSTRAINT fk_bookings_student
		 FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE`,
	}
	for _, fk := range fks {
		_, _ = db.ExecContext(ctx, fk) // ignore error if constraint already exists
	}

	return nil
}
