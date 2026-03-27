const PIPELINE_URL = import.meta.env.VITE_PIPELINE_URL
const VOICE_URL = import.meta.env.VITE_VOICE_URL

type Background =
  | { type: 'color'; value: string }
  | { type: 'image'; file: File }
  | null

/**
 * generateAvatar — sends photo + text + background to /generate-video
 */
export async function generateAvatar(
  imageFile: File,
  text: string,
  onUploadProgress: (pct: number) => void = () => {},
  targetLanguage = 'hi',
  speaker = 'shreeja',
  background: Background = null
) {
  const formData = new FormData()
  formData.append('photo', imageFile)
  formData.append('text', text)
  formData.append('target_language', targetLanguage)
  formData.append('speaker', speaker)

  // ── Send background to backend ──────────────────────────────────────────
  if (background?.type === 'color') {
    formData.append('background_color', background.value)
  } else if (background?.type === 'image') {
    formData.append('background_image', background.file)
  }

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
 * askAvatar — ChatPage
 */
export async function askAvatar(
  photoFile: File,
  question: string,
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
    throw new Error((err as { detail?: string }).detail || `Request failed: ${res.status}`)
  }

  return res.json()
}

export async function synthesizeVoice(text: string, speaker = 'shreeja') {
  const res = await fetch(`${VOICE_URL}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssml: text, speaker })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `Voice synthesis failed: ${res.status}`)
  }
  return res.blob()
}

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