package utils

func IsStringEmpty(s string) bool {
	return s == ""
}

func IsNil[T any](v *T) bool {
	return v == nil
}

func IsStringNilOrEmpty(s *string) bool {
	return IsNil(s) || IsStringEmpty(*s)
}
