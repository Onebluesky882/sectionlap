package services

import (
	"slices"
	"strings"
	"unicode"
)

// Tunable thresholds for identity-document name matching — the piece most
// likely to need retuning post-launch based on real submissions, kept
// isolated here rather than scattered through teacher_verification_service.go.
const (
	nameWholeStringSimilarityThreshold = 0.75
	nameTokenSimilarityThreshold       = 0.8
)

var nameTitlePrefixes = []string{
	"mr", "mrs", "ms", "miss", "dr", "prof",
	"นาย", "นาง", "นางสาว", "ดร",
}

// normalizeName lowercases, strips punctuation, collapses whitespace, and
// removes common title prefixes so "Mr. John Smith" and "JOHN  SMITH" compare
// equal.
func normalizeName(s string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(s) {
		if unicode.IsLetter(r) || unicode.IsSpace(r) {
			b.WriteRune(r)
		} else {
			b.WriteRune(' ')
		}
	}
	fields := strings.Fields(b.String())
	filtered := fields[:0]
	for _, f := range fields {
		if !slices.Contains(nameTitlePrefixes, f) {
			filtered = append(filtered, f)
		}
	}
	return strings.Join(filtered, " ")
}

// levenshtein computes the classic edit distance between two strings.
func levenshtein(a, b string) int {
	ar, br := []rune(a), []rune(b)
	m, n := len(ar), len(br)
	if m == 0 {
		return n
	}
	if n == 0 {
		return m
	}

	prev := make([]int, n+1)
	curr := make([]int, n+1)
	for j := 0; j <= n; j++ {
		prev[j] = j
	}

	for i := 1; i <= m; i++ {
		curr[0] = i
		for j := 1; j <= n; j++ {
			cost := 1
			if ar[i-1] == br[j-1] {
				cost = 0
			}
			del := prev[j] + 1
			ins := curr[j-1] + 1
			sub := prev[j-1] + cost
			min := del
			if ins < min {
				min = ins
			}
			if sub < min {
				min = sub
			}
			curr[j] = min
		}
		prev, curr = curr, prev
	}
	return prev[n]
}

// nameSimilarity returns a 0..1 score, 1 meaning identical.
func nameSimilarity(a, b string) float64 {
	if a == "" && b == "" {
		return 1
	}
	maxLen := max(len([]rune(a)), len([]rune(b)))
	if maxLen == 0 {
		return 1
	}
	dist := levenshtein(a, b)
	return 1 - float64(dist)/float64(maxLen)
}

// namesMatch reports whether registered and extracted names plausibly refer
// to the same person. Combines whole-string similarity with a token-set
// comparison so reordered names ("Surname, Given" vs "Given Surname") and
// international name formatting still match.
func namesMatch(registered, extracted string) bool {
	nr := normalizeName(registered)
	ne := normalizeName(extracted)
	if nr == "" || ne == "" {
		return false
	}
	if nameSimilarity(nr, ne) >= nameWholeStringSimilarityThreshold {
		return true
	}

	rTokens := strings.Fields(nr)
	eTokens := strings.Fields(ne)
	if len(rTokens) == 0 || len(eTokens) == 0 {
		return false
	}

	matched := 0
	for _, rt := range rTokens {
		for _, et := range eTokens {
			if nameSimilarity(rt, et) >= nameTokenSimilarityThreshold {
				matched++
				break
			}
		}
	}

	smaller := min(len(eTokens), len(rTokens))
	if smaller == 0 {
		return false
	}
	return float64(matched)/float64(smaller) >= 0.5
}
