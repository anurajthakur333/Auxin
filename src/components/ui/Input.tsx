import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', style = {}, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`aeonik-mono ${className}`}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0px',
          color: '#FFF',
          fontSize: '12px',
          outline: 'none',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#39FF14';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
