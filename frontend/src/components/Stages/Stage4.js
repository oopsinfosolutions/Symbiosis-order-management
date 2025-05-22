import React from 'react';
import { useState } from 'react';

const Stage4 = ({ formData, handleChange }) => {
    console.log(formData)
    
    const [showArtwork, setShowArtwork] = useState(false);

    const handleViewArtwork = () => {
        console.log(formData.attachApprovedArtwork)
      if (formData.attachApprovedArtwork) {
        setShowArtwork(true);
      } else {
        alert('No artwork file available.');
      }
    };
  
    const handleCloseModal = () => {
      setShowArtwork(false);
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
        <input type="text" name="designer" value={formData.designer} readOnly />
      </label>

      <label>
        Pack Size:
        <input type="text" name="packSize" value={formData.packSize || ''} readOnly />
      </label>

      {/* View Artwork */}
      <label>
        View Artwork:
        <button
        type="button"
        onClick={handleViewArtwork}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        View Artwork
      </button>

      {/* Modal */}
      {showArtwork && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                      <div className="bg-white p-4 rounded shadow-xl relative">
                          <img
                              src={`http://localhost:5000/uploads/${formData.attachApprovedArtwork}`} 
                              alt="Artwork Preview"
                              className="max-w-full max-h-[80vh] rounded"
                          />
                          <button
                              onClick={handleCloseModal}
                              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
              Close
            </button>
          </div>
        </div>
    )}
      </label>

      {/* PO Details */}
      <label>
        PO Number:
        <input type="text" name="poNumber" value={formData.poNumber} onChange={handleChange} />
      </label>

      <label>
        PO Date:
        <input type="date" name="poDate" value={formData.poDate} onChange={handleChange} />
      </label>

      {/* INNER Section
      <h3>INNER</h3>
      <label>
        Show Status:
        <input type="text" name="innerStatus" value={formData.innerStatus} />
      </label>
      <label>
        Order Qty:
        <input type="number" name="innerOrderQty" value={formData.innerOrderQty} onChange={handleChange} />
      </label>
      <label>
        Size:
        <input type="text" name="innerSize" value={formData.innerSize} onChange={handleChange} />
      </label>
      <label>
        Printer:
        <input type="text" name="innerPrinter" value={formData.innerPrinter || ''} onChange={handleChange} />
      </label> */}

      {/* INNER Section */}
      <div className="inner-style">

<h3 className="text-lg font-semibold mt-6">INNER</h3>
  <label className="flex flex-col">
    Show Status:
    <input
      type="text"
      name="innerStatus"
      value={formData.innerStatus}
      onChange={handleChange}
      className="border px-3 py-1 rounded"
    />
  </label>

  <label className="flex flex-col">
    Order Qty:
    <input
      type="number"
      name="innerOrderQty"
      value={formData.innerOrderQty}
      onChange={handleChange}
      className="border px-3 py-1 rounded"
    />
  </label>

  <label className="flex flex-col">
    Size:
    <input
      type="text"
      name="innerSize"
      value={formData.innerSize}
      onChange={handleChange}
      className="border px-3 py-1 rounded"
    />
  </label>

  <label className="flex flex-col">
    Printer:
    <input
      type="text"
      name="innerPrinter"
      value={formData.innerPrinter}
      onChange={handleChange}
      className="border px-3 py-1 rounded"
    />
  </label>
</div>


      {/* OUTER Section */}
      <h3>OUTER</h3>
      <label>
        Show Status:
        <input type="text" name="outerStatus" value={formData.outerStatus} />
      </label>
      <label>
        Order Qty:
        <input type="number" name="outerOrderQty" value={formData.outerOrderQty} onChange={handleChange} />
      </label>
      <label>
        Size:
        <input type="text" name="outerSize" value={formData.outerSize} onChange={handleChange} />
      </label>
      <label>
        Printer:
        <input type="text" name="outerPrinter" value={formData.outerPrinter} onChange={handleChange} />
      </label>

      {/* FOIL / TUBE Section */}
      <h3>FOIL / TUBE</h3>
      <label>
        Show Status:
        <input type="text" name="foilTubeStatus" value={formData.foilTubeStatus} />
      </label>
      <label>
        Order Qty:
        <input type="number" name="foilTubeOrderQty" value={formData.foilTubeOrderQty} onChange={handleChange} />
      </label>
      <label>
        Size:
        <input type="text" name="foilTubeSize" value={formData.foilTubeSize} onChange={handleChange} />
      </label>
      <label>
        Printer:
        <input type="text" name="foilTubePrinter" value={formData.foilTubePrinter} onChange={handleChange} />
      </label>

      {/* ADDITIONAL Section */}
      <h3>ADDITIONAL (IF ANY)</h3>
      <label>
        Show Status:
        <input type="text" name="additionalStatus" value={formData.additionalStatus} />
      </label>
      <label>
        Order Qty:
        <input type="number" name="additionalOrderQty" value={formData.additionalOrderQty} onChange={handleChange} />
      </label>
      <label>
        Size:
        <input type="text" name="additionalSize" value={formData.additionalSize} onChange={handleChange} />
      </label>
      <label>
        Printer:
        <input type="text" name="additionalPrinter" value={formData.additionalPrinter} onChange={handleChange} />
      </label>
    </div>
  );
};

export default Stage4;
