package main

import (
	"net/http"
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

	utils.ImplementValidator(e)

	jwtUtils := utils.NewJwt()
	jwtMiddleware := jwtUtils.SetupMiddleware()

	e.GET("/swagger/*", echoSwagger.WrapHandler)

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "hello world")
	})

	auth := e.Group("/auth")
	auth.POST("/login", utils.RegisterController(dbClient, controller.AuthLogin))

	products := e.Group("/products")
	products.Use(jwtMiddleware)
	products.GET("", utils.RegisterController(dbClient, controller.ListProduct))
	products.POST("", utils.RegisterController(dbClient, controller.CreateProduct))
	products.GET("/:id", utils.RegisterController(dbClient, controller.FindProduct))
	products.PATCH("/:id", utils.RegisterController(dbClient, controller.UpdateProduct))
	products.DELETE("/:id", utils.RegisterController(dbClient, controller.DeleteProduct))

	users := e.Group("/users")
	products.Use(jwtMiddleware)
	users.POST("", utils.RegisterController(dbClient, controller.Register))
	users.GET("", utils.RegisterController(dbClient, controller.ListUsers))
	users.GET("/:id", utils.RegisterController(dbClient, controller.FindUser))
	users.PATCH("/:id", utils.RegisterController(dbClient, controller.UpdateUser))
	users.DELETE("/:id", utils.RegisterController(dbClient, controller.DeleteUser))

	e.Logger.Fatal(e.Start(":8080"))
}
