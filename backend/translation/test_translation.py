from translation import translate_with_emotion, get_supported_languages

print("=" * 60)
print("TESTING TRANSLATION MODULE")
print("=" * 60)

test_cases = [
    {
        "name": "SAD emotion → Hindi",
        "ssml": '<speak><prosody rate="slow" pitch="low">I feel really hopeless right now.</prosody></speak>',
        "lang": "hi"
    },
    {
        "name": "HAPPY emotion → Tamil",
        "ssml": '<speak><prosody rate="fast" pitch="high">I am so excited about this!</prosody></speak>',
        "lang": "ta"
    },
    {
        "name": "ANGRY emotion → Bengali",
        "ssml": '<speak><prosody rate="fast" volume="loud">This is absolutely unacceptable!</prosody></speak>',
        "lang": "bn"
    },
    {
        "name": "CALM emotion → French",
        "ssml": '<speak><prosody rate="medium" pitch="medium">Everything will be okay soon.</prosody></speak>',
        "lang": "fr"
    },
    {
        "name": "FEAR emotion → Telugu",
        "ssml": '<speak><prosody rate="fast" pitch="high" volume="soft">I do not know what is going to happen.</prosody></speak>',
        "lang": "te"
    }
]

for i, test in enumerate(test_cases, 1):
    print(f"\nTest {i}: {test['name']}")
    print(f"  INPUT : {test['ssml']}")
    result = translate_with_emotion(test['ssml'], test['lang'])
    print(f"  OUTPUT: {result}")

print("\n" + "=" * 60)
print("TESTING ERROR HANDLING")
print("=" * 60)

print("\nTest: Unsupported language code")
try:
    translate_with_emotion('<speak><prosody>Hello</prosody></speak>', 'xyz')
except ValueError as e:
    print(f"  Caught error correctly: {e}")

print("\nTest: Empty text")
try:
    translate_with_emotion('', 'hi')
except ValueError as e:
    print(f"  Caught error correctly: {e}")

print("\n" + "=" * 60)
print("ALL TESTS DONE")
print("=" * 60)