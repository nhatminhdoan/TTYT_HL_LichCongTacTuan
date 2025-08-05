import React from "react";
import TaskTable from "./components/TaskTable";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.jpeg';

function App() {
  return (
    <div className="container py-4">
      {/* Header: căn theo chiều ngang bảng */}
      <div className="mb-4 w-100" style={{maxWidth: 1000, margin: "0 auto"}}>
        <div className="row align-items-center" style={{ minHeight: 130 }}>
          {/* Logo bên trái, to hơn */}
          <div className="col-auto">
            <img src={logo} alt="Logo" height={120} style={{display: "block"}} />
          </div>
          {/* Tiêu đề căn giữa */}
          <div className="col text-center">
            <h1 className="text-danger m-0" style={{ fontSize: "2.7rem" }}>
              LỊCH CÔNG TÁC TUẦN
            </h1>
          </div>
          {/* Cột trống để cân đối tiêu đề */}
          <div className="col-auto"></div>
        </div>
      </div>

      {/* Bảng công việc */}
      <div style={{maxWidth: 1000, margin: "0 auto"}}>
        <TaskTable />
      </div>
    </div>
  );
}

export default App;
