import React from "react";
import TaskTable from "./components/TaskTable";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.jpeg';

function App() {
  return (
    <div className="container py-4">
      {/* Header: Logo bên trái, tiêu đề căn giữa màn hình */}
      <div
        className="mb-4"
        style={{
          position: "relative",
          minHeight: 120,
          display: "flex",
          alignItems: "center"
        }}
      >
        {/* Logo ở bên trái, không đổi */}
        <img
          src={logo}
          alt="Trung tâm Y tế Hải Lăng"
          height={120}
          style={{ zIndex: 1 }}
        />
        {/* Tiêu đề căn giữa tuyệt đối */}
        <h1
          className="text-danger"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            margin: 0,
            width: "100%",
            textAlign: "center",
            zIndex: 0,
            pointerEvents: "none", // tránh chặn click vào logo
            userSelect: "none"
          }}
        >
          LỊCH CÔNG TÁC TUẦN
        </h1>
      </div>

      {/* Bảng công việc */}
      <TaskTable />
    </div>
  );
}

export default App;
