import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaPlus, FaArrowDown } from 'react-icons/fa';

// Font Times New Roman đã có sẵn trong hệ thống

// Hàm lấy thứ trong tuần bằng tiếng Việt
function getVietnameseDay(dateString) {
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy"
  ];
  try {
    const date = new Date(dateString);
    return days[date.getDay()];
  } catch {
    return "";
  }
}

// Định dạng ngày tháng năm dd/mm/yyyy
function formatDateVN(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch {
    return dateString;
  }
}

function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [editTask, setEditTask] = useState({ id: null, date: '', session: '', time: '', content: '', dept: '', location: '' });
  const [weekNotes, setWeekNotes] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const scrollRef = useRef(null);

  // Load tasks và ghi chú từ localStorage
  useEffect(() => {
    const data = localStorage.getItem("tasks");
    const notes = localStorage.getItem("weekNotes");
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setTasks(parsedData);
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
    }
    try {
      const parsedNotes = JSON.parse(notes);
      if (parsedNotes && typeof parsedNotes === 'object') {
        setWeekNotes(parsedNotes);
      } else {
        setWeekNotes({});
      }
    } catch {
      setWeekNotes({});
    }
  }, []);

  // Tự động lưu ghi chú mỗi lần thay đổi
  useEffect(() => {
    localStorage.setItem("weekNotes", JSON.stringify(weekNotes));
  }, [weekNotes]);

  // Auto-scroll bảng (Đã fix bug)
  useEffect(() => {
    let interval;
    if (scrolling) {
      interval = setInterval(() => {
        const div = scrollRef.current;
        if (div) {
          if (Math.abs(div.scrollTop + div.clientHeight - div.scrollHeight) < 2) {
            div.scrollTop = 0;
          } else {
            div.scrollTop += 2;
          }
        }
      }, 120);
    }
    return () => clearInterval(interval);
  }, [scrolling, tasks]);

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

  // Tạo key cho tuần hiện tại
  const getWeekKey = (startDate) => {
    return startDate.toISOString().split('T')[0];
  };

  const [start, end] = getWeekRange(currentWeek);
  const currentWeekKey = getWeekKey(start);

  // Lọc tasks trong tuần
  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      }).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  // Chuyển tuần
  const handleChangeWeek = (delta) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + delta * 7);
    setCurrentWeek(newWeek);
  };

  // Lưu task
  const handleSave = () => {
    if (!editTask.date || !editTask.session || !editTask.content.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin công việc (ngày, buổi, nội dung).");
      return;
    }
    let updatedTasks = Array.isArray(tasks) ? tasks : [];
    if (editTask.id) {
      updatedTasks = updatedTasks.map(task => task.id === editTask.id ? editTask : task);
    } else {
      updatedTasks = [...updatedTasks, { ...editTask, id: Date.now().toString() }];
    }
    saveTasks(updatedTasks);
    setShowModal(false);
    setEditTask({ id: null, date: '', session: '', time: '', content: '', dept: '', location: '' });
  };

  // Xoá task
  const handleDelete = (id) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
  };

  // Render rows, nhóm theo ngày, hiển thị ngày/thứ
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
              {formatDateVN(date)} ({getVietnameseDay(date)})
            </td>
          </tr>
          {tasksByDate.map(task => (
            <tr key={task.id}>
              <td>{task.time ? `${task.session} - ${task.time}` : task.session}</td>
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
      fontFamily: "'Times New Roman', Times, serif",
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
        <Button variant={showNotes ? "warning" : "outline-warning"} className="shadow-sm"
          onClick={() => setShowNotes(!showNotes)}>
          {showNotes ? "Ẩn ghi chú" : "Ghi chú"}
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
            overflowY: 'hidden',
            background: 'none',
            maxHeight: showNotes ? '550px' : '600px',
            transition: 'max-height 0.3s ease'
          }}
        >
          <table className="table table-bordered mb-0"
            style={{
              width: '100%',
              minWidth: 700,
              fontSize: 33,
              margin: 0,
              borderCollapse: 'collapse',
              background: 'transparent'
            }}
          >
            <thead style={{
              position: 'sticky', top: 0, zIndex: 100,
              background: 'linear-gradient(90deg,#1cb5e0 0%,#000851 100%)',
              color: '#fff', fontSize: 33
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
      {/* Phần ghi chú tuần - gọn gàng */}
      {showNotes && (
        <div
          style={{
            margin: "15px auto 0 auto",
            padding: "15px 20px",
            background: "#f8f9fa",
            borderRadius: "6px",
            maxWidth: "800px",
            border: "1px solid #dee2e6"
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "12px",
            borderBottom: "1px solid #007bff",
            paddingBottom: "8px"
          }}>
            <div style={{
              width: "24px",
              height: "24px",
              background: "#007bff",
              borderRadius: "3px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "12px",
              marginRight: "10px"
            }}>
              📝
            </div>
            <div style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#212529"
            }}>
              Ghi chú tuần: {formatDateVN(start)} - {formatDateVN(end)}
            </div>
          </div>
          
          <textarea
            value={weekNotes[currentWeekKey] || ""}
            onChange={e => {
              const newNotes = { ...weekNotes };
              newNotes[currentWeekKey] = e.target.value;
              setWeekNotes(newNotes);
            }}
            style={{
              outline: "none",
              padding: "10px 12px",
              minHeight: "32px",
              maxHeight: "60px",
              borderRadius: "4px",
              background: "#fff",
              border: "1px solid #ced4da",
              fontSize: "14px",
              fontFamily: "'Times New Roman', Times, serif",
              lineHeight: "1.3",
              color: "#495057",
              transition: "border-color 0.2s ease",
              overflowY: "auto",
              resize: "none",
              width: "100%",
              boxSizing: "border-box"
            }}
            onFocus={e => {
              e.target.style.border = "2px solid #007bff";
            }}
            onBlur={e => {
              e.target.style.border = "1px solid #ced4da";
            }}
            placeholder="Nhập ghi chú cho tuần này..."
          />
        </div>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 22 }}>
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
              <Form.Label>Buổi</Form.Label>
              <Form.Select
                value={editTask.session}
                onChange={e => setEditTask({ ...editTask, session: e.target.value })}
              >
                <option value="">Chọn buổi</option>
                <option value="Sáng">Sáng</option>
                <option value="Chiều">Chiều</option>
                <option value="Cả ngày">Cả ngày</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giờ (không bắt buộc)</Form.Label>
              <Form.Control
                type="time"
                value={editTask.time}
                onChange={e => setEditTask({ ...editTask, time: e.target.value })}
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
          font-family: 'Times New Roman', Times, serif;
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