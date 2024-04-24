package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	var command string = getArgs(1)

	if command == "" {
		printHelp()
		os.Exit(0)
	}

	switch command {
	case "generate-admin":
		username := getArgs(2)
		password := getArgs(3)
		generateAdmin(username, password)
	case "generate-ts-types":
		generateToTS()
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
	fmt.Println("  generate-ts-types - Generate types for typescript frontend")
	fmt.Println()
}

func getArgs(index int) string {
	if len(os.Args) >= index+1 {
		return os.Args[index]
	} else {
		return ""
	}
}
