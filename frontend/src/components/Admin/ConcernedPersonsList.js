import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import './ConcernedPersonsList.css';
import Nav from "./Nav";

const ConcernedPersonsList = () => {
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const res = await axios.get("http://192.168.0.60:5000/api/concerned-persons");
        setPersons(res.data);
      } catch (error) {
        console.error("Failed to fetch concerned persons:", error);
      }
    };
    fetchPersons();
  }, []);

  const openModal = (person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPerson(null);
    setIsModalOpen(false);
  };

  return (
   <div className="layout-container">
      <div className="sidebar-container">
        <Nav/>
      </div>
      <div className="form-section">
      <h1>Concerned Persons</h1>
      <ol type="1">
        {persons.map((person, index) => (
          <li
            key={index}
            className="person-item"
            onClick={() => openModal(person)}
          >
            {person.concernedPerson}
          </li>
        ))}
      </ol>

      {isModalOpen && selectedPerson && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="modal"
          overlayClassName="overlay"
        >
          <h2>Details of {selectedPerson.concernedPerson}</h2>
          <p><strong>Inner Packing:</strong> {selectedPerson.innerPacking || "N/A"}</p>
          <p><strong>Outer Packing:</strong> {selectedPerson.OuterPacking || "N/A"}</p>
          <p><strong>Foil Tube:</strong> {selectedPerson.foilTube || "N/A"}</p>
          <p><strong>Additional Notes:</strong> {selectedPerson.additional || "N/A"}</p>
          <p><strong>Product Status:</strong> {selectedPerson.productStatus}</p>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}
    </div>
   </div>
  );
};

export default ConcernedPersonsList;
