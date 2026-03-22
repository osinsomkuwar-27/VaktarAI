const PIPELINE_URL = 'http://localhost:8000'
const VOICE_URL = 'http://localhost:8003'

/**
 * generateAvatar
 * Called by CreatePage handleGenerate()
 */
export async function generateAvatar(
  imageFile,
  text,
  onUploadProgress = () => {},
  targetLanguage = 'hi',
  speaker = 'shreeja'
) {
  const formData = new FormData()
  formData.append('photo', imageFile)
  formData.append('text', text)
  formData.append('target_language', targetLanguage)
  formData.append('speaker', speaker)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onUploadProgress(e.loaded / e.total)
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try { resolve(JSON.parse(xhr.responseText)) }
        catch { reject(new Error('Invalid response from server')) }
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err.detail || 'Generation failed'))
        } catch { reject(new Error(`Server error: ${xhr.status}`)) }
      }
    })

    xhr.addEventListener('error',   () => reject(new Error('Network error — is the backend running?')))
    xhr.addEventListener('timeout', () => reject(new Error('Request timed out — video generation takes 3-5 mins')))

    xhr.timeout = 600000
    xhr.open('POST', `${PIPELINE_URL}/generate-video`)
    xhr.send(formData)
  })
}

/**
 * askAvatar
 * Called by ChatPage — sends question to /ask-and-generate
 * Returns { answer, video_url, llm_source, session_id }
 *
 * @param {File}   photoFile      - avatar portrait photo
 * @param {string} question       - user's question text
 * @param {string} targetLanguage - language code e.g. 'en', 'hi'
 * @param {string} speaker        - voice speaker name
 */
export async function askAvatar(
  photoFile,
  question,
  targetLanguage = 'en',
  speaker = 'shreeja'
) {
  const formData = new FormData()
  formData.append('photo', photoFile)
  formData.append('question', question)
  formData.append('target_language', targetLanguage)
  formData.append('speaker', speaker)

  const res = await fetch(`${PIPELINE_URL}/ask-and-generate`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }

  return res.json()
}

/**
 * synthesizeVoice
 */
export async function synthesizeVoice(text, speaker = 'shreeja') {
  const res = await fetch(`${VOICE_URL}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssml: text, speaker })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Voice synthesis failed: ${res.status}`)
  }

  return res.blob()
}

/**
 * getAvailableSpeakers
 */
export async function getAvailableSpeakers() {
  const res = await fetch(`${VOICE_URL}/speakers`)
  if (!res.ok) throw new Error('Could not fetch speakers list')
  const data = await res.json()
  return data.speakers
}

export async function checkHealth() {
  try {
    const res = await fetch(`${PIPELINE_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}