package test

import (
	"open-pos/internal/internal/utils"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitTestDB() (*gorm.DB, error) {
	config := gorm.Config{}
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &config)
	utils.AutoMigrateDB(db)
	return db, err
}
