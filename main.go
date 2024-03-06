package main

import (
	"net/http"
	"open-pos/controller"
	_ "open-pos/docs"
	utils "open-pos/utils"

	"github.com/labstack/echo/v4"
	"github.com/swaggo/echo-swagger"
)

//	@title		Open POS API
//	@BasePath	/

func main() {
	e := echo.New()

  utils.DB.ConnectDB()
	utils.DB.AutoMigrate()
  dbClient := utils.DB.DbClient
  defer utils.DB.DisconnectDB()

  utils.ImplementValidator(e)

	e.GET("/swagger/*", echoSwagger.WrapHandler)

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "hello world")
	})

	product := e.Group("/products")
	product.GET("", utils.RegisterController(dbClient, controller.ListProduct))
	product.POST("", utils.RegisterController(dbClient, controller.CreateProduct))
	product.GET("/:id", utils.RegisterController(dbClient, controller.FindProduct))
	product.PATCH("/:id", utils.RegisterController(dbClient, controller.UpdateProduct))
	product.DELETE("/:id", utils.RegisterController(dbClient, controller.DeleteProduct))

	e.Logger.Fatal(e.Start(":8080"))
}
