import React from 'react';

/**
 * Enhanced Button component with modern styling
 */
export const Button = ({ 
  children, 
  onClick, 
  primary = false, 
  secondary = false,
  success = false,
  danger = false,
  large = false, 
  small = false,
  disabled = false,
  icon = null,
  className = '',
  ...props 
}) => {
  // Determine button type classes
  const typeClass = primary ? 'btn-primary' : 
                   secondary ? 'btn-secondary' :
                   success ? 'btn-success' :
                   danger ? 'btn-danger' : '';
  
  // Determine size class
  const sizeClass = large ? 'btn-large' : small ? 'btn-small' : '';
  
  return (
    <button
      className={`btn ${typeClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

/**
 * Enhanced Card component for consistent content sections
 */
export const Card = ({
  children,
  title,
  subtitle,
  className = '',
  footer,
  ...props
}) => {
  return (
    <div className={`section-card ${className}`} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Badge component for status indicators
 */
export const Badge = ({
  children,
  variant = 'primary', // primary, secondary, success, warning, danger
  className = '',
  ...props
}) => {
  return (
    <span 
      className={`badge badge-${variant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * Player Avatar component to show player colors consistently
 */
export const PlayerAvatar = ({
  player,
  size = 'md', // sm, md, lg
  showName = true,
  className = '',
  ...props
}) => {
  // Get player color based on name
  const getPlayerColor = (name) => {
    const colors = {
      'David': 'var(--player1-color)',
      'Manu': 'var(--player2-color)',
      'Antoine': 'var(--player3-color)',
      'Quentin': 'var(--player4-color)'
    };
    
    return colors[name] || 'var(--primary-color)';
  };
  
  // Get player initial
  const getInitial = (name) => {
    return name ? name.charAt(0) : '?';
  };
  
  return (
    <div className={`player-avatar avatar-${size} ${className}`} {...props}>
      <div 
        className="avatar-circle"
        style={{ backgroundColor: getPlayerColor(player) }}
      >
        {getInitial(player)}
      </div>
      {showName && <span className="avatar-name">{player}</span>}
    </div>
  );
};

/**
 * Progress bar component for game progress
 */
export const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  label,
  className = '',
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`progress-container ${className}`} {...props}>
      {showLabel && (
        <div className="progress-text">
          <span>{label || `${value} / ${max}`}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * Heading with decorative underline
 */
export const SectionHeading = ({
  children,
  className = '',
  centered = false,
  ...props
}) => {
  return (
    <h2 
      className={`section-heading ${centered ? 'text-center' : ''} ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};

/**
 * Icon button for common actions
 */
export const IconButton = ({
  icon,
  onClick,
  label = '',
  variant = 'default', // default, primary, secondary, etc.
  size = 'md', // sm, md, lg
  className = '',
  ...props
}) => {
  return (
    <button
      className={`icon-button ${variant !== 'default' ? `icon-button-${variant}` : ''} icon-button-${size} ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
};

/**
 * Modal component
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
  ...props
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-content ${className}`}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Tab component for switching between views
 */
export const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
  ...props
}) => {
  return (
    <div className={`tabs-container ${className}`} {...props}>
      <div className="tabs-header">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

/**
 * Alert component for notifications
 */
export const Alert = ({
  children,
  variant = 'info', // info, success, warning, danger
  icon,
  onClose,
  className = '',
  ...props
}) => {
  return (
    <div 
      className={`alert alert-${variant} ${className}`}
      role="alert"
      {...props}
    >
      {icon && <div className="alert-icon">{icon}</div>}
      <div className="alert-content">{children}</div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>×</button>
      )}
    </div>
  );
};

/**
 * Input field with consistent styling
 */
export const Input = ({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        type={type}
        id={id}
        className="input-field"
        {...props}
      />
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

/**
 * Confetti animation for celebrations
 */
export const Confetti = ({ active = false }) => {
  if (!active) return null;
  
  return (
    <div className="confetti-container">
      {[...Array(50)].map((_, i) => (
        <div 
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            backgroundColor: `hsl(${Math.random() * 360}, 90%, 60%)`,
          }}
        ></div>
      ))}
    </div>
  );
};

/**
 * Trophy for winners
 */
export const Trophy = ({ 
  place = 1, // 1, 2, 3
  player,
  showAnimation = false,
  className = '',
  ...props 
}) => {
  const trophyEmoji = place === 1 ? '🏆' : place === 2 ? '🥈' : place === 3 ? '🥉' : '🎖️';
  
  return (
    <div 
      className={`trophy trophy-${place} ${showAnimation ? 'animated' : ''} ${className}`}
      {...props}
    >
      <div className="trophy-emoji">{trophyEmoji}</div>
      {player && <div className="trophy-player">{player}</div>}
    </div>
  );
};

export default {
  Button,
  Card,
  Badge,
  PlayerAvatar,
  ProgressBar,
  SectionHeading,
  IconButton,
  Modal,
  Tabs,
  Alert,
  Input,
  Confetti,
  Trophy
};
