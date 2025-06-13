import React from 'react';
import CreatableSelect from "react-select/creatable";

const Stage6 = ({ formData, handleChange, handleBrandChange, handleBrandCreate, brands, amount}) => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Complete List</h2>

    <table className="w-full table-auto border-collapse border border-gray-300">
      <tbody>
        <tr className="border">
          <td className="border p-2 font-semibold">Type with Brand Name *</td>
          <td className="border p-2">
            <CreatableSelect
                        options={brands}
                        value={
                          brands.find((option) => option.value === formData.brandName) || {
                            label: formData.brandName,
                            value: formData.brandName,
                          }
                        }
                        onChange={handleBrandChange}
                        onCreateOption={handleBrandCreate}
                        isSearchable
                        placeholder="Search or enter brand"
                      />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">PO Date</td>
          <td className="border p-2">
            <input
              type="date"
              name="date"
              value={formData.date ? formData.date.substring(0, 10) : ""}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Brand Name</td>
          <td className="border p-2">
            <input
              type="text"
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Composition</td>
          <td className="border p-2">
            <input
              type="text"
              name="composition"
              value={formData.composition}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Pack Size</td>
          <td className="border p-2">
            <input
              type="text"
              name="packSize"
              value={formData.packSize}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Qty</td>
          <td className="border p-2">
            <input
              type="number"
              name="qty"
              value={formData.qty}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Rate</td>
          <td className="border p-2">
            <input
              type="number"
              step="0.01"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Amount</td>
          <td className="border p-2">
            <input
              type="number"
              step="0.01"
              name="amount"
              value={amount}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">MRP</td>
          <td className="border p-2">
            <input
              type="number"
              step="0.01"
              name="mrp"
              value={formData.mrp}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Client Name</td>
          <td className="border p-2">
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Product Type</td>
          <td className="border p-2">
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
        <tr>
          <td className="border p-2 font-semibold">Concerned Person</td>
          <td className="border p-2">
            <input
              type="text"
              name="concernedPerson"
              value={formData.concernedPerson}
              onChange={handleChange}
              className="w-full border p-1"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <h2 className="text-xl font-bold mt-6 mb-2">Dispatch Details</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="block">
        <span className="block font-semibold mb-1">Dispatch Date</span>
        <input
          type="date"
          name="dispatchDate"
          value={formData.dispatchDate}
          onChange={handleChange}
          className="w-full border p-2"
        />
      </label>
      <label className="block">
        <span className="block font-semibold mb-1">Quantity Dispatched</span>
        <input
          type="number"
          name="dispatchQty"
          value={formData.dispatchQty}
          onChange={handleChange}
          className="w-full border p-2"
        />
      </label>
      <label className="block">
        <span className="block font-semibold mb-1">Shipper</span>
        <input
          type="text"
          name="shipper"
          value={formData.shipper}
          onChange={handleChange}
          className="w-full border p-2"
        />
      </label>
    </div>
  </div>
);

export default Stage6;
