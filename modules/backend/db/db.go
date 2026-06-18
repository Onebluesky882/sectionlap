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
	if _, err := db.NewCreateTable().Model((*models.Feedback)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}

	// Additive migrations for new columns
	_, _ = db.ExecContext(ctx, `ALTER TABLE sections ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ`)

	// Drop old CASCADE constraints if they exist (replaced by RESTRICT below)
	drops := []string{
		`ALTER TABLE sections DROP CONSTRAINT IF EXISTS fk_sections_teacher`,
		`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_section`,
		`ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_student`,
	}
	for _, drop := range drops {
		_, _ = db.ExecContext(ctx, drop)
	}

	// Foreign key constraints — RESTRICT prevents deleting a user/section
	// that still has dependent records (sections, bookings).
	fks := []string{
		`ALTER TABLE sections ADD CONSTRAINT fk_sections_teacher
		 FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT`,
		`ALTER TABLE bookings ADD CONSTRAINT fk_bookings_section
		 FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT`,
		`ALTER TABLE bookings ADD CONSTRAINT fk_bookings_student
		 FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE RESTRICT`,
	}
	for _, fk := range fks {
		_, _ = db.ExecContext(ctx, fk) // ignored if constraint already exists
	}

	return nil
}
