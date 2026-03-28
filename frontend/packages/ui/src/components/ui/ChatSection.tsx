import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from 'react';

type Role = 'avatar' | 'user';

interface Message {
  id: number;
  role: Role;
  text: string;
  time: string;
  isError: boolean;
  videoUrl?: string;
}

const VOICES: string[] = ['Shreeja', 'Osin', 'Soham', 'Kshitij', 'Tanishka', 'Bhargavi'];
const LANGUAGES: string[] = [
  'Hindi', 'Marathi', 'Bengali', 'Tamil',
  'Telugu', 'Gujarati', 'Kannada', 'Malayalam',
  'Punjabi', 'Urdu',
];

const LANGUAGE_CODES: Record<string, string> = {
  Hindi: 'hi',
  Marathi: 'mr',
  Bengali: 'bn',
  Tamil: 'ta',
  Telugu: 'te',
  Gujarati: 'gu',
  Kannada: 'kn',
  Malayalam: 'ml',
  Punjabi: 'pa',
  Urdu: 'ur',
};

const CSS = `
  .vaktar-chat {
    --bg: #F3F4F4;
    --surface: #ffffff;
    --surface2: #f6f8f8;
    --surface3: #edf1f1;
    --sidebar-band: #e9eeef;
    --border: rgba(6, 30, 41, 0.10);
    --navy: #061E29;
    --navy2: #061E29;
    --turquoise: #1D546D;
    --lightblue: #5F9598;
    --beige: #F3F4F4;
    --beige2: rgba(95, 149, 152, 0.24);
    --accent: #5F9598;
    --accent-glow: rgba(29, 84, 109, 0.10);
    --text: #061E29;
    --muted: #5F9598;
    --nav-h: 72px;
    --sidebar-w: 380px;
    position: relative;
  }

  .vaktar-chat *, .vaktar-chat *::before, .vaktar-chat *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ─── LAYOUT ─── */
  .vaktar-chat .nav-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--nav-h);
    background: #1D546D;
    border-bottom: 1px solid rgba(243, 244, 244, 0.14);
    z-index: 1;
  }

  .vaktar-chat .layout {
    display: flex;
    height: 100vh;
    padding-top: var(--nav-h);
    font-family: inherit;
    color: var(--text);
    background: var(--bg);
  }

  /* ─── SIDEBAR ─── */
  .vaktar-chat .sidebar {
    width: var(--sidebar-w);
    flex-shrink: 0;
    background: #1D546D;
    border-right: 1px solid var(--beige2);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 24px 18px;
    gap: 22px;
  }

  .vaktar-chat .sidebar-section { display: flex; flex-direction: column; gap: 8px; }

  .vaktar-chat .section-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #F3F4F4;
    padding: 0 4px;
  }

  .vaktar-chat .photo-preview {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--beige2);
    box-shadow: 0 8px 18px rgba(6, 30, 41, 0.06);
    cursor: pointer;
  }

  .vaktar-chat .photo-preview img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    display: block;
  }

  .vaktar-chat .photo-preview-overlay {
    position: absolute;
    inset: 0;
    background: rgba(6, 30, 41, 0.54);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .vaktar-chat .photo-preview:hover .photo-preview-overlay { opacity: 1; }
  .vaktar-chat .photo-preview-overlay span { font-size: 1.2rem; }

  .vaktar-chat .upload-box {
    border: 1.5px dashed var(--beige2);
    border-radius: 14px;
    background: #F3F4F4;
    padding: 22px 14px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .vaktar-chat .upload-box:hover { border-color: #F3F4F4; background: #F3F4F4; }

  .vaktar-chat .upload-icon {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: rgba(6, 30, 41, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    font-size: 1.1rem;
    border: 1px solid var(--beige2);
  }

  .vaktar-chat .upload-box p { font-size: 0.78rem; color: #061E29; line-height: 1.5; }
  .vaktar-chat .upload-box small { font-size: 0.65rem; color: #5F9598; }

  .vaktar-chat .select-wrap { position: relative; }

  .vaktar-chat .select-wrap select {
    width: 100%;
    padding: 10px 32px 10px 12px;
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: inherit;
    font-size: 0.85rem;
    appearance: none;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }

  .vaktar-chat .select-wrap select:focus { border-color: var(--turquoise); }

  .vaktar-chat .select-wrap::after {
    content: '▾';
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    color: var(--navy);
    pointer-events: none;
    font-size: 0.8rem;
  }

  .vaktar-chat .voice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }

  .vaktar-chat .voice-btn {
    all: unset;
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 9px 8px;
    border-radius: 9px;
    text-align: center;
    background: #ffffff;
    border: 1px solid var(--border);
    font-size: 0.8rem;
    color: var(--muted);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    font-family: inherit;
    font-weight: 400;
    line-height: 1.4;
  }

  .vaktar-chat .voice-btn:hover {
    border-color: var(--turquoise);
    color: var(--navy);
    background: #F3F4F4;
  }

  .vaktar-chat .voice-btn.active {
    background: #F3F4F4;
    border-color: #F3F4F4;
    color: #1D546D;
    font-weight: 500;
  }

  .vaktar-chat .voice-btn.active::before { content: '✓ '; }

  .vaktar-chat .sidebar-divider { height: 1px; background: rgba(243, 244, 244, 0.16); margin: 2px 0; }

  .vaktar-chat .sidebar-status { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }

  .vaktar-chat .status-pill {
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(243, 244, 244, 0.10);
    border: 1px solid rgba(243, 244, 244, 0.14);
    font-size: 0.78rem;
    color: #F3F4F4;
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .vaktar-chat .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--beige2); flex-shrink: 0; }

  .vaktar-chat .status-dot.ready {
    background: var(--turquoise);
    box-shadow: 0 0 0 4px rgba(95, 149, 152, 0.14);
  }

  .vaktar-chat .clear-btn {
    all: unset;
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 10px 14px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid rgba(243, 244, 244, 0.18);
    color: #F3F4F4;
    font-size: 0.78rem;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
    text-align: left;
    font-family: inherit;
  }

  .vaktar-chat .clear-btn:hover { border-color: #F3F4F4; color: #F3F4F4; background: rgba(243, 244, 244, 0.08); }

  /* ─── SCROLLBAR ─── */
  .vaktar-chat ::-webkit-scrollbar { width: 5px; }
  .vaktar-chat ::-webkit-scrollbar-track { background: transparent; }
  .vaktar-chat ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 4px; }

  /* ─── CHAT AREA ─── */
  .vaktar-chat .chat-area { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--bg); }

  .vaktar-chat .messages {
    flex: 1;
    overflow-y: auto;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: #f7f8f8;
  }

  .vaktar-chat .msg-row { display: flex; gap: 12px; align-items: flex-end; max-width: 70%; }
  .vaktar-chat .msg-row.user { flex-direction: row-reverse; align-self: flex-end; }
  .vaktar-chat .msg-row.avatar { align-self: flex-start; }

  .vaktar-chat .msg-icon {
    width: 32px; height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid rgba(6, 30, 41, 0.08);
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(6, 30, 41, 0.06);
  }

  .vaktar-chat .msg-icon.ai-icon { background: var(--navy); color: #fff; }
  .vaktar-chat .msg-icon.user-icon { background: var(--lightblue); color: #fff; }

  .vaktar-chat .bubble { padding: 13px 18px; border-radius: 18px; line-height: 1.65; font-size: 0.9rem; position: relative; }

  .vaktar-chat .msg-row.avatar .bubble {
    background: #fff;
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
    color: var(--text);
    box-shadow: 0 6px 14px rgba(6, 30, 41, 0.04);
  }

  .vaktar-chat .msg-row.user .bubble {
    background: rgba(6, 30, 41, 0.06);
    border: 1px solid rgba(6, 30, 41, 0.10);
    border-bottom-right-radius: 4px;
    color: var(--navy);
    box-shadow: none;
  }

  .vaktar-chat .msg-meta { font-size: 0.67rem; color: var(--muted); margin-top: 5px; padding: 0 4px; text-align: right; }
  .vaktar-chat .msg-row.avatar .msg-meta { text-align: left; }

  .vaktar-chat .bubble.error {
    background: #fff;
    border: 1px solid rgba(95, 149, 152, 0.35);
    color: var(--navy);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ─── TYPING ─── */
  .vaktar-chat .typing-dots { display: flex; gap: 5px; align-items: center; }

  .vaktar-chat .typing-dots span {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--turquoise);
    animation: vaktar-bounce 1.2s ease-in-out infinite;
  }

  .vaktar-chat .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .vaktar-chat .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes vaktar-bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  /* ─── INPUT BAR ─── */
  .vaktar-chat .input-bar {
    padding: 16px 28px 18px;
    background: #fff;
    border-top: 1px solid var(--border);
    box-shadow: none;
  }

  .vaktar-chat .input-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 10px 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .vaktar-chat .input-wrap:focus-within {
    border-color: var(--turquoise);
    box-shadow: 0 0 0 3px rgba(95, 149, 152, 0.12);
  }

  .vaktar-chat .input-wrap textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: inherit;
    font-size: 0.9rem;
    resize: none;
    line-height: 1.5;
    max-height: 120px;
    min-height: 24px;
  }

  .vaktar-chat .input-wrap textarea::placeholder { color: var(--muted); }

  .vaktar-chat .send-btn {
    all: unset;
    box-sizing: border-box;
    width: 38px; height: 38px;
    border-radius: 11px;
    flex-shrink: 0;
    background: var(--navy);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s, transform 0.2s;
    box-shadow: none;
  }

  .vaktar-chat .send-btn:hover { opacity: 0.85; transform: scale(1.05); }
  .vaktar-chat .send-btn svg { width: 16px; height: 16px; fill: #fff; }

  @media (max-width: 820px) {
    .vaktar-chat .sidebar { display: none; }
    .vaktar-chat .messages { padding: 20px 16px; }
    .vaktar-chat .msg-row { max-width: 90%; }
  }
`;
function getTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

type AskAvatarFn = (
  photoFile: File,
  question: string,
  targetLanguage?: string,
  speaker?: string
) => Promise<{ answer: string; video_url?: string; llm_source?: string; session_id?: string }>;

interface VaktarChatProps {
  askAvatar: AskAvatarFn;
}

export default function VaktarChat({ askAvatar }: VaktarChatProps) {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Shreeja');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'avatar',
      text: "👋 Hello! I'm your Vaktar AI Avatar. Upload a photo in the sidebar to bring me to life, then ask me anything!",
      time: 'Just now',
      isError: false,
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleUploadClick = (): void => { fileInputRef.current?.click(); };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      if (ev.target?.result) setUserAvatar(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearChat = (): void => {
    setMessages([{
      id: Date.now(),
      role: 'avatar',
      text: '👋 Chat cleared! Upload a photo and ask me anything.',
      time: getTime(),
      isError: false,
    }]);
  };

  const sendMessage = async (): Promise<void> => {
    const text = inputValue.trim();
    if (!text) return;

    if (!photoFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'avatar',
          text: '⚠ Please upload a photo first — the avatar needs it to generate a video response.',
          time: getTime(),
          isError: true,
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text, time: getTime(), isError: false }]);
    setInputValue('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsTyping(true);

    try {
      const langCode = LANGUAGE_CODES[selectedLanguage] ?? 'en';
      const speaker = selectedVoice.toLowerCase();

      const result = await askAvatar(photoFile, text, langCode, speaker);
      // result: { answer, video_url, llm_source, session_id }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'avatar',
          text: result.answer ?? 'Here is your avatar response.',
          time: getTime(),
          isError: false,
          videoUrl: result.video_url ?? undefined,
        },
      ]);
    } catch (err) {
      setIsTyping(false);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'avatar',
          text: `⚠ ${message}`,
          time: getTime(),
          isError: true,
        },
      ]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e: FormEvent<HTMLTextAreaElement>): void => {
    const target = e.target as HTMLTextAreaElement;
    setInputValue(target.value);
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="vaktar-chat">
        <div className="nav-backdrop" />
        <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="section-label">Avatar Photo</div>
            {userAvatar ? (
              <div className="photo-preview" onClick={handleUploadClick} title="Click to change photo">
                <img src={userAvatar} alt="Uploaded avatar" />
                <div className="photo-preview-overlay">
                  <span>📷</span>
                  Change Photo
                </div>
              </div>
            ) : (
              <div className="upload-box" onClick={handleUploadClick}>
                <div className="upload-icon">📷</div>
                <p>Drop or click to upload</p>
                <small>JPG · PNG · WEBP</small>
              </div>
            )}
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="section-label">Language</div>
            <div className="select-wrap">
              <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                {LANGUAGES.map((lang) => <option key={lang}>{lang}</option>)}
              </select>
            </div>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="section-label">Voice</div>
            <div className="voice-grid">
              {VOICES.map((voice) => (
                <button
                  key={voice}
                  className={`voice-btn${selectedVoice === voice ? ' active' : ''}`}
                  onClick={() => setSelectedVoice(voice)}
                >
                  {voice}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-status">
            <div className="status-pill">
              <div className={`status-dot${userAvatar ? ' ready' : ''}`} />
              <span>{userAvatar ? 'Avatar ready' : 'Upload a photo to begin'}</span>
            </div>
            <button className="clear-btn" onClick={clearChat}>
              ⊘ Clear History ({messages.length})
            </button>
          </div>
        </aside>

        <div className="chat-area">
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`msg-row ${msg.role}`}>
                <div
                  className={`msg-icon ${msg.role === 'user' ? 'user-icon' : 'ai-icon'}`}
                  style={msg.role === 'user' && userAvatar ? { backgroundImage: `url(${userAvatar})`, backgroundSize: 'cover' } : {}}
                >
                  {msg.role === 'user' && userAvatar ? '' : msg.role === 'user' ? 'U' : 'V'}
                </div>
                <div>
                  <div className={`bubble${msg.isError ? ' error' : ''}`}>
                    {msg.text}
                    {msg.videoUrl && (
                      <video
                        src={msg.videoUrl}
                        controls
                        style={{ display: 'block', marginTop: '10px', borderRadius: '10px', maxWidth: '100%', width: '320px' }}
                      />
                    )}
                  </div>
                  <div className="msg-meta">{msg.time}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msg-row avatar typing">
                <div className="msg-icon ai-icon">V</div>
                <div>
                  <div className="bubble">
                    <div className="typing-dots"><span /><span /><span /></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-bar">
            <div className="input-wrap">
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={userAvatar ? 'Ask me anything…' : 'Upload a photo first…'}
                value={inputValue}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
              />
              <button className="send-btn" onClick={sendMessage}>
                <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
