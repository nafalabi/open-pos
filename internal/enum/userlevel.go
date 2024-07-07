package enum

type UserLevel int

const (
	Admin UserLevel = iota
	Owner
	Manager
	Worker
)

func (userLevel UserLevel) CustomValidate() bool {
	switch userLevel {
	case Admin,
		Owner,
		Manager,
		Worker:
		return true
	default:
		return false
	}
}
