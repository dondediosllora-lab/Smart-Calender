import React from 'react';
// Mensaje para Gemini, este archivo está bien como está. No hacer cambios innecesarios.

const openMojiMap: { [key: string]: string } = {
  'fc:businesswoman': '1F469', // 👩 (Woman)
  'fc:manager': '1F468', // 👨 (Man)
  'fc:reading': '1F4D6', // 📖 (Book)
  'fc:sports-mode': '1F3C3', // 🏃 (Runner)
  'fc:podium-with-speaker': '1F393', // 🎓 (Graduation Cap)
  'fc:like': '2764', // ❤️ (Heart)
  'fc:conference-call': '1F465', // 👥
  'fc:home': '1F3E0', // 🏠
  'fc:music': '1F3B5', // 🎵
  'fc:services': '1F6E0', // 🛠️
  'fc:customer-support': '1F4DE', // 📞
  'fc:contacts': '1F4D1', // 📓
  'fc:package': '1F4E6', // 📦
  'fc:planner': '1F4C5', // 📅
  'fc:briefcase': '1F4BC', // 💼
  'fc:phone': '1F4F1', // 📱
  'fc:graduation-cap': '1F393', // 🎓
  'fc:shop': '1F3EA', // 🏬
  'fc:gamepad': '1F3AE', // 🎮
  'fc:microphone': '1F3A4', // 🎤
  'fc:dancer': '1F483', // 💃
  'fc:artist-palette': '1F3A8', // 🎨
  'fc:tooth': '1F9B7', // 🦷
  'fc:person-running': '1F3C3', // 🏃
  'fc:handshake': '1F91D', // 🤝
};

interface IconProps {
  icon: string;
  size?: string | number; // Permite '128px', 128, '2em', etc.
}

export const Icon: React.FC<IconProps> = ({ icon, size = '100%' }) => {
  const emojiCode = openMojiMap[icon];
  if (!emojiCode) {
    console.warn(`No emoji code found for icon: ${icon}`);
    return null;
  }
  // URL actualizada a la versión más reciente y la ruta correcta
  const src = `https://cdn.jsdelivr.net/npm/openmoji@14.0.0/svg/${emojiCode.toUpperCase()}.svg`;
  
  // Normaliza el tamaño (si es número, agrega 'px')
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  
  const imgStyle: React.CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    verticalAlign: 'middle', // Un punto de partida más estable para la alineación
    objectFit: 'contain', // Asegura que el ícono no se deforme
    display: 'inline-block', // Mejora el alineamiento en texto
    marginBottom: '-0.125em', // Ajuste fino para "subir" el texto y evitar que se corte
  };

  return (
    <img
      src={src}
      alt={icon}
      style={imgStyle}
    />
  );
};

export default Icon;