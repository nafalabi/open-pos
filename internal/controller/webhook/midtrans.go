package controller_webhook

import (
	"net/http"
	"open-pos/internal/model"
	live_notifier "open-pos/internal/service/live-notifier"
	"open-pos/internal/service/payment-gateway"
	"open-pos/internal/utils"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type MidtransNotificationParams struct {
	Acquirer          string `json:"acquirer"`
	Currency          string `json:"currency"`
	ExpiryTime        string `json:"expiry_time"`
	FraudStatus       string `json:"fraud_status"`
	GrossAmount       string `json:"gross_amount"`
	MerchantID        string `json:"merchant_id"`
	OrderID           string `json:"order_id"`
	PaymentType       string `json:"payment_type"`
	ReferenceID       string `json:"reference_id"`
	SignatureKey      string `json:"signature_key"`
	StatusCode        string `json:"status_code"`
	StatusMessage     string `json:"status_message"`
	TransactionID     string `json:"transaction_id"`
	TransactionStatus string `json:"transaction_status"`
	TransactionTime   string `json:"transaction_time"`
	TransactionType   string `json:"transaction_type"`
}

func HandleMidtransNotification(dbClient *gorm.DB, ln *live_notifier.LiveNotifierHub) echo.HandlerFunc {
	return func(c echo.Context) error {
		var reqBody MidtransNotificationParams
		err := c.Bind(&reqBody)
		if err != nil {
			return utils.ApiError{
				Code:    http.StatusBadRequest,
				Message: "Invalid payload",
			}
		}

		param := payment_gateway.MidtransParams{
			PaymentType: reqBody.PaymentType,
			QrisAcuirer: reqBody.Acquirer,
		}
		midtrans := payment_gateway.NewMidtrans(param, dbClient)

		isAuthentic := midtrans.VerifySignature(reqBody.SignatureKey, payment_gateway.SignatureVerificationParam{
			OrderID:     reqBody.OrderID,
			StatusCode:  reqBody.StatusCode,
			GrossAmount: reqBody.GrossAmount,
		})
		if !isAuthentic {
			return utils.ApiError{
				Code:    http.StatusForbidden,
				Message: "the signature is not authentic",
			}
		}

		err = dbClient.Transaction(func(tx *gorm.DB) error {
			order := model.Order{}
			err := tx.Where("id = ?", reqBody.OrderID).First(&order).Error
			if err != nil {
				return utils.ApiError{
					Code:    http.StatusNotFound,
					Message: "Order id can't be found",
				}
			}

			err = midtrans.StatusTransaction(&order, nil)
			if err != nil {
				return utils.ApiError{
					Code:    http.StatusUnprocessableEntity,
					Message: "Failed to update order",
				}
			}

			return nil
		})

		if err != nil {
			return err
		}

		message := live_notifier.LiveMessage{
			Entity:   "order",
			EntityID: &reqBody.OrderID,
			Action:   live_notifier.ActionUpdated,
		}
		ln.Notify(message)

		return c.JSON(200, map[string]any{
			"message": "success",
		})
	}
}
