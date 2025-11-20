import React from 'react';
import { useCounterAnimation } from '../../hooks/useCounterAnimation';
import '../../styles/Admin.css';

interface CounterCardProps {
  icon: string;
  title: string;
  value: number;
  subtitle?: string;
  color?: string;
  duration?: number;
}

const CounterCard: React.FC<CounterCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color,
  duration = 2000 
}) => {
  const { currentValue } = useCounterAnimation(value, duration);

  return (
    <div className="stat-card counter-card">
      <div className="stat-icon" style={color ? { background: color } : {}}>{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-number counter-number">{currentValue.toLocaleString()}</p>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </div>
  );
};

export default CounterCard;
