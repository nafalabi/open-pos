package main

import (
	"fmt"
	"open-pos/enum"
	"open-pos/model"
	"open-pos/utils"
	"os"
	"path/filepath"

	"golang.org/x/term"
)

func main() {
	var command string
	getArgs(&command, 1)

	if command == "" {
		printHelp()
		os.Exit(0)
	}

	switch command {
	case "generate-admin":
		generateAdmin()
	default:
		printHelp()
	}
}

func printHelp() {
	basename := filepath.Base(os.Args[0])
	fmt.Printf("Usage: %s command\n", basename)
	fmt.Println()
	fmt.Println("Available commands:")
	fmt.Println()
	fmt.Println("  generate-admin - Create and replace the admin user")
	fmt.Println()
}

func getArgs(targetVar *string, index int) {
	if len(os.Args) >= index+1 {
		*targetVar = os.Args[index]
	} else {
		*targetVar = ""
	}
}

func generateAdmin() {
	var (
		email    string
		password string
	)

	getArgs(&email, 2)
	getArgs(&password, 3)

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

	utils.DB.ConnectDB()
	utils.DB.AutoMigrate()
	dbClient := utils.DB.DbClient
	defer utils.DB.DisconnectDB()

	var user model.User
	var userData model.UserFillable

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
