package enum

type UserLevel int

const (
  Admin UserLevel = iota
  Owner
  Manager
  Worker
)


