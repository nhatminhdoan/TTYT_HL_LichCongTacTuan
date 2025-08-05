import React from "react";
import TaskTable from "./components/TaskTable";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.jpeg';

function App() {
  return (
    <div className="container py-4">
      {/* Header: Logo bên trái, tiêu đề ở giữa, ngang hàng */}
      <div className="mb-4 w-100">
        <div className="row align-items-center" style={{ minHeight: 100 }}>
          {/* Logo bên trái */}
          <div className="col-auto">
            <img src={logo} alt="Logo" height={80} />
          </div>
          {/* Tiêu đề căn giữa */}
          <div className="col text-center">
            <h1 className="text-danger m-0" style={{ fontSize: "2.5rem" }}>
              LỊCH CÔNG TÁC TUẦN
            </h1>
          </div>
          {/* Cột trống để căn giữa tiêu đề nếu muốn cân đối hai bên */}
          <div className="col-auto"></div>
        </div>
      </div>

      {/* Bảng công việc */}
      <TaskTable />
    </div>
  );
}

export default App;
