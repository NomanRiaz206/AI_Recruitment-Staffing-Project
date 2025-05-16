import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import EmployerDashboard from './EmployerDashboard';
import CandidateDashboard from './CandidateDashboard';
import AdminDashboard from './AdminDashboard';
import Navbar from '../layout/Navbar';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  console.log(user);

  return (
    // <>
    //   <Navbar />
    //   {user?.isEmployer ? <EmployerDashboard /> : <CandidateDashboard />}
    // </>
    <>
    <Navbar />
      {user?.isAdmin ? (
        <AdminDashboard /> 
      ) : user?.isEmployer ? (
        <EmployerDashboard />  
      ) : (
        <CandidateDashboard />  
      )}
    </>

  );
};

export default Dashboard; 