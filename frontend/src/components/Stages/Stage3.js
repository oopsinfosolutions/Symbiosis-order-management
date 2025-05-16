import React from 'react';

const Stage3 = ({ formData, handleChange }) => (
  <div>
    <label>
        Concerned Person:
        <input
          type="text"
          name="concernedPerson"
          value={formData.concernedPerson}
          onChange={handleChange}
        />
      </label>
      <label>
        Brand Name:
        <input
          type="text"
          name="brandName"
          value={formData.brandName}
          onChange={handleChange}
        />
      </label>
      <label>
        Designer Details:
        <input
          type="text"
          name="designer"
          value={formData.designer}
          onChange={handleChange}
        />
      </label>
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
