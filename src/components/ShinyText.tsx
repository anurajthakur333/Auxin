import './ShinyText.css';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ShinyText = ({ text, disabled = false, speed = 5, className = '', style = {} }: ShinyTextProps) => {
  const animationDuration = `${speed}s`;

  return (
    <div 
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`} 
      style={{ animationDuration, ...style }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
