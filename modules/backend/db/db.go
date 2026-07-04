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
	if _, err := db.NewCreateTable().Model((*models.TeacherProfile)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	if _, err := db.NewCreateTable().Model((*models.StudentProfile)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	if _, err := db.NewCreateTable().Model((*models.VisualPlan)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	if _, err := db.NewCreateTable().Model((*models.Lesson)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	if _, err := db.NewCreateTable().Model((*models.LessonClip)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}
	if _, err := db.NewCreateTable().Model((*models.TeacherWallet)(nil)).IfNotExists().Exec(ctx); err != nil {
		return err
	}

	// Additive migrations for new columns
	_, _ = db.ExecContext(ctx, `ALTER TABLE sections ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'`)
	_, _ = db.ExecContext(ctx, `ALTER TABLE sections ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ`)
	_, _ = db.ExecContext(ctx, `ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE`)
	_, _ = db.ExecContext(ctx, `ALTER TABLE sections ADD COLUMN IF NOT EXISTS questions JSONB NOT NULL DEFAULT '[]'`)
	_, _ = db.ExecContext(ctx, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS answers JSONB NOT NULL DEFAULT '[]'`)
	_, _ = db.ExecContext(ctx, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_slip_r2_key TEXT`)
	_, _ = db.ExecContext(ctx, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slip_verification_raw TEXT`)
	_, _ = db.ExecContext(ctx, `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS declared_at TIMESTAMPTZ`)

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

	// Lessons/clips are owned content, not booking-style relations — CASCADE
	// deletion is correct here (unlike the RESTRICT constraints above).
	cascadeFks := []string{
		`ALTER TABLE lessons ADD CONSTRAINT fk_lessons_section
		 FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE`,
		`ALTER TABLE lesson_clips ADD CONSTRAINT fk_lesson_clips_lesson
		 FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE`,
	}
	for _, fk := range cascadeFks {
		_, _ = db.ExecContext(ctx, fk) // ignored if constraint already exists
	}

	return nil
}
