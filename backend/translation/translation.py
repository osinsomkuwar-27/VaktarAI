import requests
import re

# SUPPORTED LANGUAGES
# Add or remove languages here as needed
SUPPORTED_LANGUAGES = {
    'hi': 'Hindi',
    'mr': 'Marathi',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'ur': 'Urdu',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'it': 'Italian',
    'zh': 'Chinese'
}

# STEP 1: EXTRACT SSML TAGS
# Saves the opening and closing tags separately
# Example: <speak><prosody rate="slow"> → saved, text extracted

def extract_tags_and_text(ssml_text):
    opening_tags = re.findall(r'<[^/][^>]*>', ssml_text)
    closing_tags = re.findall(r'</[^>]+>', ssml_text)
    plain_text = re.sub(r'<[^>]+>', '', ssml_text).strip()
    return opening_tags, closing_tags, plain_text

# STEP 2: TRANSLATE PLAIN TEXT
# Sends plain text to MyMemory API and gets back translated text

def translate_text(plain_text, target_language):
    url = "https://api.mymemory.translated.net/get"
    params = {
        "q": plain_text,
        "langpair": f"en|{target_language}"
    }
    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise Exception(f"Translation API error: {response.status_code}")

    data = response.json()

    if data["responseStatus"] != 200:
        raise Exception(f"Translation failed: {data['responseDetails']}")

    return data["responseData"]["translatedText"]

# ============================================================
# STEP 3: REBUILD SSML WITH TRANSLATED TEXT
# Puts the saved tags back around the translated text
# ============================================================
def rebuild_ssml(opening_tags, closing_tags, translated_text):
    opening = ''.join(opening_tags)
    closing = ''.join(reversed(closing_tags))
    return opening + translated_text + closing

# ============================================================
# MAIN FUNCTION — This is what Shreeja will call in the pipeline
# Input:  SSML text in English + target language code
# Output: SSML text in target language (tags preserved)
# ============================================================
def translate_with_emotion(ssml_text: str, target_language: str) -> str:
    """
    Translates SSML-tagged English text to the target language
    while preserving all emotion and pacing tags.

    Parameters:
        ssml_text (str): English text wrapped in SSML tags
                         Example: <speak><prosody rate="slow">I am sad.</prosody></speak>
        target_language (str): Language code
                         Example: 'hi' for Hindi, 'ta' for Tamil

    Returns:
        str: Translated text with original SSML tags preserved
             Example: <speak><prosody rate="slow">मैं दुखी हूँ।</prosody></speak>
    """

    # --- Check 1: Is the language supported? ---
    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Language code '{target_language}' is not supported.\n"
            f"Supported languages: {SUPPORTED_LANGUAGES}"
        )

    # --- Check 2: Is the text empty? ---
    if not ssml_text or not ssml_text.strip():
        raise ValueError("Input text is empty. Please provide SSML text.")

    try:
        # Step 1: Pull out tags and plain text
        opening_tags, closing_tags, plain_text = extract_tags_and_text(ssml_text)

        # Step 2: Translate the plain text
        translated_text = translate_text(plain_text, target_language)

        # Step 3: Put tags back and return
        final_ssml = rebuild_ssml(opening_tags, closing_tags, translated_text)

        return final_ssml

    except Exception as e:
        print(f"[Translation Error] {e}")
        print("[Fallback] Returning original English SSML.")
        return ssml_text  # Return original if anything goes wrong

# ============================================================
# HELPER: See all supported languages
# ============================================================
def get_supported_languages():
    return SUPPORTED_LANGUAGES