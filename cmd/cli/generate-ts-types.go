package main

import (
	"fmt"
	"open-pos/model"
	"os"
	"regexp"

	"github.com/tkrajina/typescriptify-golang-structs/typescriptify"

	"github.com/hypersequent/zen"

	"github.com/anc95/golang-enum-to-ts/src/ast"
	"github.com/anc95/golang-enum-to-ts/src/generator"
	"github.com/anc95/golang-enum-to-ts/src/token"
)

var (
	workingdir string
	entities   = []interface{}{
		model.User{},
		model.UserFillable{},
		model.Product{},
		model.ProductFillable{},
	}
)

func generateToTS() {
	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	workingdir = cwd

	generateTypes()
	println("")
	generateEnums()
	println("")
	generateSchema()
	println("Done.")
	println("")
}

func generateTypes() {
	converter := typescriptify.New()

	for _, entity := range entities {
		converter.Add(entity)
	}

	converter.Prefix = "Model_"
	converter.WithInterface(true)
	converter.BackupDir = ""

	err := converter.ConvertToFile("frontend/generated/models.ts")
	if err != nil {
		panic(err.Error())
	}
}

func generateEnums() {
	enumfolder := workingdir + "/enum/"

	files, err := os.ReadDir(enumfolder)
	if err != nil {
		panic(err)
	}

	finalContent := ""

	for _, file := range files {
		if file.IsDir() {
			continue
		}
		fmt.Println("Converting " + file.Name())

		rawContent, err := os.ReadFile(enumfolder + file.Name())
		if err != nil {
			fmt.Println("failed to convert '" + file.Name() + "'")
		}

		parser := token.NewParser(string(rawContent))
		tokens := parser.Parse()

		astGenerator := ast.NewAstGenerator(tokens)
		tsRaw := generator.GenerateTS(astGenerator.Gen())

		re := regexp.MustCompile("(?s).*namespace enum {\n(.*)}")
		matches := re.FindSubmatch([]byte(tsRaw))
		if len(matches) < 2 {
			continue
		}

		ts := matches[1]
		finalContent += string(ts)
	}

	outFile := workingdir + "/frontend/generated/enums.ts"
	err = os.WriteFile(outFile, []byte(finalContent), 0644)
	if err != nil {
		panic(err)
	}
}

func generateSchema() {
	converter := zen.NewConverter(make(map[string]zen.CustomFn))
	for _, entity := range entities {
		converter.AddType(entity)
	}

	dump := "import { z } from 'zod'\n\n"
	dump += converter.Export()

	outFile := workingdir + "/frontend/generated/schema.ts"
	err := os.WriteFile(outFile, []byte(dump), 0644)
	if err != nil {
		panic(err)
	}
}
