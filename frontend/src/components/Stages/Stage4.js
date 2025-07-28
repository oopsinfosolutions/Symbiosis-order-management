import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import { Download, X } from 'lucide-react';

const Stage4 = ({ formData, handleChange }) => {
  const [showArtwork, setShowArtwork] = useState(false);
  const [printerOptions, setPrinterOptions] = useState([]);

  console.log(formData)

useEffect(() => {
  axios.get("http://192.168.0.91:5000/api/printers")
    .then((res) => {
      const options = res.data.map((p) => ({ label: p.name, value: p.name }));
      setPrinterOptions(options);
    })
    .catch((err) => console.error("Failed to fetch printers:", err));
}, []);


  const handleViewArtwork = () => {
    if (formData.attachApprovedArtwork) {
      setShowArtwork(true);
    } else {
      alert('No artwork file available.');
    }
  };

  const handleCloseModal = () => setShowArtwork(false);

  const handleDownload = async () => {
    try {
      const fileUrl = `http://192.168.0.91:5000/uploads/${formData.attachApprovedArtwork}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = formData.attachApprovedArtwork;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderSection = (title, statusField, quantityField, receivedField, printerField) => (
    <div className="mt-8">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="border p-2">Show Status</th>
            <th className="border p-2">Order Qty</th>
            <th className="border p-2">Size</th>
            <th className="border p-2">Printer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">
              <input
                type="text"
                name={`${statusField}`}
                value={formData[`${statusField}`]}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </td>
            <td className="border p-2">
              <input
                type="number"
                name={`${quantityField}`}
                value={formData[`${quantityField}`]}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </td>
            <td className="border p-2">
              <input
                type="text"
                name={`${receivedField}`}
                value={formData[`${receivedField}`]}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </td>
           <td className="border p-2">
  
<CreatableSelect
  isClearable
  options={printerOptions}
  value={
    formData[`${printerField}`]
      ? { label: formData[`${printerField}`], value: formData[`${printerField}`] }
      : null
  }
  onChange={(selectedOption) => {
    handleChange({
      target: {
        name: `${printerField}`,
        value: selectedOption ? selectedOption.value : '',
      },
    });
  }}
  onCreateOption={async (inputValue) => {
    try {
      await axios.post('http://192.168.0.91:5000/api/printers/add', { name: inputValue });
      const newOption = { label: inputValue, value: inputValue };
      setPrinterOptions((prev) => [...prev, newOption]);
      handleChange({
        target: {
          name: `${printerField}`,
          value: inputValue,
        },
      });
    } catch (error) {
      console.error('Failed to add printer:', error);
      alert('Error adding new printer.');
    }
  }}
  placeholder="Select or create printer"
/>

</td>


          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Packing Material Order Form</h2>

      <table className="w-full border border-gray-300">
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
            <td className="border p-2 font-medium">View Artwork</td>
            <td className="border p-2">
              <button
                type="button"
                onClick={handleViewArtwork}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                View Artwork
              </button>
            </td>
          </tr>
          <tr>
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
            <td className="border p-2 font-medium">PO Date</td>
            <td className="border p-2">
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

      {/* Artwork Modal */}
      {showArtwork && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-xl relative max-w-2xl">
            <img
              src={`http://192.168.0.91:5000/uploads/${formData.attachApprovedArtwork}`}
              alt="Artwork Preview"
              className="w-full h-auto rounded"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={handleCloseModal}
                className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {renderSection("INNER","innerPacking", "innerOrder", "innersize", "innerPrinter")}
      {renderSection("OUTER", "OuterPacking", "outerOrder", "outersize", "outerPrinter")}
      {renderSection("FOIL / TUBE", "foilTube", "foilTubeOrder", "foilsize", "foilTubePrinter")}
      {renderSection("ADDITIONAL (IF ANY)", "additional", "additionalOrder", "additionalsize", "additionalPrinter")}

    </div>
  );
};

export default Stage4;
