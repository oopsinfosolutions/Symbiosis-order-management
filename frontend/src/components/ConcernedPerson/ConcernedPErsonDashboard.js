import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';

const ConcernedPersonDashboard = ({ empId }) => {
  const navigate = useNavigate();

  const goToOrders = () => {
    navigate(`/view-orders/${empId}`);
  };

    return (
        <>
            <Header />
            <div>
                <h2>Welcome Concerned Person</h2>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={goToOrders}>
                    View Orders
                </button>
            </div>
        </>
    );
};

export default ConcernedPersonDashboard;
