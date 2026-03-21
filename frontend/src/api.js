const PIPELINE_URL = 'http://localhost:8000'
const VOICE_URL = 'http://localhost:8003'

/**
 * generateAvatar
 * Called by CreatePage handleGenerate()
 *
 * @param {File}     imageFile        - portrait photo file
 * @param {string}   text             - speech text
 * @param {Function} onUploadProgress - progress callback (0 to 1)
 * @param {string}   targetLanguage   - language code e.g. 'hi', 'en'
 * @param {string}   speaker          - speaker name e.g. 'shreeja', 'kshitij'
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
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error('Invalid response from server'))
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err.detail || 'Generation failed'))
        } catch {
          reject(new Error(`Server error: ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error',   () => reject(new Error('Network error — is the backend running?')))
    xhr.addEventListener('timeout', () => reject(new Error('Request timed out — video generation takes 3-5 mins')))

    xhr.timeout = 600000 // 10 minute timeout
    xhr.open('POST', `${PIPELINE_URL}/generate-video`)
    xhr.send(formData)
  })
}

/**
 * synthesizeVoice
 * Directly calls the voice synthesis service
 *
 * @param {string} text     - text to synthesize
 * @param {string} speaker  - speaker name e.g. 'shreeja', 'kshitij'
 * @returns {Blob}          - audio blob (wav)
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
 * Fetches the list of valid speaker names from the voice service
 *
 * @returns {string[]} - e.g. ["shreeja", "osin", "soham", ...]
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