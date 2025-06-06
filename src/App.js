import React from "react";
import TaskTable from "./components/TaskTable";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.jpeg';

function App() {
  return (
    <div className="container py-4">
      {/* Bố cục hàng đầu tiên gồm logo bên trái và tiêu đề bên phải */}
      <div className="d-flex align-items-center justify-content-between mb-4" style={{ position: "relative", minHeight: 120 }}>
  <img src={logo} alt="Trung tâm Y tế Hải Lăng" height={120} style={{ zIndex: 1 }} />
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
      zIndex: 0
    }}
  >
    LỊCH CÔNG TÁC TUẦN
  </h1>
</div>
      </div>

      {/* Bảng công việc */}
      <TaskTable />
    </div>
  );
}

export default App;
