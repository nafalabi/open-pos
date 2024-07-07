package main

import (
	"open-pos/internal/controller"
	controller_webhook "open-pos/internal/controller/webhook"
	_ "open-pos/docs"
	live_notifier "open-pos/internal/service/live-notifier"
	utils "open-pos/internal/utils"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	echoSwagger "github.com/swaggo/echo-swagger"
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

	dbClient := utils.ConnectDB()
	utils.AutoMigrateDB(dbClient)
	defer utils.DisconnectDB(dbClient)

	utils.SetupValidator(e)
	utils.SetupErrorHandler(e)

	jwtUtils := utils.NewJwt()
	jwtMiddleware := jwtUtils.SetupMiddleware()

	liveNotifier := live_notifier.New()
	go liveNotifier.RunListener()

	e.GET("/swagger/*", echoSwagger.EchoWrapHandler(func(conf *echoSwagger.Config) {
		conf.PersistAuthorization = true
	}))

	auth := e.Group("/auth")
	auth.POST("/login", utils.RegisterController(dbClient, controller.AuthLogin))
	auth.GET("/userinfo", utils.RegisterController(dbClient, controller.UserInfo), jwtMiddleware)
	auth.POST("/refresh", utils.RegisterController(dbClient, controller.RefreshToken))

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

	categories := e.Group("/categories")
	categories.Use(jwtMiddleware)
	categories.GET("", utils.RegisterController(dbClient, controller.ListCategory))
	categories.POST("", utils.RegisterController(dbClient, controller.CreateCategory))
	categories.GET("/:id", utils.RegisterController(dbClient, controller.FindCategory))
	categories.PATCH("/:id", utils.RegisterController(dbClient, controller.UpdateCategory))
	categories.DELETE("/:id", utils.RegisterController(dbClient, controller.DeleteCategory))

	orders := e.Group("/orders")
	orders.Use(jwtMiddleware)
	orders.POST("", utils.RegisterController(dbClient, controller.CreateOrder))
	orders.GET("", utils.RegisterController(dbClient, controller.ListOrder))
	orders.GET("/:id", utils.RegisterController(dbClient, controller.FindOrder))
	orders.POST("/:id/cashpay", utils.RegisterController(dbClient, controller.CashpayOrder))
	orders.POST("/:id/complete", utils.RegisterController(dbClient, controller.CompleteOrder))
	orders.POST("/:id/cancel", utils.RegisterController(dbClient, controller.CancelOrder))
	orders.GET("/:id/payment-info", utils.RegisterController(dbClient, controller.GetPaymentInfo))
	orders.POST("/:id/refresh-status", utils.RegisterController(dbClient, controller.RefreshOrderStatus))

	paymentmethods := e.Group("/payment-methods")
	paymentmethods.Use(jwtMiddleware)
	paymentmethods.GET("", utils.RegisterController(dbClient, controller.ListPaymentMethod))
	paymentmethods.GET("/:code", utils.RegisterController(dbClient, controller.FindPaymentMethod))
	paymentmethods.GET("/:code/fee", utils.RegisterController(dbClient, controller.GetPaymentFee))

	webhook := e.Group("/webhook")
	webhook.POST("/midtrans", controller_webhook.HandleMidtransNotification(dbClient, liveNotifier))

	ln := e.Group("/live-notifier")
	ln.GET("", func(c echo.Context) error { return liveNotifier.HandleWebsocket(c) })

	e.Logger.Fatal(e.Start(":8080"))
}
