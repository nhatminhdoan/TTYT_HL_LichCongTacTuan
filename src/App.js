import React from "react";
import TaskTable from "./components/TaskTable";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.jpeg';

function App() {
  return (
    <div className="container py-4">
      {/* Header: Logo và tiêu đề căn giữa */}
      <div className="mb-4 text-center">
        <img
          src={logo}
          alt="Trung tâm Y tế Hải Lăng"
          height={120}
          style={{ display: "block", marginLeft: "auto", marginRight: "auto" }}
        />
        <h1 className="text-danger mt-3" style={{ fontSize: "3rem" }}>
          LỊCH CÔNG TÁC TUẦN
        </h1>
      </div>

      {/* Bảng công việc */}
      <TaskTable />
    </div>
  );
}

export default App;
