import React from 'react';

const Stage5 = ({ formData, handleChange }) => {
  // Helper to calculate Short/Excess
  const calculateShortExcess = (orderQty, received) => {
    const qty = parseInt(orderQty) || 0;
    const rec = parseInt(received) || 0;
    return qty - rec;
  };

  // Helper rows
  const renderSectionRow = (label, qtyKey, receivedKey) => (
  <tr key={label}>
    <td className="border px-4 py-2 font-semibold">{label}</td>

    <td className="border px-4 py-2">
      <input 
        type="number"
        name={qtyKey}
        value={formData[qtyKey] || 0}
        onChange={handleChange}
        className="w-full px-2 py-1 border rounded"
      />
    </td>

    {/* Received input */}
    <td className="border px-4 py-2">
      <input
        type="number"
        name={receivedKey}
        value={formData[receivedKey]}
        onChange={handleChange}
        className="w-full px-2 py-1 border rounded"
      />
    </td>

    {/* Short / Excess live calculated */}
    <td className="border px-4 py-2 text-center">
      {calculateShortExcess(formData[qtyKey], formData[receivedKey])}
    </td>
  </tr>
);


  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full border border-gray-300 mb-4">
        <tbody>
          <tr>
            <td className="border p-2 font-medium">Brand Name</td>
            <td className="border p-2">{formData.brandName}</td>
            <td className="border p-2 font-medium">Client Name</td>
            <td className="border p-2">{formData.clientName}</td>
          </tr>
          <tr>
            <td className="border p-2 font-medium">Concerned Person</td>
            <td className="border p-2">{formData.concernedPerson}</td>
            <td className="border p-2 font-medium">Designer</td>
            <td className="border p-2">{formData.designer}</td>
          </tr>
          <tr>
            <td className="border p-2 font-medium">Pack Size</td>
            <td className="border p-2">{formData.packSize}</td>
            <td className="border p-2 font-medium">PO Number</td>
            <td className="border p-2">
              <input
                type="text"
                name="poNumber"
                value={formData.poNumber}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-medium">PO Date</td>
            <td className="border p-2" colSpan={3}>
              <input
                type="date"
                name="poDate"
                value={formData.poDate ? formData.poDate.substring(0, 10) : ""}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-bold mb-4">Packing Material Receipt Details</h2>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Section</th>
            <th className="border px-4 py-2">Order Qty</th>
            <th className="border px-4 py-2">Received</th>
            <th className="border px-4 py-2">Short / Excess</th>
          </tr>
        </thead>
        <tbody>
          {renderSectionRow('INNER', 'innerOrder', 'innerReceived')}
          {renderSectionRow('OUTER', 'outerOrder', 'outerReceived')}
          {renderSectionRow('FOIL / TUBE', 'foilTubeOrder', 'foilTubeReceived')}
          {renderSectionRow('ADDITIONAL', 'additionalOrder', 'additionalReceived')}
        </tbody>
      </table>
    </div>
  );
};

export default Stage5;
