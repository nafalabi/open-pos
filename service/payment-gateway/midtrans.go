package payment_gateway

import (
	"bytes"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"open-pos/enum"
	"open-pos/model"
	"os"
	"strconv"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type MidtransParams struct {
	PaymentType string
	QrisAcuirer string
}

type SignatureVerificationParam struct {
	OrderID     string
	StatusCode  string
	GrossAmount string
}

type Midtrans struct {
	tx         *gorm.DB
	params     MidtransParams
	endpoint   string
	serverkey  string
	auth_value string
}

func NewMidtrans(param MidtransParams, tx *gorm.DB) Midtrans {
	m := Midtrans{}
	m.SetParam(param)
	m.LoadConfig()
	m.tx = tx
	return m
}

func (m *Midtrans) SetParam(param MidtransParams) {
	m.params = param
}

func (m *Midtrans) LoadConfig() {
	m.endpoint = os.Getenv("MIDTRANS_ENDPOINT")
	m.serverkey = os.Getenv("MIDTRANS_SERVERKEY")
	m.auth_value = "Basic " + base64.StdEncoding.EncodeToString([]byte(m.serverkey+":"))
}

func (m *Midtrans) makeRequest(method string, path string, body io.Reader) (result []byte, error error) {
	req, error := http.NewRequest(method, m.endpoint+path, body)
	if error != nil {
		return result, error
	}

	req.Header.Add("accept", "application/json")
	req.Header.Add("content-type", "application/json")
	req.Header.Add("authorization", m.auth_value)

	res, error := http.DefaultClient.Do(req)
	if error != nil {
		return result, error
	}
	defer res.Body.Close()

	result, error = io.ReadAll(res.Body)
	if error != nil {
		return result, error
	}

	return result, nil
}

func (m *Midtrans) VerifySignature(signature string, param SignatureVerificationParam,
) bool {
	hash := sha512.Sum512([]byte(param.OrderID + param.StatusCode + param.GrossAmount + m.serverkey))
	hash_string := hex.EncodeToString(hash[:])

	return signature == hash_string
}

func (m *Midtrans) ChargeTransaction(order *model.Order, out *map[string]any) error {
	grossAmount := order.SubTotal + order.PaymentFee
	orderTime := time.Now()

	payloadSchema := map[string]any{
		"payment_type": m.params.PaymentType,
		"transaction_details": map[string]any{
			"order_id":     order.ID,
			"gross_amount": grossAmount,
		},
		"custom_expiry": map[string]any{
			"order_time":      orderTime.Format("2006-01-02 15:04:05 -0700"),
			"expiry_duration": 30,
			"unit":            "minute",
		},
	}

	if m.params.PaymentType == "qris" {
		payloadSchema["qris"] = map[string]any{
			"acquirer": m.params.QrisAcuirer,
		}
	}

	payloadByte, _ := json.Marshal(payloadSchema)
	payload := bytes.NewReader(payloadByte)

	resultRaw, err := m.makeRequest("POST", "/charge", payload)
	if err != nil {
		return err
	}

	var result struct {
		TransactionID     string `json:"transaction_id"`
		StatusCode        string `json:"status_code"`
		TransactionStatus string `json:"transaction_status"`
		ExpiryTime        string `json:"expiry_time"`
		GrossAmount       string `json:"gross_amount"`
		Actions           []struct {
			Name   string `json:"name"`
			Method string `json:"method"`
			Url    string `json:"url"`
		}
		QRString string `json:"qr_string"`
	}
	err = json.Unmarshal(resultRaw, &result)
	if err != nil {
		return err
	}

	err = m.tx.Transaction(func(tx *gorm.DB) error {
		expirationTime := orderTime.Add(time.Minute * 30)
		midtransDetail := model.MidtransDetail{
			RefID:             result.TransactionID,
			StatusCode:        result.StatusCode,
			TransactionStatus: result.TransactionStatus,
			QRString:          result.QRString,
		}
		for _, action := range result.Actions {
			if action.Name == "generate-qr-code" {
				midtransDetail.QRLink = action.Url
				break
			}
		}
		midtransDetailJSON := datatypes.NewJSONType(midtransDetail)
		paymentInfo := model.PaymentInfo{
			OrderID:        order.ID,
			PaymentGateway: "midtrans",
			PaymentType:    m.params.PaymentType,
			ExpireAt:       expirationTime,
			MidtransDetail: &midtransDetailJSON,
		}
		paymentInfo.GrossAmount, _ = strconv.ParseFloat(result.GrossAmount, 64)
		err := tx.Create(&paymentInfo).Error
		if err != nil {
			return err
		}

		midtransEvent := model.MidtransEvent{
			OrderID:   order.ID,
			RefID:     result.TransactionID,
			EventType: "charge",
			RawData:   string(resultRaw),
		}
		err = tx.Create(&midtransEvent).Error
		if err != nil {
			return err
		}

		if out != nil {
			*out = map[string]any{
				"info":  paymentInfo,
				"event": midtransEvent,
			}
		}

		return nil
	})

	if err != nil {
		return err
	}

	return nil
}

func (m *Midtrans) CancelTransaction(o *model.Order, out *map[string]any) error {
	return nil
}

func (m *Midtrans) StatusTransaction(o *model.Order, out *map[string]any) error {
	resultRaw, err := m.makeRequest("GET", "/"+o.ID+"/status", nil)
	if err != nil {
		return errors.New("Failed to make http request")
	}

	var result struct {
		StatusCode               string `json:"status_code"`
		StatusMessage            string `json:"status_message"`
		TransactionID            string `json:"transaction_id"`
		OrderID                  string `json:"order_id"`
		PaymentType              string `json:"payment_type"`
		TransactionTime          string `json:"transaction_time"`
		TransactionStatus        string `json:"transaction_status"`
		FraudStatus              string `json:"fraud_status"`
		ApprovalCode             string `json:"approval_code"`
		SignatureKey             string `json:"signature_key"`
		Bank                     string `json:"bank"`
		GrossAmount              string `json:"gross_amount"`
		ChannelResponseCode      string `json:"channel_response_code"`
		ChannelResponseMessage   string `json:"channel_response_message"`
		CardType                 string `json:"card_type"`
		PaymentOptionType        string `json:"payment_option_type"`
		ShopeepayReferenceNumber string `json:"shopeepay_reference_number"`
		ReferenceID              string `json:"reference_id"`
	}

	err = json.Unmarshal(resultRaw, &result)
	if err != nil {
		return errors.New("Failed to unmarshal response")
	}

	ok := m.VerifySignature(result.SignatureKey, SignatureVerificationParam{
		OrderID:     o.ID,
		StatusCode:  result.StatusCode,
		GrossAmount: result.GrossAmount,
	})
	if !ok {
		return errors.New("The signature is invalid")
	}

	var orderStatus enum.OrderStatus

	switch result.TransactionStatus {
	case "settlement":
		orderStatus = enum.StatusPaid
	case "pending":
		orderStatus = enum.StatusPending
	case "cancel":
		orderStatus = enum.StatusCanceled
	case "expire":
		orderStatus = enum.StatusExpired
	}

	if orderStatus == o.Status {
		return nil
	}

	err = m.tx.Transaction(func(tx *gorm.DB) error {
		switch orderStatus {
		case enum.StatusPaid:
			transRecord := model.Transaction{
				Type:         enum.TransactionPay,
				Gateway:      "midtrans",
				PaymentType:  m.params.PaymentType,
				PaymentFee:   o.PaymentFee,
				InputAmount:  o.Total,
				ExpectAmount: o.Total,
				OrderID:      o.ID,
			}
			err := tx.Save(&transRecord).Error
			if err != nil {
				return errors.New("Unable to create transaction record")
			}
		case enum.StatusCanceled:
		case enum.StatusExpired:
		}

		o.Status = orderStatus
		err := tx.Save(&o).Error
		if err != nil {
			return errors.New("Failed to update order")
		}

		paymentInfo := model.PaymentInfo{}
		err = tx.Where("order_id = ?", o.ID).First(&paymentInfo).Error
		if err != nil {
			return errors.New("Unable to find payment info")
		}

		midtransDetail := paymentInfo.MidtransDetail.Data()
		midtransDetail.TransactionStatus = result.TransactionStatus
		midtransDetail.StatusCode = result.StatusCode
		updatedMidtransDetail := datatypes.NewJSONType(midtransDetail)
		paymentInfo.MidtransDetail = &updatedMidtransDetail

		err = tx.Save(&paymentInfo).Error
		if err != nil {
			return errors.New("Failed to update payment info")
		}

		return nil
	})
	if err != nil {
		return err
	}

	return nil
}

func (m *Midtrans) SettleTransaction(param any, out *map[string]any) error {
	return nil
}
