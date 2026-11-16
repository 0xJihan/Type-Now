# Dataset Provenance: English Frequency Datasets

## Source
- **Corpus**: Google Books Ngram 1-gram dataset
- **Compiler**: Peter Norvig (Director of Research, Google)
- **Source URL**: https://norvig.com/ngrams/count_1w.txt
- **License**: Creative Commons Attribution 3.0 Unported (CC-BY 3.0) / Public Domain Google Ngram data

## Curation & Sanitization
1. **Case Normalization**: Converted all tokens to lowercase ASCII.
2. **Alphabetical Filtering**: Strict regex `^[a-z]+$` matching only alphabetic characters.
3. **Single-Character Filter**: Excluded stray single letters, preserving only legitimate single-letter English words ('a', 'i').
4. **Safety & Profanity Filtering**: Removed explicit profanities and offensive terms.
5. **Deduplication**: Verified uniqueness of all entries.

## Tiers
- `english-200.json`: 200 most common English words, ideal for standard beginner/speed tests.
- `english-1000.json`: 1000 most common English words, for intermediate vocabulary testing.
