import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaPlus, FaArrowDown } from 'react-icons/fa';

// Nạp font Quicksand Google
if (!document.getElementById('font-quicksand')) {
  const link = document.createElement('link');
  link.id = 'font-quicksand';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap';
  document.head.appendChild(link);
}

function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [editTask, setEditTask] = useState({ id: null, date: '', content: '', dept: '', location: '' });
  const scrollRef = useRef(null);

  // Load tasks from localStorage
  useEffect(() => {
    const data = localStorage.getItem("tasks");
    if (data) setTasks(JSON.parse(data));
  }, []);

  // Auto-scroll cho bảng thông báo
  useEffect(() => {
    let interval;
    if (scrolling) {
      interval = setInterval(() => {
        const div = scrollRef.current;
        if (div) {
          if (div.scrollTop + div.clientHeight >= div.scrollHeight - 1) {
            div.scrollTop = 0;
          } else {
            div.scrollTop += 2;
          }
        }
      }, 40);
    }
    return () => clearInterval(interval);
  }, [scrolling]);

  // Lưu tasks
  const saveTasks = (newTasks) => {
    localStorage.setItem("tasks", JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  // Lấy khoảng tuần
  const getWeekRange = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  };

  // Format ngày
  const formatDateFull = (str) => new Date(str).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });
  const formatDateVN = (date) => new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const [start, end] = getWeekRange(currentWeek);

  // Lọc tasks trong tuần
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= start && taskDate <= end;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Chuyển tuần
  const handleChangeWeek = (delta) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + delta * 7);
    setCurrentWeek(newWeek);
  };

  // Lưu task
  const handleSave = () => {
    if (!editTask.date || !editTask.content.trim()) {
      alert("Vui lòng nhập ngày và nội dung công việc.");
      return;
    }
    let updatedTasks;
    if (editTask.id) {
      updatedTasks = tasks.map(task => task.id === editTask.id ? editTask : task);
    } else {
      updatedTasks = [...tasks, { ...editTask, id: Date.now().toString() }];
    }
    saveTasks(updatedTasks);
    setShowModal(false);
    setEditTask({ id: null, date: '', content: '', dept: '', location: '' });
  };

  // Xoá task
  const handleDelete = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
  };

  // Render rows
  const renderRows = () => {
    const grouped = filteredTasks.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      acc[task.date].push(task);
      return acc;
    }, {});
    let rows = [];
    Object.entries(grouped).forEach(([date, tasksByDate]) => {
      rows.push(
        <React.Fragment key={`group-${date}`}>
          <tr className="date-divider-row">
            <td colSpan={showActions ? 5 : 4} className="date-divider-cell text-center">
              {formatDateFull(date)}
            </td>
          </tr>
          {tasksByDate.map(task => (
            <tr key={task.id}>
              <td>{formatDateFull(task.date)}</td>
              <td>{task.content}</td>
              <td>{task.dept}</td>
              <td>{task.location}</td>
              {showActions && (
                <td>
                  <Button variant="warning" size="sm" className="me-1"
                    onClick={() => { setEditTask(task); setShowModal(true); }}>Sửa</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(task.id)}>Xoá</Button>
                </td>
              )}
            </tr>
          ))}
        </React.Fragment>
      );
    });
    return rows;
  };

  return (
    <div style={{
      fontFamily: "'Quicksand', Arial, sans-serif",
      minHeight: '100vh',
      padding: 0,
      margin: 0,
      background: 'none'
    }}>
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap" style={{ fontSize: 22 }}>
        <Button variant="outline-primary" className="rounded-circle shadow-sm" onClick={() => handleChangeWeek(-1)}>
          <FaChevronLeft />
        </Button>
        <div className="fw-bold fs-4 text-dark">
          {formatDateVN(start)} - {formatDateVN(end)}
        </div>
        <Button variant="outline-primary" className="rounded-circle shadow-sm" onClick={() => handleChangeWeek(1)}>
          <FaChevronRight />
        </Button>
        <Button variant="success" className="rounded-circle shadow-sm" onClick={() => setShowModal(true)}>
          <FaPlus />
        </Button>
        <Button variant="info" className="rounded-circle shadow-sm" onClick={() => setScrolling(!scrolling)}>
          <FaArrowDown />
        </Button>
        <Button variant={showActions ? "secondary" : "outline-secondary"} className="shadow-sm"
          onClick={() => setShowActions(!showActions)}>
          {showActions ? "Ẩn" : "Hiện"}
        </Button>
      </div>
      <div
        ref={scrollRef}
        id="task-table-scroll"
        style={{
          width: '100vw',
          minWidth: '100vw',
          maxWidth: '100vw',
          margin: 0,
          padding: 0,
          borderRadius: 0,
          border: '2px solid #1cb5e0',
          boxShadow: 'none',
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'auto',
          background: 'none'
        }}
      >
        <table className="table table-bordered mb-0"
          style={{
            width: '100%',
            minWidth: 700,
            fontSize: 18,
            margin: 0,
            borderCollapse: 'collapse',
            background: 'transparent'
          }}
        >
          <thead style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'linear-gradient(90deg,#1cb5e0 0%,#000851 100%)',
            color: '#fff', fontSize: 20
          }}>
            <tr>
              <th style={{ minWidth: 120 }}>Thời gian</th>
              <th style={{ minWidth: 380 }}>Nội dung</th>
              <th style={{ minWidth: 180 }}>Người thực hiện</th>
              <th style={{ minWidth: 180 }}>Địa điểm</th>
              {showActions && <th style={{ minWidth: 150 }}>Hành động</th>}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
      {/* Modal thêm/sửa công việc */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "'Quicksand', Arial, sans-serif", fontSize: 22 }}>
            {editTask.id ? 'Cập nhật công việc' : 'Thêm công việc'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ngày</Form.Label>
              <Form.Control
                type="date"
                value={editTask.date}
                onChange={e => setEditTask({ ...editTask, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={editTask.content}
                onChange={e => setEditTask({ ...editTask, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Người thực hiện</Form.Label>
              <Form.Control
                value={editTask.dept}
                onChange={e => setEditTask({ ...editTask, dept: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa điểm</Form.Label>
              <Form.Control
                value={editTask.location}
                onChange={e => setEditTask({ ...editTask, location: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Huỷ</Button>
          <Button variant="primary" onClick={handleSave}>Lưu</Button>
        </Modal.Footer>
      </Modal>
      <style>{`
        @media (max-width: 1100px) {
          #task-table-scroll {
            max-width: 100vw !important;
            min-width: 100vw !important;
            width: 100vw !important;
          }
        }
        @media (max-width: 700px) {
          #task-table-scroll, .table {
            font-size: 15px !important;
            min-width: 700px !important;
          }
          .date-divider-cell {
            font-size: 19px !important;
            padding: 8px 5px !important;
          }
          .table th, .table td {
            padding: 8px 5px !important;
          }
        }
        .date-divider-cell {
          padding: 10px 16px;
          font-weight: 800;
          font-size: 23px;
          color: #fff;
          background: linear-gradient(90deg,#43cea2 0%,#185a9d 100%);
          font-family: 'Quicksand', Arial, sans-serif;
          text-align: center !important;
        }
        body, #root {
          padding: 0 !important;
          margin: 0 !important;
          background: none !important;
        }
      `}</style>
    </div>
  );
}

export default TaskTable;
