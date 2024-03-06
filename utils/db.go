package utils

import (
	"open-pos/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type db_utils struct {
	DbClient *gorm.DB
}

func (this *db_utils) ConnectDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	this.DbClient = db
	return db
}

func (this *db_utils) DisconnectDB() {
	sqlDB, err := this.DbClient.DB()
	if err != nil {
		panic(err)
	}
	sqlDB.Close()
	this.DbClient = nil
}

func (this *db_utils) AutoMigrate() {
	err := this.DbClient.AutoMigrate(&model.Product{})
	if err != nil {
		panic(err)
	}
}

var DB db_utils
