#It handles the text-to-text translation using Google Translate.
from deep_translator import GoogleTranslator

class TranslatorService:
    def __init__(self):
        # We don't need to load a heavy model here since it uses an API
        pass

    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translates text from source to target language.
        Args:
            text: The sentence to translate.
            source_lang: e.g., 'kn' (Kannada), 'ta' (Tamil), 'hi' (Hindi)
            target_lang: e.g., 'en' (English)
        """
        try:
            if not text:
                return ""
            
            # If source and target are same, skip translation
            if source_lang == target_lang:
                return text

            translator = GoogleTranslator(source=source_lang, target=target_lang)
            return translator.translate(text)
        
        except Exception as e:
            print(f"Translation Error: {e}")
            return text  # Fallback: return original text if translation fails

# Global instance
translator_service = TranslatorService()