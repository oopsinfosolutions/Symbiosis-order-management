import React from 'react';

const Stage3 = ({ formData, handleChange, handleFileChange, artworkFile }) => (
  <div className="space-y-4">
    <label>
      Concerned Person:
      <input
        type="text"
        name="concernedPerson"
        value={formData.concernedPerson}
        onChange={handleChange}
        readOnly
      />
    </label>

    <label>
      Brand Name:
      <input
        type="text"
        name="brandName"
        value={formData.brandName}
        onChange={handleChange}
        readOnly
      />
    </label>

    <label>
      Client Name:
      <input
        type="text"
        name="clientName"
        value={formData.clientName}
        onChange={handleChange}
        readOnly
      />
    </label>

    <label>
      Designer Details:
      <input
        type="text"
        name="designer"
        value={formData.designer}
        onChange={handleChange}
        readOnly
      />
    </label>

    <label>
      Approved Artwork:
      <select
        name="approvedArtwork"
        value={formData.approvedArtwork}
        onChange={handleChange}
      >
        <option value="">--Select--</option>
        <option value="approved">Approved</option>
        <option value="hold">Hold</option>
      </select>
    </label>

    {formData.approvedArtwork === 'hold' && (
      <label>
        Reason If Hold:
        <input
          type="text"
          name="reasonIfHold"
          value={formData.reasonIfHold}
          onChange={handleChange}
        />
      </label>
    )}

<label>
  Attach Approved Artwork (JPEG Only):
  <input
    type="file"
    name="artworkFile"
    accept="image/jpeg, image/jpg"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        alert('Only JPEG files are allowed.');
        e.target.value = ''; // Reset file input
        return;
      }

      handleFileChange(e); // Pass to handler only if valid
    }}
  />
</label>
{artworkFile && (
  <div>
    <p>Selected File: {artworkFile.name}</p>
    <img
      src={URL.createObjectURL(artworkFile)}
      alt="Artwork Preview"
      style={{ width: '200px', marginTop: '10px' }}
    />
  </div>
)}


    {/* Optional: Show selected file name */}
    {formData.artworkFile && (
      <p className="text-sm text-gray-600">
        Selected file: {formData.artworkFile.name}
      </p>
    )}
  </div>
);

export default Stage3;
