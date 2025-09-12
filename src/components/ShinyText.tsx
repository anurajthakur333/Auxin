import '../styles/ShinyText.css';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ShinyText = ({ text, disabled = false, speed = 5, className = '', style = {} }: ShinyTextProps) => {
  const animationDuration = `${speed}s`;

  // Default styles for meeting subtitle
  const defaultStyles = className.includes('meeting-subtitle') ? {
    fontSize: 'clamp(20px, 3vw, 28px)',
    lineHeight: '1.4',
    fontWeight: 300
  } : {};

  return (
    <div 
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`} 
      style={{ animationDuration, ...defaultStyles, ...style }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
