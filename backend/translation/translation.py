import requests
import re

# SUPPORTED LANGUAGES
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
}


# STEP 1: Extract SSML tags and plain text
def extract_tags_and_text(ssml_text):
    opening_tags = re.findall(r'<[^/][^>]*>', ssml_text)
    closing_tags = re.findall(r'</[^>]+>', ssml_text)
    plain_text = re.sub(r'<[^>]+>', '', ssml_text).strip()
    return opening_tags, closing_tags, plain_text


# STEP 2: Translate plain text via MyMemory API (free, no key needed)
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


# STEP 3: Rebuild SSML with translated text
def rebuild_ssml(opening_tags, closing_tags, translated_text):
    opening = ''.join(opening_tags)
    closing = ''.join(reversed(closing_tags))
    return opening + translated_text + closing


# MAIN FUNCTION — called by main.py
def translate_with_emotion(ssml_text: str, target_language: str) -> str:
    """
    Translates SSML-tagged English text to the target language
    while preserving all emotion and pacing tags.

    Input:  SSML text + language code (e.g. 'hi', 'ta')
    Output: Translated SSML with original tags preserved
    """
    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Language code '{target_language}' is not supported.\n"
            f"Supported: {list(SUPPORTED_LANGUAGES.keys())}"
        )

    if not ssml_text or not ssml_text.strip():
        raise ValueError("Input text is empty.")

    try:
        opening_tags, closing_tags, plain_text = extract_tags_and_text(ssml_text)
        translated_text = translate_text(plain_text, target_language)
        final_ssml = rebuild_ssml(opening_tags, closing_tags, translated_text)
        return final_ssml
    except Exception as e:
        print(f"[Translation Error] {e}")
        print("[Fallback] Returning original English SSML.")
        return ssml_text


def get_supported_languages():
    return SUPPORTED_LANGUAGES