import React from 'react';

const openMojiMap: { [key: string]: string } = {
  'fc:businesswoman': '1F469-1F3FD-200D-1F4BC', // 👩‍💼
  'fc:manager': '1F9D4-1F3FB-200D-2642-FE0F', // 👨‍💼
  'fc:reading': '1F469-1F3FD-200D-1F3A4', //  👩🏽‍🎤
  'fc:sports-mode': '1F469-1F3FB-200D-1F3A8', // 🏃
  'fc:podium-with-speaker': '1FA7A', // 👨‍🏫
  'fc:like': '1F382', // ❤️
  'fc:conference-call': '1F64B-1F3FC-200D-2640-FE0F', // 👥
  'fc:home': '1F3E0', // 🏠
  'fc:music': '1F3B5', // 🎵
  'fc:services': '1F3A8', // 🛠️
  'fc:customer-support': '1F9B7', // 📞
  'fc:contacts': '2709', // 📓
  'fc:package': '1F4E6', // 📦
  'fc:planner': '1F4C5', // 📅
  'fc:briefcase': '1F4BC', // 💼
  'fc:phone': '1F4F1', // 📱
  'fc:graduation-cap': '1F3EB', // 🎓
  'fc:shop': '1F37D', // 🏬
  'fc:gamepad': '1F3AE', // 🎮
  'fc:microphone': '1F3A4', // 🎤
  'fc:dancer': '1F483', // 💃
  'fc:artist-palette': '1F3A8', // 🎨
  'fc:tooth': '1F9B7', // 🦷
  'fc:person-running': '1F938-200D-2640-FE0F', // 🏃
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
  // URL corregida (funcionando)
  const src = `https://cdn.jsdelivr.net/npm/openmoji@13.1.0/color/svg/${emojiCode.toUpperCase()}.svg`;
  
  // Normaliza el tamaño (si es número, agrega 'px')
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  
  const imgStyle: React.CSSProperties = {
    width: sizeValue,
    height: sizeValue,
    verticalAlign: 'middle', // Un punto de partida más estable para la alineación
    objectFit: 'contain', // Asegura que el ícono no se deforme
    display: 'inline-block', // Mejora el alineamiento en texto
    marginBottom: '-0.525em', // Ajuste fino para "subir" el texto y evitar que se corte
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