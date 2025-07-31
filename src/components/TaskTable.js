import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaPlus, FaArrowDown } from 'react-icons/fa';

// Thêm Google Fonts cho Quicksand vào head nếu chưa có
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
  const [show, setShow] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [newTask, setNewTask] = useState({ id: null, date: '', content: '', dept: '', location: '' });
  const scrollRef = useRef(null);

  useEffect(() => {
    const data = localStorage.getItem("tasks");
    if (data) setTasks(JSON.parse(data));
  }, []);

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

  const saveTasksToLocal = (newTasks) => {
    localStorage.setItem("tasks", JSON.stringify(newTasks));
    setTasks(newTasks);
  };

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

  const formatDateFull = (str) => new Date(str).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const formatDateVN = (date) => new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const [start, end] = getWeekRange(currentWeek);

  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= start && taskDate <= end;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleChange = (delta) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + delta * 7);
    setCurrentWeek(newWeek);
  };

  const handleSave = () => {
    if (!newTask.date || !newTask.content.trim()) {
      alert("Vui lòng nhập ngày và nội dung công việc.");
      return;
    }
    let updatedTasks;
    if (newTask.id) {
      updatedTasks = tasks.map(task => task.id === newTask.id ? newTask : task);
    } else {
      updatedTasks = [...tasks, { ...newTask, id: Date.now().toString() }];
    }
    saveTasksToLocal(updatedTasks);
    setShow(false);
    setNewTask({ id: null, date: '', content: '', dept: '', location: '' });
  };

  const handleDelete = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasksToLocal(updatedTasks);
  };

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
            <td colSpan={showActions ? 5 : 4} style={{
              padding: '12px 16px',
              fontWeight: 800,
              fontSize: 28,
              color: '#fff',
              background: 'linear-gradient(90deg,#1cb5e0 0%,#000851 100%)',
              fontFamily: "'Quicksand', Arial, sans-serif"
            }}>
              {formatDateFull(date)}
            </td>
          </tr>
          {tasksByDate.map(task => (
            <tr key={task.id}>
              <td style={{ minWidth: 140, fontSize: 22 }}>{formatDateFull(task.date)}</td>
              <td style={{ minWidth: 260, fontSize: 22 }}>{task.content}</td>
              <td style={{ minWidth: 160, fontSize: 22 }}>{task.dept}</td>
              <td style={{ minWidth: 160, fontSize: 22 }}>{task.location}</td>
              {showActions && (
                <td style={{ minWidth: 120 }} className="text-nowrap">
                  <Button variant="warning" size="sm" className="me-1"
                    onClick={() => { setNewTask(task); setShow(true); }}>Sửa</Button>
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
      // Nếu muốn nền cho toàn bộ trang thì dùng tại đây, nếu chỉ muốn nền cho bảng thì chuyển xuống style của table bên dưới
      backgroundImage: 'url("/your-image-path.jpg")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    }}>
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap" style={{ fontSize: 26 }}>
        <Button variant="outline-primary" className="rounded-circle shadow-sm" onClick={() => handleChange(-1)}>
          <FaChevronLeft />
        </Button>
        <div className="fw-bold fs-4 text-dark">
          {formatDateVN(start)} - {formatDateVN(end)}
        </div>
        <Button variant="outline-primary" className="rounded-circle shadow-sm" onClick={() => handleChange(1)}>
          <FaChevronRight />
        </Button>
        <Button variant="success" className="rounded-circle shadow-sm" onClick={() => setShow(true)}>
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
          maxHeight: '65vh',
          overflowY: 'auto',
          overflowX: 'auto',
          width: '100vw',
          borderRadius: 20,
          fontFamily: "'Quicksand', Arial, sans-serif",
          fontSize: 22,
          border: '2px solid #1cb5e0',
          boxShadow: '0 2px 20px #b6d0e2',
          background: 'transparent' // Để nền bảng trong suốt, nhìn thấy background image phía sau
        }}
      >
        <table className="table table-bordered mb-0"
          style={{
            minWidth: 1100,
            fontSize: 22,
            width: '100%',
            margin: 0,
            borderCollapse: 'collapse',
            background: 'rgba(255,255,255,0.82)', // Nền trắng mờ cho bảng, tạo cảm giác nổi trên nền hình
            backdropFilter: 'blur(2px)'
          }}
        >
          <thead style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'linear-gradient(90deg,#1cb5e0 0%,#000851 100%)',
            color: '#fff', fontSize: 24
          }}>
            <tr>
              <th style={{ minWidth: 140 }}>Thời gian</th>
              <th style={{ minWidth: 260 }}>Nội dung</th>
              <th style={{ minWidth: 160 }}>Người thực hiện</th>
              <th style={{ minWidth: 160 }}>Địa điểm</th>
              {showActions && <th style={{ minWidth: 120 }}>Hành động</th>}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      {/* Modal thêm/sửa công việc */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "'Quicksand', Arial, sans-serif", fontSize: 26 }}>
            {newTask.id ? 'Cập nhật công việc' : 'Thêm công việc'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 20 }}>Ngày</Form.Label>
              <Form.Control
                type="date"
                value={newTask.date}
                style={{ fontSize: 20 }}
                onChange={e => setNewTask({ ...newTask, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 20 }}>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTask.content}
                style={{ fontSize: 20 }}
                onChange={e => setNewTask({ ...newTask, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 20 }}>Người thực hiện</Form.Label>
              <Form.Control
                value={newTask.dept}
                style={{ fontSize: 20 }}
                onChange={e => setNewTask({ ...newTask, dept: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: 20 }}>Địa điểm</Form.Label>
              <Form.Control
                value={newTask.location}
                style={{ fontSize: 20 }}
                onChange={e => setNewTask({ ...newTask, location: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)} style={{ fontSize: 20 }}>Huỷ</Button>
          <Button variant="primary" onClick={handleSave} style={{ fontSize: 20 }}>Lưu</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TaskTable;
