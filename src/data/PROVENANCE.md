# Dataset Provenance: TypeNow Content Engine

## 1. English Frequency Datasets (Random Words)
- **Sources**:
  - `english-200.json`: Top 200 most common English words.
  - `english-1000.json`: Top 1000 most common English words.
  - `english-5000.json`: Top 5000 most common English words.
  - Sourced from Google Books Ngram 1-gram dataset compiled by Peter Norvig (https://norvig.com/ngrams/count_1w.txt).
  - License: CC-BY 3.0 / Public Domain.
  - Sanitization: All lowercase ASCII, strictly alphabetic `^[a-z]+$`, profanity-filtered, deduplicated.
- **Advanced Vocabulary**:
  - `english-advanced.json`: 128 curated sophisticated vocabulary words (e.g., *juxtaposition*, *quintessential*, *serendipity*, *idiosyncrasy*).
  - License: CC0 1.0.

## 2. Sentence Mode
- **Dataset**: `sentences.json`
- **Count**: Varied short, medium, and long grammatical sentences.
- **Difficulty Tiers**: Beginner, Intermediate, Advanced.
- **Source**: TypeNow Curated English Corpus & Public Domain literature.
- **License**: CC0 1.0 / Public Domain.

## 3. Quote Mode
- **Dataset**: `quotes.json`
- **Count**: Curated quotations from verified historical and literary works (Marcus Aurelius, Mark Twain, Jane Austen, Mary Shelley, Charles Dickens, Ralph Waldo Emerson).
- **License**: Public Domain (historical literature pre-1928) / Fair Use educational quotation.

## 4. Code Mode
- **Dataset**: `code-snippets.json`
- **Languages**: HTML, CSS, JavaScript, TypeScript, Python, Java, Kotlin, Rust.
- **Formatting**: Syntactically valid, formatted with exact indentation, brackets, semicolons, and operators.
- **License**: MIT / CC0 1.0 original educational code snippets.
