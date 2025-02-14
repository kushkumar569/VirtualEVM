import { useState } from 'react';
import './EVM.css';

const EVM = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="checkbox-container">
      <label className="checkbox-label">
        <input 
          type="checkbox" 
          checked={false} 
          onChange={handleCheckboxChange} 
          className="styled-checkbox"
        />
        <span className="checkbox-custom"></span>
        I agree to the terms and conditions
      </label>
    </div>
  );
};

export default EVM;
