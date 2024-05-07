package controller

import (
	"fmt"
	"open-pos/utils"
	"strings"

	"github.com/disintegration/imaging"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// @Summary	upload image
// @Security	ApiKeyAuth
// @Tags		Images
// @Accept		mpfd
// @Produce	json
// @Param		file	formData	file	true	"Image File"
// @Router		/images [post]
func UploadImage(dbClient *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		commonErrorMsg := utils.ConstructError("Failed to upload file")

		file, err := c.FormFile("file")
		if err != nil {
			return utils.SendError(c, commonErrorMsg)
		}

		imageId := uuid.NewString()
		imageId = strings.Replace(imageId, "-", "", -1)
		// imageExt := filepath.Ext(file.Filename)
		imageExt := ".jpg"
		filename := fmt.Sprintf("%s%s", imageId, imageExt)

		src, err := file.Open()
		if err != nil {
			return utils.SendError(c, commonErrorMsg)
		}
		defer src.Close()

		processedImage, err := imaging.Decode(src)
		if err != nil {
			return utils.SendError(c, commonErrorMsg)
		}

		optimizeDimension := getOptimizeResolution(Dimension{
			width:  float32(processedImage.Bounds().Dx()),
			height: float32(processedImage.Bounds().Dy()),
		})

		processedImage = imaging.Resize(processedImage, int(optimizeDimension.width), int(optimizeDimension.height), imaging.Linear)
		filepath := fmt.Sprintf("./storage/images/%s", filename)

		err = imaging.Save(processedImage, filepath)
		if err != nil {
			return utils.SendError(c, commonErrorMsg)
		}

		imageUri := fmt.Sprintf("/images/%s", filename)

		return utils.SendSuccess(c, imageUri)
	}
}

type Dimension struct {
	width  float32
	height float32
}

const (
	MAX_HEIGHT = 5000
	MAX_WIDTH  = 5000
)

func getOptimizeResolution(oriDim Dimension) Dimension {
	ratio := oriDim.height / oriDim.width

	if oriDim.height > MAX_HEIGHT {
		return Dimension{
			height: MAX_HEIGHT,
			width:  MAX_HEIGHT / ratio,
		}
	}

	if oriDim.width > MAX_WIDTH {
		return Dimension{
			height: MAX_WIDTH * ratio,
			width:  MAX_WIDTH,
		}
	}

	return oriDim
}
