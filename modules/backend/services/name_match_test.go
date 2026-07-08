package services

import "testing"

func TestNamesMatch(t *testing.T) {
	cases := []struct {
		name       string
		registered string
		extracted  string
		want       bool
	}{
		{"exact match", "John Smith", "John Smith", true},
		{"case and spacing differ", "  john   smith ", "JOHN SMITH", true},
		{"title prefix on document", "John Smith", "Mr. John Smith", true},
		{"thai title prefix", "สมชาย ใจดี", "นาย สมชาย ใจดี", true},
		{"reordered tokens", "Smith John", "John Smith", true},
		{"minor typo", "Jonathan Smith", "Jonathon Smith", true},
		{"clearly different names", "John Smith", "Alice Johnson", false},
		{"empty extracted", "John Smith", "", false},
		{"empty registered", "", "John Smith", false},
		{"both empty", "", "", false},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := namesMatch(c.registered, c.extracted)
			if got != c.want {
				t.Errorf("namesMatch(%q, %q) = %v, want %v", c.registered, c.extracted, got, c.want)
			}
		})
	}
}

func TestNameSimilarity(t *testing.T) {
	if got := nameSimilarity("abc", "abc"); got != 1 {
		t.Errorf("identical strings should score 1, got %v", got)
	}
	if got := nameSimilarity("", ""); got != 1 {
		t.Errorf("two empty strings should score 1, got %v", got)
	}
	if got := nameSimilarity("abc", "xyz"); got >= 0.5 {
		t.Errorf("completely different strings should score low, got %v", got)
	}
}
