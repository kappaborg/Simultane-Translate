import { useTranslation } from '@/lib/hooks/useTranslation';
import { MicrophoneIcon, XMarkIcon } from '@/lib/icons';
import React from 'react';

interface PermissionHelperProps {
  permissionType: 'microphone' | 'speech-recognition';
  onRequestPermission: () => void;
  onClose: () => void;
}

const PermissionHelper: React.FC<PermissionHelperProps> = ({
  permissionType,
  onRequestPermission,
  onClose
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="permission-helper">
      <div className="helper-content">
        <button className="close-button" onClick={onClose}>
          <XMarkIcon />
        </button>
        
        <h3>
          {permissionType === 'microphone' 
            ? t('permission_helper_mic_title') 
            : t('permission_helper_speech_title')}
        </h3>
        
        <p>
          {permissionType === 'microphone' 
            ? t('permission_helper_mic_desc') 
            : t('permission_helper_speech_desc')}
        </p>
        
        <div className="helper-steps">
          <h4>{t('permission_helper_steps')}</h4>
          <ul>
            <li>{t('permission_helper_step1')}</li>
            <li>{t('permission_helper_step2')}</li>
            <li>{t('permission_helper_step3')}</li>
            <li>{t('permission_helper_step4')}</li>
          </ul>
        </div>
        
        <button 
          onClick={onRequestPermission}
          className="primary-button"
        >
          <MicrophoneIcon />
          {t('permission_helper_request_button')}
        </button>
      </div>
    </div>
  );
};

export default PermissionHelper; 