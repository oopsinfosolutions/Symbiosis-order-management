import React from 'react';

const Stage5 = ({ formData, handleChange }) => (
  <div>
    <label>
      Receipt Date:
      <input type="date" name="receiptDate" value={formData.receiptDate} onChange={handleChange} />
    </label>
    <label>
      Short/Excess:
      <input type="text" name="shortExcess" value={formData.shortExcess} onChange={handleChange} />
    </label>
  </div>
);

export default Stage5;
