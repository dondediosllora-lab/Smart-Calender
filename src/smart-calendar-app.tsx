import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Check, Loader2, AlertCircle, LogOut, Clock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Icon } from './icons';
import './smart-calendar-app.css';

// Definimos los tipos para mejorar la calidad del código y evitar errores
interface MessageState {
  type: 'success' | 'error' | '';
  text: string;
}

interface ExtractedDataState {
  titulo: string;
  fecha: string;
  hora: string;
  descripcion: string;
}

type TokenResponse = {
  access_token: string;
};

interface DayInfo {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isSunday: boolean;
}

export default function SmartCalendarApp() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState<MessageState>({ type: '', text: '' });
  const [extractedData, setExtractedData] = useState<ExtractedDataState | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [weekDays, setWeekDays] = useState<DayInfo[]>([]);

  const iconShortcuts = [
    { iconName: 'fc:businesswoman', text: 'Gaby ' },
    { iconName: 'fc:manager', text: 'Fran ' },
    { iconName: 'fc:reading', text: 'Trini ' },
    { iconName: 'fc:sports-mode', text: 'Chiara ' },
    { iconName: 'fc:podium-with-speaker', text: 'médico ' },
    { iconName: 'fc:like', text: 'cumple ' },
    { iconName: 'fc:conference-call', text: 'jugar con ' },
    { iconName: 'fc:home', text: 'en casa ' },
    { iconName: 'fc:music', text: 'coro ' },
    { iconName: 'fc:dancer', text: 'danza ' },
    { iconName: 'fc:services', text: 'arte ' },
    { iconName: 'fc:customer-support', text: 'dentista ' },
    { iconName: 'fc:person-running', text: 'atletismo ' },
    { iconName: 'fc:contacts', text: 'enviar ' },
    { iconName: 'fc:package', text: 'retirar ' },
    { iconName: 'fc:planner', text: 'visita ' },
    { iconName: 'fc:briefcase', text: 'reunión ' },
    { iconName: 'fc:phone', text: 'llamar ' },
    { iconName: 'fc:graduation-cap', text: 'colegio ' },
    { iconName: 'fc:shop', text: 'comida ' },
  ];

  useEffect(() => {
    const storedToken = localStorage.getItem('googleAccessToken');
    const storedEmail = localStorage.getItem('googleUserEmail');
    if (storedToken && storedEmail) {
      setAccessToken(storedToken);
      setUserEmail(storedEmail);
      setIsAuthenticated(true);
      console.log('✅ Sesión restaurada desde localStorage.');
      setMessage({ type: 'success', text: '¡Conectado con Google Calendar!' });
    }
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente

  useEffect(() => {
    const days: DayInfo[] = [];
    const today = new Date();
    const dayNames = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

    for (let i = -3; i <= 3; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);

        const isToday = i === 0;
        const dayOfWeek = date.getDay(); // 0 for Sunday

        days.push({
            date,
            dayName: dayNames[dayOfWeek],
            dayNumber: date.getDate(),
            isToday,
            isSunday: dayOfWeek === 0,
        });
    }
    setWeekDays(days);
  }, []);

  const handleLoginSuccess = async (tokenResponse: TokenResponse) => {
    setIsProcessing(true);
    try {
      // Usar el token de acceso para obtener información del usuario
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoResponse.json();
      
      setIsAuthenticated(true);
      // Guardamos los datos en localStorage para persistir la sesión
      localStorage.setItem('googleAccessToken', tokenResponse.access_token);
      localStorage.setItem('googleUserEmail', userInfo.email);

      setUserEmail(userInfo.email);
      console.log('✅ Login exitoso. Token de acceso guardado:', tokenResponse.access_token);
      setMessage({ type: 'success', text: '¡Conectado con Google Calendar!' });
      setAccessToken(tokenResponse.access_token);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setMessage({ type: 'error', text: 'No se pudo obtener la información del usuario.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: (error) => console.error('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/calendar.events',
  });

  const handleLogout = () => {
    setIsProcessing(true);
    // Limpiamos los datos de localStorage al cerrar sesión
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('googleUserEmail');

    setIsAuthenticated(false);
    setUserEmail('');
    setExtractedData(null);
    setMessage({ type: '', text: '' });
    setAccessToken(null);
    setIsProcessing(false);
  };

  // Llama a la API de OpenRouter para procesar el texto
  const processWithOpenRouter = async (text: string): Promise<ExtractedDataState> => {
    const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("La clave de API de OpenRouter no está configurada.");
    }

    console.log('🧠 Enviando consulta a OpenRouter...');
    console.log('🔑 Usando API Key de OpenRouter (primeros 4 caracteres):', apiKey.substring(0, 4));

    const prompt = `
      Analiza el siguiente texto y extrae la información para un evento de calendario.
      La fecha y hora deben basarse en la fecha actual: ${new Date().toISOString()}.
      Devuelve únicamente un objeto JSON válido con las siguientes claves:
      - "titulo": Un título breve y descriptivo para el evento.
      - "fecha": La fecha del evento en formato YYYY-MM-DD.
      - "hora": La hora del evento en formato HH:MM (24 horas).

      Texto a analizar: "${text}"
    `;

    console.log('📝 Prompt enviado:', prompt);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin, // Requerido por OpenRouter. Se adapta al dominio actual.
        'X-Title': 'Smart Calendar', // Opcional, pero recomendado.
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "model": "openai/gpt-4o-mini", // Modelo actualizado según tu solicitud
        "messages": [
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" } // Pedimos que la respuesta sea un JSON
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("❌ Error en la API de OpenRouter:", JSON.stringify(errorDetails, null, 2));
      throw new Error("La respuesta de la API de OpenRouter no fue exitosa.");
    }

    const data = await response.json();
    console.log('✅ Respuesta recibida de OpenRouter:', data);

    // OpenRouter devuelve el JSON directamente en message.content
    const jsonString = data.choices[0].message.content;
    console.log('🔍 JSON extraído:', jsonString);
    const parsedData = JSON.parse(jsonString);
    console.log('📊 Datos parseados:', parsedData);
    
    return {
      ...parsedData,
      descripcion: text, // Aseguramos que la descripción original se mantenga
    };
  };

  const createGoogleCalendarEvent = async (eventData: ExtractedDataState) => {
    if (!accessToken) {
      throw new Error('No hay token de acceso de Google.');
    }

    console.log('📦 Creando evento con los siguientes datos:', eventData);
    console.log('🔑 Usando token de acceso:', accessToken);

    const startDateTime = new Date(`${eventData.fecha}T${eventData.hora}`);
    // Asumimos una duración de 1 hora por defecto
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const event = {
      'summary': eventData.titulo,
      'description': eventData.descripcion,
      'start': {
        'dateTime': startDateTime.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      'end': {
        'dateTime': endDateTime.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('❌ Error de la API de Google:', JSON.stringify(errorDetails, null, 2));
      throw new Error('No se pudo crear el evento en Google Calendar.');
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) {
      setMessage({ type: 'error', text: 'Por favor describe tu tarea' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await processWithOpenRouter(input);
      setExtractedData(data);

      // Llamada real a la API de Google Calendar
      await createGoogleCalendarEvent(data);
      
      setMessage({ 
        type: 'success', 
        text: '¡Evento creado exitosamente en Google Calendar!' 
      });
      setInput('');
      
      setTimeout(() => {
        setExtractedData(null);
      }, 5000);
    } catch (error) {
      console.error(error);
      setMessage({ 
        type: 'error', 
        text: 'Error al crear el evento. Revisa la consola para más detalles.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIconClick = (text: string) => {
    setInput(prevInput => prevInput ? `${prevInput}${text}` : text);
    // Opcional: enfocar el textarea después de hacer clic
    (document.querySelector('.input-textarea') as HTMLTextAreaElement)?.focus();
  };

  return (
    <div className="calendar-app">
      <div className="calendar-wrapper">
        {/* Header */}
        <div className="header">
          <div className="header-top">
            <div className="header-icon">
              <Calendar />
            </div>
            <div className="header-text-content">
              <h1>Calendario Inteligente</h1>
              <p>Crea eventos con lenguaje natural</p>
            </div>
          </div>
          <div className="week-strip">
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`day-item ${day.isToday ? 'today' : ''} ${day.isSunday ? 'sunday' : ''}`}
              >
                <div className="day-name">{day.dayName}</div>
                <div className="day-number">{day.dayNumber}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="main-card">
          {!isAuthenticated ? (
            <div className="auth-section">
              <div>
                <Sparkles className="auth-icon" />
                <h2>
                  Conecta tu Calendario
                </h2>
                <p>
                  Autoriza el acceso a Google Calendar para comenzar a crear eventos automáticamente
                </p>
              </div>
              <button
                onClick={() => handleGoogleAuth()}
                disabled={isProcessing}
                className="btn-primary"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="spinner" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Calendar />
                    Conectar con Google
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="user-info">
                <div className="user-details">
                  <div className="user-avatar">
                    <Check />
                  </div>
                  <div className="user-text">
                    <p>Conectado como</p>
                    <p>{userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  <LogOut />
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="form-container">
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">
                    Describe tu tarea o evento
                  </label>
                  <div className="input-wrapper">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ej: Reunión con el equipo mañana a las 3pm para revisar el proyecto"
                      className="input-textarea"
                      rows={4}
                      disabled={isProcessing}
                    />
                    <Sparkles className="input-icon" />
                  </div>
                  <p className="input-hint">
                    💡 Incluye fecha, hora y detalles en lenguaje natural
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className="btn-submit"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="spinner" />
                      Procesando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles />
                      Crear Evento
                    </>
                  )}
                </button>
              </form>

              {/* Messages */}
              {message.text && (
                <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
                  {message.type === 'success' ? (
                    <Check />
                  ) : (
                    <AlertCircle />
                  )}
                  <p>{message.text}</p>
                </div>
              )}

              {/* Extracted Data Preview */}
              {extractedData && (
                <div className="event-preview">
                  <h3>
                    <Clock />
                    Evento Detectado
                  </h3>
                  <div className="event-details">
                    <div className="event-field title">
                      <label>Título</label>
                      <p>{extractedData.titulo}</p>
                    </div>
                    <div className="event-grid">
                      <div className="event-field">
                        <label>Fecha</label>
                        <p>{new Date(extractedData.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      </div>
                      <div className="event-field">
                        <label>Hora</label>
                        <p>{extractedData.hora}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Icon Shortcuts */}
              <div className="icon-shortcuts">
                <div className="icon-shortcuts-grid">
                  {iconShortcuts.map(({ iconName, text }, index) => (
                    <button key={index} className="icon-shortcut-btn" onClick={() => handleIconClick(text)} title={text.trim()}>
                      <Icon icon={iconName} />
                      <span>{text.trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div className="examples">
                <div className="examples-grid">
                  <div>
                    <p className="examples-title">Ejemplos de uso:</p>
                    <div className="examples-list">
                      {[
                        'Llevar a Trini a Danza mañana a las 5pm',
                        'Chiara tiene Atletismo el miercoles a las 16hs',
                        'Cena con Fran y Gaby el sábado a las 21hs'
                      ].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(example)}
                            className="example-btn"
                        >
                          • {example}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="examples-title">Plantillas:</p>
                    <div className="examples-list">
                      {[
                        'Llevar a ... a ... el ... a las ...',
                        'Retirar ... en ... el ... a las ...',
                        'Visita de ... el ... a las ... en ...'
                      ].map((template, i) => (
                        <button key={i} onClick={() => setInput(template)} className="example-btn">
                          • {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="footer">
          Powered by OpenRouter AI • Google Calendar API
        </p>
      </div>
    </div>
  );
}