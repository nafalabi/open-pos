package main

import (
	"fmt"
	"open-pos/model"
	"os"
	"regexp"

	"github.com/tkrajina/typescriptify-golang-structs/typescriptify"

	"github.com/anc95/golang-enum-to-ts/src/ast"
	"github.com/anc95/golang-enum-to-ts/src/generator"
	"github.com/anc95/golang-enum-to-ts/src/token"
)

func generateToTS() {
	typesToTS()
  println("")
	enumToTS()
  println("Done.")
  println("")
}

func typesToTS() {
	converter := typescriptify.New().
		Add(model.User{}).
		Add(model.UserBase{}).
		Add(model.UserFillable{}).
		Add(model.Product{}).
		Add(model.ProductFillable{})

	converter.Prefix = "Gen_"
	converter.WithInterface(true)
  converter.BackupDir = ""

	err := converter.ConvertToFile("frontend/generated/types.ts")
	if err != nil {
		panic(err.Error())
	}
}

func enumToTS() {
	workingdir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

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
