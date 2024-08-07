package main

import (
	"fmt"
	"open-pos/internal/controller"
	"open-pos/internal/enum"
	"open-pos/internal/model"
	"open-pos/internal/utils"
	"os"

	"golang.org/x/term"
)

func generateAdmin(tmpEmail string, tmpPassword string) {
	var (
		email    string
		password string
	)

	email = tmpEmail
	password = tmpPassword

	if email == "" {
		fmt.Print("Admin email: ")
		fmt.Scanln(&email)
	}

	if password == "" {
		fmt.Print("Admin password: ")
		pwBytes, _ := term.ReadPassword(int(os.Stdin.Fd()))
		password = string(pwBytes)
		fmt.Println()
	}

	dbClient := utils.ConnectDB()
	utils.AutoMigrateDB(dbClient)
	defer utils.DisconnectDB(dbClient)

	var user model.User
	var userData controller.UserPayload

	dbClient.Where("level = ?", enum.Admin).Find(&user)

	userData.Name = "Admin"
	userData.Email = email
	userData.Password = password

	if err := userData.Fill(&user); err != nil {
		fmt.Println(err)
		os.Exit(0)
	}

	err := dbClient.Save(&user).Error
	if err != nil {
		fmt.Println("Failed to generate admin user")
		fmt.Println(err)
		os.Exit(0)
	}

	fmt.Println("Success generating admin user")
}
