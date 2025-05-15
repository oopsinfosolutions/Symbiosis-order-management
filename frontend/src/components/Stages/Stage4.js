import React from 'react';

const Stage4 = ({ formData, handleChange }) => (
  <div>
    <label>
      PO Number:
      <input type="text" name="poNumber" value={formData.poNumber} onChange={handleChange} />
    </label>
    <label>
      PO Date:
      <input type="date" name="poDate" value={formData.poDate} onChange={handleChange} />
    </label>
    <label>
      Inner Order:
      <input type="text" name="innerOrder" value={formData.innerOrder} onChange={handleChange} />
    </label>
    <label>
      Outer Order:
      <input type="text" name="outerOrder" value={formData.outerOrder} onChange={handleChange} />
    </label>
    <label>
      Foil/Tube Order:
      <input type="text" name="foilTubeOrder" value={formData.foilTubeOrder} onChange={handleChange} />
    </label>
    <label>
      Additional Order:
      <input type="text" name="additionalOrder" value={formData.additionalOrder} onChange={handleChange} />
    </label>
  </div>
);

export default Stage4;
