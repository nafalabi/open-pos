package utils

import (
	"open-pos/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("app.db?cache=shared&mode=rwc&_journal_mode=WAL"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	return db
}

func DisconnectDB(dbClient *gorm.DB) {
	sqlDB, err := dbClient.DB()
	if err != nil {
		panic(err)
	}
	sqlDB.Close()
	dbClient = nil
}

func AutoMigrateDB(dbClient *gorm.DB) {
	err := dbClient.AutoMigrate(
		&model.Product{},
		&model.User{},
		&model.Category{},
		&model.Order{},
		&model.OrderItem{},
		&model.Transaction{},
		&model.PaymentInfo{},
		&model.MidtransEvent{},
	)
	if err != nil {
		panic(err)
	}
}
