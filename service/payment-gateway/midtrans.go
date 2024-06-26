package service

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"open-pos/model"
	"os"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type MidtransParams struct {
	PaymentType string
	QrisAcuirer string
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

func (m *Midtrans) ChargeTransaction(order model.Order, out *map[string]any) error {
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

func (m *Midtrans) CancelTransaction(o model.Order, out *map[string]any) error {
	return nil
}

func (m *Midtrans) StatusTransaction(o model.Order, out *map[string]any) error {
	return nil
}

func (m *Midtrans) SettleTransaction(param any, out *map[string]any) error {
	return nil
}
