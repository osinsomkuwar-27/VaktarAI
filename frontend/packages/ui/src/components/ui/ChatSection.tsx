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
const LANGUAGES: string[] = ['English', 'Hindi', 'Spanish', 'French', 'German'];

const LANGUAGE_CODES: Record<string, string> = {
  English: 'en',
  Hindi: 'hi',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Taviraj:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&display=swap');

  :root {
    --bg: #f0f4f8;
    --surface: #faf7f2;
    --surface2: #eef4f9;
    --surface3: #dceef8;
    --sidebar-band: #e8f5f3;
    --border: rgba(30, 60, 120, 0.10);
    --navy: #1a2e5a;
    --navy2: #2a4480;
    --turquoise: #2abfbf;
    --lightblue: #6aaee8;
    --beige: #f5efe4;
    --beige2: #ede3d0;
    --accent: #1a5abf;
    --accent-glow: rgba(26, 90, 191, 0.18);
    --text: #162040;
    --muted: #6a7fa8;
    --nav-h: 70px;
    --sidebar-w: 300px;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 4px; }

  /* ─── LAYOUT ─── */
  .layout {
    display: flex;
    height: calc(100vh - var(--nav-h));
    overflow: hidden;
  }

  /* ─── SIDEBAR ─── */
  .sidebar {
    width: var(--sidebar-w);
    flex-shrink: 0;
    background: var(--surface);
    border-right: 1.5px solid var(--beige2);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 24px 18px;
    gap: 22px;
    position: relative;
  }

  .sidebar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--turquoise), var(--lightblue));
  }

  .sidebar-section { display: flex; flex-direction: column; gap: 8px; }

  .section-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0 4px;
  }

  .upload-box {
    border: 1.5px dashed var(--beige2);
    border-radius: 14px;
    background: var(--beige);
    padding: 22px 14px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }

  .upload-box:hover { border-color: var(--turquoise); background: var(--sidebar-band); }

  .upload-icon {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: var(--surface3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    font-size: 1.1rem;
    border: 1px solid var(--beige2);
  }

  .upload-box p { font-size: 0.78rem; color: var(--muted); line-height: 1.5; }
  .upload-box small { font-size: 0.65rem; color: color-mix(in srgb, var(--muted) 60%, transparent); }

  .select-wrap { position: relative; }

  .select-wrap select {
    width: 100%;
    padding: 10px 32px 10px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'Taviraj', serif;
    font-size: 0.85rem;
    appearance: none;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }

  .select-wrap select:focus { border-color: var(--turquoise); }

  .select-wrap::after {
    content: '▾';
    position: absolute;
    right: 12px; top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
    font-size: 0.8rem;
  }

  .voice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }

  .voice-btn {
    padding: 9px 8px;
    border-radius: 9px;
    text-align: center;
    background: var(--surface2);
    border: 1px solid var(--border);
    font-size: 0.8rem;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Taviraj', serif;
  }

  .voice-btn:hover { border-color: var(--turquoise); color: var(--navy); background: var(--sidebar-band); }

  .voice-btn.active {
    background: color-mix(in srgb, var(--turquoise) 14%, transparent);
    border-color: var(--turquoise);
    color: var(--turquoise);
  }

  .voice-btn.active::before { content: '✓ '; }

  .sidebar-divider { height: 1px; background: var(--beige2); margin: 2px 0; }

  .sidebar-status { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }

  .status-pill {
    padding: 10px 14px;
    border-radius: 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    font-size: 0.78rem;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--beige2); }

  .status-dot.ready {
    background: var(--turquoise);
    box-shadow: 0 0 7px rgba(42, 191, 191, 0.5);
  }

  .clear-btn {
    padding: 10px 14px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid var(--beige2);
    color: var(--muted);
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    font-family: 'Taviraj', serif;
  }

  .clear-btn:hover { border-color: #e05555; color: #c94444; background: rgba(220, 60, 60, 0.05); }

  /* ─── CHAT AREA ─── */
  .chat-area { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--bg); }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .msg-row { display: flex; gap: 12px; align-items: flex-end; max-width: 70%; }
  .msg-row.user { flex-direction: row-reverse; align-self: flex-end; }
  .msg-row.avatar { align-self: flex-start; }

  .msg-icon {
    width: 32px; height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    border: 2px solid #fff;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(26, 46, 90, 0.15);
  }

  .msg-icon.ai-icon { background: linear-gradient(135deg, var(--navy), var(--turquoise)); color: #fff; }
  .msg-icon.user-icon { background: linear-gradient(135deg, var(--lightblue), var(--accent)); color: #fff; }

  .bubble { padding: 13px 18px; border-radius: 18px; line-height: 1.65; font-size: 0.9rem; position: relative; }

  .msg-row.avatar .bubble {
    background: #fff;
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
    color: var(--text);
    box-shadow: 0 2px 10px rgba(26, 46, 90, 0.06);
  }

  .msg-row.user .bubble {
    background: linear-gradient(135deg, var(--navy), var(--navy2));
    border-bottom-right-radius: 4px;
    color: #fff;
    box-shadow: 0 4px 18px var(--accent-glow);
  }

  .msg-meta { font-size: 0.67rem; color: var(--muted); margin-top: 5px; padding: 0 4px; text-align: right; }
  .msg-row.avatar .msg-meta { text-align: left; }

  .bubble.error {
    background: #fff5f5;
    border: 1px solid rgba(220, 60, 60, 0.25);
    color: #c94444;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ─── TYPING ─── */
  .typing-dots { display: flex; gap: 5px; align-items: center; }

  .typing-dots span {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--turquoise);
    animation: bounce 1.2s ease-in-out infinite;
  }

  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-6px); opacity: 1; }
  }

  /* ─── INPUT BAR ─── */
  .input-bar {
    padding: 16px 28px 18px;
    background: #fff;
    border-top: 1px solid var(--border);
    box-shadow: 0 -2px 12px rgba(26, 46, 90, 0.05);
  }

  .input-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 10px 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .input-wrap:focus-within {
    border-color: var(--turquoise);
    box-shadow: 0 0 0 3px rgba(42, 191, 191, 0.15);
  }

  .input-wrap textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'Taviraj', serif;
    font-size: 0.9rem;
    resize: none;
    line-height: 1.5;
    max-height: 120px;
    min-height: 24px;
  }

  .input-wrap textarea::placeholder { color: var(--muted); }

  .send-btn {
    width: 38px; height: 38px;
    border-radius: 11px;
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--navy), var(--accent));
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s, transform 0.2s;
    box-shadow: 0 2px 10px var(--accent-glow);
  }

  .send-btn:hover { opacity: 0.85; transform: scale(1.05); }
  .send-btn svg { width: 16px; height: 16px; fill: #fff; }

  @media (max-width: 820px) {
    .sidebar { display: none; }
    .messages { padding: 20px 16px; }
    .msg-row { max-width: 90%; }
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
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
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
    {
      id: 2,
      role: 'user',
      text: 'what is square of 9',
      time: '06:45 pm',
      isError: false,
    },
    {
      id: 3,
      role: 'avatar',
      text: '⚠ Failed to fetch — please upload a photo to enable avatar responses.',
      time: '06:45 pm',
      isError: true,
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

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="section-label">Avatar Photo</div>
            <div className="upload-box" onClick={handleUploadClick}>
              <div className="upload-icon">📷</div>
              <p>Drop or click to upload</p>
              <small>JPG · PNG · WEBP</small>
            </div>
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
    </>
  );
}