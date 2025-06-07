import React from 'react';

const Stage2 = ({ formData, handleChange }) => {
  return (
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
          name="concernedPerson"
          value={formData.brandName}
          onChange={handleChange}
        />
      </label>
      <label>
        Inner Packing:
        <input
          type="text"
          name="innerPacking"
          value={formData.innerPacking}
          onChange={handleChange}
        />
      </label>
      <label>
        Outer Packing:
        <input
          type="text"
          name="OuterPacking"
          value={formData.OuterPacking}
          onChange={handleChange}
        />
      </label>
      <label>
        Foil/Tube:
        <input
          type="text"
          name="foilTube"
          value={formData.foilTube}
          onChange={handleChange}
        />
      </label>
      <label>
        Additional:
        <input
          type="text"
          name="additional"
          value={formData.additional}
          onChange={handleChange}
        />
      </label>
    </div>
  );
};

export default Stage2;
