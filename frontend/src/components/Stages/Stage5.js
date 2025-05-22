import React from 'react';

const Stage4 = ({ formData, handleChange }) => {
  const handleViewArtwork = () => {
    if (formData.artworkUrl) {
      window.open(formData.artworkUrl, '_blank');
    } else {
      alert('No artwork file available.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Prefilled Fields */}
      <label>
        Brand Name:
        <input type="text" name="brandName" value={formData.brandName || ''} readOnly />
      </label>

      <label>
        Client Name:
        <input type="text" name="clientName" value={formData.clientName || ''} readOnly />
      </label>

      <label>
        Concerned Person:
        <input type="text" name="concernedPerson" value={formData.concernedPerson || ''} readOnly />
      </label>

      <label>
        Designer:
        <input type="text" name="designer" value={formData.designer || 'SYMBIOSIS / NK / TEJAS'} readOnly />
      </label>

      <label>
        Pack Size:
        <input type="text" name="packSize" value={formData.packSize || ''} readOnly />
      </label>


      {/* INNER Section */}
      <h3>INNER</h3>
      <label>
        Order Qty:
        <input type="number" name="innerOrderQty" value={formData.innerOrderQty || ''} onChange={handleChange} />
      </label>
      <label>
        Received:
        <input type="text" name="innerSize" value={formData.innerSize || ''} onChange={handleChange} />
      </label>
      <label>
      Short / Excess:
        <input type="text" name="innerPrinter" value={formData.innerPrinter || ''} onChange={handleChange} />
      </label>

      {/* OUTER Section */}
      <h3>OUTER</h3>
      <label>
        Order Qty:
        <input type="number" name="outerOrderQty" value={formData.outerOrderQty || ''} onChange={handleChange} />
      </label>
      <label>
        Received:
        <input type="text" name="outerSize" value={formData.outerSize || ''} onChange={handleChange} />
      </label>
      <label>
      Short / Excess:
        <input type="text" name="outerPrinter" value={formData.outerPrinter || ''} onChange={handleChange} />
      </label>

      {/* FOIL / TUBE Section */}
      <h3>FOIL / TUBE</h3>
    
      <label>
        Order Qty:
        <input type="number" name="foilTubeOrderQty" value={formData.foilTubeOrderQty || ''} onChange={handleChange} />
      </label>
      <label>
        Received:
        <input type="text" name="foilTubeSize" value={formData.foilTubeSize || ''} onChange={handleChange} />
      </label>
      <label>
      Short / Excess:
        <input type="text" name="foilTubePrinter" value={formData.foilTubePrinter || ''} onChange={handleChange} />
      </label>

      {/* ADDITIONAL Section */}
      <h3>ADDITIONAL (IF ANY)</h3>
      <label>
        Order Qty:
        <input type="number" name="additionalOrderQty" value={formData.additionalOrderQty || ''} onChange={handleChange} />
      </label>
      <label>
        Received:
        <input type="text" name="additionalSize" value={formData.additionalSize || ''} onChange={handleChange} />
      </label>
      <label>
      Short / Excess:
        <input type="text" name="additionalPrinter" value={formData.additionalPrinter || ''} onChange={handleChange} />
      </label>
    </div>
  );
};

export default Stage4;
