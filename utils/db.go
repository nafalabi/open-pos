package utils

import (
	"open-pos/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type db_utils struct {
	DbClient *gorm.DB
}

func (dbu *db_utils) ConnectDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	dbu.DbClient = db
	return db
}

func (dbu *db_utils) DisconnectDB() {
	sqlDB, err := dbu.DbClient.DB()
	if err != nil {
		panic(err)
	}
	sqlDB.Close()
	dbu.DbClient = nil
}

func (dbu *db_utils) AutoMigrate() {
	err := dbu.DbClient.AutoMigrate(
		&model.Product{},
		&model.User{},
		&model.Category{},
		&model.Order{},
		&model.OrderItem{},
	)
	if err != nil {
		panic(err)
	}
}

var DB db_utils
