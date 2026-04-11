"""
routes/tts.py — Text-to-Speech endpoint using gTTS
GET  /api/tts/voices  — list supported languages
POST /api/tts         — generate MP3 audio from text

Install: pip install gtts
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import io

router = APIRouter(tags=["TTS"])

# gTTS language codes
LANG_MAP = {
    "mr-IN": "mr",   # Marathi
    "hi-IN": "hi",   # Hindi
    "en-IN": "en",   # English
    "en":    "en",
    "hi":    "hi",
    "mr":    "mr",
}


class TTSRequest(BaseModel):
    text: str
    lang: str = "hi-IN"


@router.options("/tts")
async def tts_options():
    """Handle CORS preflight for /api/tts"""
    return {}


@router.post("/tts")
async def text_to_speech(req: TTSRequest):
    """
    Convert text to speech using Google Text-to-Speech (gTTS).
    Returns audio/mpeg stream — play directly in <audio> element.
    Works for Hindi (hi-IN) and Marathi (mr-IN) without any voice installation.
    """
    try:
        from gtts import gTTS
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="gTTS not installed. Run: pip install gtts"
        )

    gtts_lang = LANG_MAP.get(req.lang, "hi")

    # Clean text — remove special chars gTTS stumbles on
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    # Limit length to avoid timeouts
    if len(text) > 500:
        text = text[:500]

    try:
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)

        return StreamingResponse(
            buf,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-cache",
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


@router.get("/tts/voices")
async def list_voices():
    """List all supported TTS languages."""
    return {
        "voices": [
            {"lang": "mr-IN", "name": "Marathi",        "gtts_code": "mr"},
            {"lang": "hi-IN", "name": "Hindi",           "gtts_code": "hi"},
            {"lang": "en-IN", "name": "English (India)", "gtts_code": "en"},
        ]
    }