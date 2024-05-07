package main

import (
	"open-pos/controller"
	_ "open-pos/docs"
	utils "open-pos/utils"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/swaggo/echo-swagger"
)

//	@title		Open POS API
//	@BasePath	/

//	@securityDefinitions.apikey	ApiKeyAuth
//	@in							header
//	@name						Authorization
//	@description    Type "Bearer" followed by a space and JWT token.

func main() {
	if err := godotenv.Load(); err != nil {
		panic("Error loading .env file")
	}

	e := echo.New()

	utils.DB.ConnectDB()
	utils.DB.AutoMigrate()
	dbClient := utils.DB.DbClient
	defer utils.DB.DisconnectDB()

	utils.SetupValidator(e)

	jwtUtils := utils.NewJwt()
	jwtMiddleware := jwtUtils.SetupMiddleware()

	e.GET("/swagger/*", echoSwagger.WrapHandler)

	auth := e.Group("/auth")
	auth.POST("/login", utils.RegisterController(dbClient, controller.AuthLogin))
	auth.GET("/userinfo", utils.RegisterController(dbClient, controller.UserInfo), jwtMiddleware)

	products := e.Group("/products")
	products.Use(jwtMiddleware)
	products.GET("", utils.RegisterController(dbClient, controller.ListProduct))
	products.POST("", utils.RegisterController(dbClient, controller.CreateProduct))
	products.GET("/:id", utils.RegisterController(dbClient, controller.FindProduct))
	products.PATCH("/:id", utils.RegisterController(dbClient, controller.UpdateProduct))
	products.DELETE("/:id", utils.RegisterController(dbClient, controller.DeleteProduct))

	users := e.Group("/users")
	users.Use(jwtMiddleware)
	users.POST("", utils.RegisterController(dbClient, controller.Register))
	users.GET("", utils.RegisterController(dbClient, controller.ListUsers))
	users.GET("/:id", utils.RegisterController(dbClient, controller.FindUser))
	users.PATCH("/:id", utils.RegisterController(dbClient, controller.UpdateUser))
	users.DELETE("/:id", utils.RegisterController(dbClient, controller.DeleteUser))

	images := e.Group("/images")
	images.POST("", utils.RegisterController(dbClient, controller.UploadImage), jwtMiddleware)
	images.Static("", "./storage/images")

	e.Logger.Fatal(e.Start(":8080"))
}
