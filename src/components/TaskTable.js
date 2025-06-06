import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaPlus, FaArrowDown } from 'react-icons/fa';

function TaskTable() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : {};
  });

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [newTask, setNewTask] = useState({ id: null, date: '', content: '', dept: '', location: '', note: '' });

  useEffect(() => {
    let interval;
    if (scrolling) {
      interval = setInterval(() => {
        const div = document.getElementById("task-table-scroll");
        if (div) {
          div.scrollBy({ top: 1, behavior: 'smooth' });
          if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            div.scrollTo({ top: 0 });
          }
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [scrolling]);

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

  const filteredTasks = Object.values(tasks).flat().filter(task => {
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
    const key = formatDateVN(new Date(newTask.date));
    const updatedDayTasks = tasks[key] ? [...tasks[key]] : [];

    if (newTask.id) {
      const index = updatedDayTasks.findIndex(t => t.id === newTask.id);
      if (index > -1) updatedDayTasks[index] = newTask;
    } else {
      updatedDayTasks.push({ ...newTask, id: Date.now() });
    }

    const updatedTasks = { ...tasks, [key]: updatedDayTasks };
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setShow(false);
    setNewTask({ id: null, date: '', content: '', dept: '', location: '', note: '' });
  };

  const handleDelete = (id) => {
    const updated = { ...tasks };
    for (const key in updated) {
      updated[key] = updated[key].filter(t => t.id !== id);
      // Xoá ngày nếu không còn công việc
      if (updated[key].length === 0) {
        delete updated[key];
      }
    }
    setTasks(updated);
    localStorage.setItem("tasks", JSON.stringify(updated));
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
            <td colSpan={showActions ? 6 : 5} className="bg-light">
              <div className="border-start border-4 border-primary ps-2 py-2 fw-bold text-primary bg-info-subtle">
                {formatDateFull(date)}
              </div>
            </td>
          </tr>

          {tasksByDate.map(task => (
            <tr key={task.id}>
              <td style={{ width: '160px' }}>{formatDateFull(task.date)}</td>
              <td style={{ width: '320px' }}>{task.content}</td>
              <td style={{ width: '160px' }}>{task.dept}</td>
              <td style={{ width: '160px' }}>{task.location}</td>
              <td style={{ width: '160px' }}>{task.note}</td>
              {showActions && (
                <td style={{ width: '140px' }} className="text-nowrap">
                  <Button variant="warning" size="sm" className="me-1" onClick={() => { setNewTask(task); setShow(true); }}>Sửa</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(task.id)}>Xoá</Button>
                </td>
              )}
            </tr>
          ))}

          <tr>
            <td colSpan={showActions ? 6 : 5} className="text-end fst-italic text-secondary">
              Tổng: {tasksByDate.length} công việc
            </td>
          </tr>
        </React.Fragment>
      );
    });

    return rows;
  };

  return (
    <div>
      <div className="d-flex justify-content-start align-items-center gap-3 mb-4">
        {/* Logo bạn có thể thêm nếu muốn */}
        {/* <img src={logo} alt="Logo" style={{ height: '50px' }} className="me-3" /> */}
        {/* <h5 className="mb-0">Trung tâm y tế Hải Lăng</h5> */}
      </div>

      <div className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap">
        <Button variant="outline-primary" className="rounded-circle shadow" onClick={() => handleChange(-1)}>
          <FaChevronLeft />
        </Button>
        <div className="fw-bold fs-5 text-dark">
          {formatDateVN(start)} - {formatDateVN(end)}
        </div>
        <Button variant="outline-primary" className="rounded-circle shadow" onClick={() => handleChange(1)}>
          <FaChevronRight />
        </Button>
        <Button variant="success" className="rounded-circle shadow" onClick={() => setShow(true)}>
          <FaPlus />
        </Button>
        <Button variant="info" className="rounded-circle shadow" onClick={() => setScrolling(!scrolling)}>
          <FaArrowDown />
        </Button>
        <Button variant={showActions ? "secondary" : "outline-secondary"} className="shadow" onClick={() => setShowActions(!showActions)}>
          {showActions ? "Ẩn" : "Hiện"}
        </Button>
      </div>

      {/* Table với header cố định */}
      <div id="task-table-scroll" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table className="table table-bordered" style={{ minWidth: '900px' }}>
          <thead className="bg-white" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            <tr>
              <th style={{ width: '160px' }}>Thời gian</th>
              <th style={{ width: '320px' }}>Nội dung</th>
              <th style={{ width: '160px' }}>Người thực hiện</th>
              <th style={{ width: '160px' }}>Địa điểm</th>
              <th style={{ width: '160px' }}>Ghi chú</th>
              {showActions && <th style={{ width: '140px' }}>Hành động</th>}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      {/* Modal thêm / sửa công việc */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{newTask.id ? 'Cập nhật công việc' : 'Thêm công việc'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Ngày</Form.Label>
              <Form.Control
                type="date"
                value={newTask.date}
                onChange={e => setNewTask({ ...newTask, date: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTask.content}
                onChange={e => setNewTask({ ...newTask, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Người thực hiện</Form.Label>
              <Form.Control
                value={newTask.dept}
                onChange={e => setNewTask({ ...newTask, dept: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Địa điểm</Form.Label>
              <Form.Control
                value={newTask.location}
                onChange={e => setNewTask({ ...newTask, location: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                value={newTask.note}
                onChange={e => setNewTask({ ...newTask, note: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Huỷ</Button>
          <Button variant="primary" onClick={handleSave}>Lưu</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TaskTable;
