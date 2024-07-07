package test

import (
	"open-pos/internal/model"
	"open-pos/internal/service/payment-gateway"
	"open-pos/internal/utils"
	"testing"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func beforeStart() *gorm.DB {
	if err := godotenv.Load("../.env"); err != nil {
		panic("Error loading .env file")
	}
	dbClient, err := InitTestDB()
	if err != nil {
		panic("Can't connect to DB")
	}
	return dbClient
}

func Test_Charge_QRIS(t *testing.T) {
	dbClient := beforeStart()
	defer utils.DisconnectDB(dbClient)

	orderid := uuid.NewString()
	order := model.Order{
		BaseModelWithTimestamp: model.BaseModelWithTimestamp{BaseModel: model.BaseModel{ID: orderid}},
		SubTotal:               10000,
		PaymentFee:             70,
	}
	var output map[string]any

	params := payment_gateway.MidtransParams{
		PaymentType: "qris",
		QrisAcuirer: "gopay",
	}
	midtrans := payment_gateway.NewMidtrans(params, dbClient)
	err := midtrans.ChargeTransaction(&order, &output)
	assert.Nil(t, err, "Error happened")

	paymentInfo, ok := output["info"].(model.PaymentInfo)
	assert.Equal(t, ok, true, "Unable to produce payment info")

	event, ok := output["event"].(model.MidtransEvent)
	assert.Equal(t, ok, true, "Unable to produce midtrans event")

	assert.Equal(t, paymentInfo.MidtransDetail.Data().StatusCode, "201")
	assert.Equal(t, paymentInfo.MidtransDetail.Data().TransactionStatus, "pending")
	assert.Equal(t, event.EventType, "charge")
	assert.Equal(t, paymentInfo.GrossAmount, float64(10070))
}
