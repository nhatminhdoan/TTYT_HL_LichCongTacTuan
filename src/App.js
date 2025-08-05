import React from "react";
import TaskTable from "./components/TaskTable";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.jpeg';

function App() {
  return (
    <div className="container py-4">
      {/* Container chính căn giữa */}
      <div className="d-flex flex-column align-items-center" style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        {/* Logo ở góc trái */}
        <img 
          src={logo} 
          alt="Logo" 
          height={120} 
          style={{ 
            position: "absolute", 
            top: -10, 
            left: -200 
          }} 
        />

        {/* Tiêu đề */}
        <div className="mb-4 w-100">
          <h1 className="text-danger m-0 text-center" style={{ fontSize: "2.7rem" }}>
            LỊCH CÔNG TÁC TUẦN
          </h1>
        </div>

        {/* Bảng công việc */}
        <TaskTable />
      </div>
    </div>
  );
}

export default App;
