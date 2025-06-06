import React from "react";
import TaskTable from "./components/TaskTable";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './logo.jpeg';

function App() {
  return (
    <div className="container py-4">
      {/* Bố cục hàng đầu tiên gồm logo bên trái và tiêu đề bên phải */}
      <div className="d-flex align-items-center justify-content-start mb-4 gap-3">
        <img src={logo} alt="Trung tâm Y tế Hải Lăng" height={120} />
        <div>
          <h1 className="text-danger">LỊCH CÔNG TÁC TUẦN</h1>
        </div>
      </div>

      {/* Bảng công việc */}
      <TaskTable />
    </div>
  );
}

export default App;
