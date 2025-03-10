import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  primary = false, 
  large = false, 
  disabled = false,
  ...props 
}) => {
  return (
    <button
      className={`btn ${primary ? 'btn-primary' : ''} ${large ? 'btn-large' : ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
