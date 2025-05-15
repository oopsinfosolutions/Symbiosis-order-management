import React from 'react';

const Stage3 = ({ formData, handleChange }) => (
  <div>
    <label>
      Approved Artwork:
      <select name="approvedArtwork" value={formData.approvedArtwork} onChange={handleChange}>
        <option value="approved">Approved</option>
        <option value="hold">Hold</option>
      </select>
    </label>
    {formData.approvedArtwork === 'hold' && (
      <label>
        Reason If Hold:
        <input type="text" name="reasonIfHold" value={formData.reasonIfHold} onChange={handleChange} />
      </label>
    )}
  </div>
);

export default Stage3;
