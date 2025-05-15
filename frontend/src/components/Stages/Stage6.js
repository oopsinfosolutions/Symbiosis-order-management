import React from 'react';

const Stage6 = ({ formData, handleChange }) => (
  <div>
    <label>
      Dispatch Date:
      <input type="date" name="dispatchDate" value={formData.dispatchDate} onChange={handleChange} />
    </label>
    <label>
      Quantity Dispatched:
      <input type="number" name="qtyDispatch" value={formData.qtyDispatch} onChange={handleChange} />
    </label>
    <label>
      Shipper:
      <input type="text" name="shipper" value={formData.shipper} onChange={handleChange} />
    </label>
  </div>
);

export default Stage6;
