const PIPELINE_URL = 'http://localhost:8000'

/**
 * generateAvatar
 * Called by CreatePage handleGenerate()
 *
 * @param {File}     imageFile        - portrait photo file
 * @param {string}   text             - speech text
 * @param {Function} onUploadProgress - progress callback (0 to 1)
 * @param {string}   targetLanguage   - language code e.g. 'hi', 'en'
 * @param {string}   toneOverride     - tone e.g. 'formal', 'urgent', 'calm'
 */
export async function generateAvatar(
  imageFile,
  text,
  onUploadProgress = () => {},
  targetLanguage = 'hi',
  toneOverride = null
) {
  const formData = new FormData()
  formData.append('photo', imageFile)
  formData.append('text', text)
  formData.append('target_language', targetLanguage)
  if (toneOverride) formData.append('tone_override', toneOverride)

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

export async function checkHealth() {
  try {
    const res = await fetch(`${PIPELINE_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}