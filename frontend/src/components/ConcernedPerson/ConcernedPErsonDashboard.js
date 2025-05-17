import React from 'react';
import { useNavigate } from 'react-router-dom';

const ConcernedPersonDashboard = ({ empId }) => {
  const navigate = useNavigate();

  const goToOrders = () => {
    navigate(`/view-orders/${empId}`);
  };

    return (
        <>
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
