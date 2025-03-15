import { useTranslation } from '@/lib/hooks/useTranslation';
import { XMarkIcon } from '@/lib/icons';
import React, { useEffect, useState } from 'react';

interface RateLimitHelperProps {
  cooldownEndTime: number;
  dailyUsage: number;
  dailyLimit: number;
  onClose: () => void;
}

const RateLimitHelper: React.FC<RateLimitHelperProps> = ({
  cooldownEndTime,
  dailyUsage,
  dailyLimit,
  onClose
}) => {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  
  // Calculate remaining time
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (cooldownEndTime <= Date.now()) {
        setTimeRemaining('');
        return;
      }
      
      const remainingSecs = Math.ceil((cooldownEndTime - Date.now()) / 1000);
      const mins = Math.floor(remainingSecs / 60);
      const secs = remainingSecs % 60;
      
      setTimeRemaining(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };
    
    // Initial calculation
    calculateTimeRemaining();
    
    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownEndTime]);
  
  // Calculate usage percentage
  const usagePercentage = Math.min(100, Math.round((dailyUsage / (dailyLimit || 1)) * 100));
  
  return (
    <div className="permission-helper rate-limit-helper">
      <div className="helper-content">
        <button className="close-button" onClick={onClose}>
          <XMarkIcon />
        </button>
        
        <h3>{t('rate_limit_helper_title')}</h3>
        
        <p>{t('rate_limit_helper_desc')}</p>
        
        {/* Kullanım grafiği */}
        <div className="usage-graph">
          <div className="usage-bar">
            <div 
              className="usage-fill" 
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <div className="usage-info">
            {dailyUsage} / {dailyLimit} ({usagePercentage}%)
          </div>
        </div>
        
        {/* Kalan süre */}
        {timeRemaining && (
          <div className="cooldown-timer">
            <h4>{t('rate_limit_helper_cooldown')}</h4>
            <div className="time-display">{timeRemaining}</div>
          </div>
        )}
        
        <div className="helper-steps">
          <h4>{t('rate_limit_helper_recommendations')}</h4>
          <ul>
            <li>{t('rate_limit_helper_rec1')}</li>
            <li>{t('rate_limit_helper_rec2')}</li>
            <li>{t('rate_limit_helper_rec3')}</li>
            <li>{t('rate_limit_helper_rec4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RateLimitHelper; 