"""
document_processor.py — Vaktar AI Document Processor
Extracts text from PDF, DOCX, Email and summarizes using Groq LLaMA.

Supported formats:
- PDF (.pdf) — both text and scanned/image PDFs (OCR)
- Word Document (.docx)
- Email (plain text paste)
- Plain text (.txt)

Handles any document size — 1 page to 500+ pages automatically.
Extracts exactly 6 key points for avatar presentation (60-90 sec video).
"""

import os
import re
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ════════════════════════════════════════════
#  TEXT EXTRACTION
# ════════════════════════════════════════════

def extract_from_pdf(file_path: str) -> str:
    """Extract text from PDF — handles both text PDFs and scanned image PDFs via OCR."""
    try:
        import fitz
        doc = fitz.open(file_path)
        text = ""
        page_count = doc.page_count

        for page in doc:
            page_text = page.get_text()

            if page_text.strip():
                text += page_text
            else:
                print(f"[DOC] Page {page.number+1} is scanned — using OCR...")
                try:
                    import pytesseract
                    from PIL import Image
                    import io

                    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

                    pix = page.get_pixmap(dpi=200)
                    img_bytes = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_bytes))

                    page_text = pytesseract.image_to_string(img, lang='eng')
                    text += page_text + "\n"
                    print(f"[DOC] Page {page.number+1} OCR done — {len(page_text)} chars")

                except ImportError:
                    print("[DOC] pytesseract not installed. Run: pip install pytesseract pillow")
                except Exception as ocr_err:
                    print(f"[DOC] OCR failed for page {page.number+1}: {ocr_err}")

        doc.close()
        print(f"[DOC] Extracted {len(text)} chars from PDF ({page_count} pages)")

        if not text.strip():
            raise ValueError("PDF appears to be fully scanned. Make sure Tesseract is installed at C:\\Program Files\\Tesseract-OCR\\tesseract.exe")

        return text.strip()

    except ImportError:
        raise ImportError("pymupdf not installed. Run: pip install pymupdf")
    except Exception as e:
        raise ValueError(f"PDF extraction failed: {e}")


def extract_from_docx(file_path: str) -> str:
    """Extract text from Word document."""
    try:
        from docx import Document
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        print(f"[DOC] Extracted {len(text)} chars from DOCX")
        return text.strip()
    except ImportError:
        raise ImportError("python-docx not installed. Run: pip install python-docx")
    except Exception as e:
        raise ValueError(f"DOCX extraction failed: {e}")


def extract_from_email(email_text: str) -> str:
    """Clean and extract text from pasted email."""
    lines = email_text.split('\n')
    body_lines = []
    skip_headers = True
    for line in lines:
        if skip_headers and re.match(r'^(From|To|Cc|Bcc|Subject|Date|Sent|Reply-To):', line):
            continue
        else:
            skip_headers = False
            body_lines.append(line)
    text = '\n'.join(body_lines).strip()
    print(f"[DOC] Extracted {len(text)} chars from email")
    return text


def extract_text(file_path=None, email_text=None, file_type=None) -> str:
    """Universal text extractor."""
    if email_text:
        return extract_from_email(email_text)
    if not file_path:
        raise ValueError("Either file_path or email_text must be provided")
    if not file_type:
        ext = os.path.splitext(file_path)[1].lower()
        file_type = ext.lstrip('.')
    if file_type == 'pdf':
        return extract_from_pdf(file_path)
    elif file_type in ['docx', 'doc']:
        return extract_from_docx(file_path)
    elif file_type == 'txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip()
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


# ════════════════════════════════════════════
#  CHUNKING
# ════════════════════════════════════════════

def chunk_text(text: str, chunk_size: int = 6000) -> list:
    """
    Split text into chunks.
    Handles PDF text (single newlines) and normal text (double newlines).
    Falls back to hard split if no paragraph breaks found.
    """
    if '\n\n' in text:
        paragraphs = text.split('\n\n')
    else:
        paragraphs = text.split('\n')

    chunks = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) < chunk_size:
            current_chunk += para + "\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para + "\n"

    if current_chunk:
        chunks.append(current_chunk.strip())

    # Force split if still getting huge chunks
    final_chunks = []
    for chunk in chunks:
        if len(chunk) > chunk_size:
            for i in range(0, len(chunk), chunk_size):
                final_chunks.append(chunk[i:i+chunk_size])
        else:
            final_chunks.append(chunk)

    final_chunks = [c for c in final_chunks if c.strip()]
    print(f"[DOC] Created {len(final_chunks)} chunks")
    return final_chunks


def select_representative_chunks(chunks: list) -> list:
    """
    Dynamically select representative chunks from any size document.
    Always covers beginning, middle, and end.
    """
    total = len(chunks)

    if total <= 5:
        print(f"[DOC] Small document — processing all {total} chunks")
        return chunks

    elif total <= 20:
        mid = total // 2
        selected = chunks[:3] + chunks[mid-1:mid+1] + chunks[-2:]
        print(f"[DOC] Medium document — selected {len(selected)} of {total} chunks")
        return selected

    else:
        step = total // 5
        middle_indices = [step, step*2, step*3]
        middle_chunks = [chunks[i] for i in middle_indices if i < total]
        selected = chunks[:3] + middle_chunks + chunks[-2:]
        print(f"[DOC] Large document — selected {len(selected)} of {total} chunks")
        return selected


# ════════════════════════════════════════════
#  SUMMARIZATION — 6 Key Points
# ════════════════════════════════════════════

SUMMARY_SYSTEM_PROMPT = """You are an expert document summarizer for an AI avatar platform.
Your job is to extract exactly 6 key points from government circulars, policies and documents.
Each point will be spoken by an avatar in 10-15 seconds.

Rules:
- Extract exactly 6 most important points
- Each point must be 1-2 sentences maximum
- Use simple language a common citizen can understand
- Points should flow naturally when spoken one after another
- Total spoken time should be 60-90 seconds
- spoken_text must combine all 6 points naturally as one flowing speech

Return ONLY valid JSON with no markdown, no extra text:
{
    "key_points": [
        "Point 1 text here",
        "Point 2 text here",
        "Point 3 text here",
        "Point 4 text here",
        "Point 5 text here",
        "Point 6 text here"
    ],
    "bullet_summary": "• Point 1\\n• Point 2\\n• Point 3\\n• Point 4\\n• Point 5\\n• Point 6",
    "paragraph_summary": "A flowing paragraph combining all 6 points...",
    "spoken_text": "Full text avatar speaks — all 6 points combined naturally as one speech",
    "key_topic": "Main topic in 3-5 words",
    "suggested_tone": "formal/inspiring/calm/urgent/empathetic"
}"""


def summarize_document(text: str, summary_type: str = "both", max_words: int = 150) -> dict:
    """Summarize extracted text using Groq LLaMA. Handles any document size dynamically."""
    total_chars = len(text)
    print(f"[DOC] Total document size: {total_chars} chars ({len(text.split())} words)")

    if total_chars <= 8000:
        print("[DOC] Short document — direct summarization")
        final_text = text
    else:
        chunks = chunk_text(text, chunk_size=6000)
        selected_chunks = select_representative_chunks(chunks)

        print(f"[DOC] Summarizing {len(selected_chunks)} representative chunks...")

        chunk_summaries = []
        for i, chunk in enumerate(selected_chunks):
            print(f"[DOC] Processing chunk {i+1}/{len(selected_chunks)}...")
            try:
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": "Extract the key points from this section in 3-5 sentences. Be concise and factual."
                        },
                        {
                            "role": "user",
                            "content": chunk[:5000]
                        }
                    ],
                    max_tokens=300,
                    temperature=0.3,
                )
                summary = response.choices[0].message.content.strip()
                chunk_summaries.append(summary)
            except Exception as e:
                print(f"[DOC] Chunk {i+1} failed: {e}")
                continue

        if not chunk_summaries:
            raise ValueError("All chunks failed to summarize")

        final_text = "\n\n".join(chunk_summaries)
        print(f"[DOC] All chunks done — running final summarization...")

    # Final summarization into 6 key points
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Extract exactly 6 key points from this document for an avatar to speak:\n\n{final_text[:8000]}"
                }
            ],
            max_tokens=1000,
            temperature=0.3,
        )

        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'```json|```', '', raw).strip()
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start != -1 and end > start:
            raw = raw[start:end]

        result = json.loads(raw)
        result.setdefault('key_points', [])
        result.setdefault('bullet_summary', '')
        result.setdefault('paragraph_summary', '')
        result.setdefault('spoken_text', '')
        result.setdefault('key_topic', 'Document Summary')
        result.setdefault('suggested_tone', 'formal')

        print(f"[DOC] ✅ Summary complete | Topic: {result['key_topic']} | Tone: {result['suggested_tone']}")
        print(f"[DOC] ✅ Extracted {len(result['key_points'])} key points")
        return result

    except Exception as e:
        print(f"[DOC] Final summarization failed: {e}")
        words = final_text.split()[:150]
        spoken = ' '.join(words)
        return {
            "key_points": [spoken],
            "bullet_summary": f"• {spoken}",
            "paragraph_summary": spoken,
            "spoken_text": spoken,
            "key_topic": "Document Summary",
            "suggested_tone": "formal"
        }


# ════════════════════════════════════════════
#  MAIN PROCESSOR
# ════════════════════════════════════════════

def process_document(
    file_path=None,
    email_text=None,
    file_type=None,
    summary_type: str = "both"
) -> dict:
    """Full document processing pipeline. Extract → Chunk → 6 Key Points → Avatar ready."""
    print(f"[DOC] Starting document processing...")

    raw_text = extract_text(
        file_path=file_path,
        email_text=email_text,
        file_type=file_type
    )

    if not raw_text:
        raise ValueError("No text extracted from document")

    word_count = len(raw_text.split())
    print(f"[DOC] Extracted {word_count} words total")

    summary = summarize_document(raw_text, summary_type=summary_type)

    return {
        "raw_text": raw_text,
        "key_points": summary.get("key_points", []),
        "bullet_summary": summary["bullet_summary"],
        "paragraph_summary": summary["paragraph_summary"],
        "spoken_text": summary["spoken_text"],
        "key_topic": summary["key_topic"],
        "suggested_tone": summary["suggested_tone"],
        "word_count": word_count,
        "char_count": len(raw_text)
    }


# ════════════════════════════════════════════
#  RUN — File picker UI
# ════════════════════════════════════════════

if __name__ == "__main__":
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()

    print("Opening file picker...")
    file_path = filedialog.askopenfilename(
        title="Select a document",
        filetypes=[
            ("All supported", "*.pdf *.docx *.txt"),
            ("PDF files", "*.pdf"),
            ("Word documents", "*.docx"),
            ("Text files", "*.txt"),
        ]
    )

    if not file_path:
        print("No file selected!")
    else:
        print(f"Processing: {file_path}")
        result = process_document(file_path=file_path)

        print(f"\n{'='*50}")
        print(f"✅ Key Topic:      {result['key_topic']}")
        print(f"✅ Suggested Tone: {result['suggested_tone']}")
        print(f"✅ Word Count:     {result['word_count']}")
        print(f"{'='*50}")

        print(f"\n🎯 6 Key Points for Avatar:")
        for i, point in enumerate(result.get('key_points', []), 1):
            print(f"  {i}. {point}")

        print(f"\n📝 Bullet Summary:\n{result['bullet_summary']}")
        print(f"\n📄 Paragraph Summary:\n{result['paragraph_summary']}")
        print(f"\n🎙️  Avatar Speaks:\n{result['spoken_text']}")
        print(f"\n{'='*50}")