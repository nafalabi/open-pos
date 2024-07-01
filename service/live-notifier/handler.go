package live_notifier

import (
	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

type LiveNotifierHub struct {
	upgrader websocket.Upgrader

	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func New() *LiveNotifierHub {
	liveNotifier := LiveNotifierHub{
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}

	return &liveNotifier
}

func (ln *LiveNotifierHub) HandleWebsocket(c echo.Context) error {
	conn, err := ln.upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		c.Logger().Error(err)
		return err
	}

	client := &Client{hub: ln, context: c, conn: conn, send: make(chan []byte, 256)}
	ln.register <- client

	go client.WritePump()
	go client.ReadPump()
	return nil
}

func (ln *LiveNotifierHub) RunListener() {
	for {
		select {
		case client := <-ln.register:
			ln.clients[client] = true
		case client := <-ln.unregister:
			if _, ok := ln.clients[client]; ok {
				delete(ln.clients, client)
				close(client.send)
			}
		case message := <-ln.broadcast:
			for client := range ln.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(ln.clients, client)
				}
			}
		}
	}
}

func (ln *LiveNotifierHub) Notify(message Message) {
	ln.broadcast <- message.ToByte()
}
