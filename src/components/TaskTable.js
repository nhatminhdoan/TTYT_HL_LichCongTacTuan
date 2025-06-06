import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaPlus, FaArrowDown } from 'react-icons/fa';

import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [show, setShow] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [newTask, setNewTask] = useState({ id: null, date: '', content: '', dept: '', location: '', note: '' });

  const scrollRef = useRef(null);

  // Auto-scroll with infinite loop effect
  useEffect(() => {
    let interval;
    if (scrolling) {
      interval = setInterval(() => {
        const div = scrollRef.current;
        if (div) {
          if (div.scrollTop + div.clientHeight >= div.scrollHeight - 1) {
            div.scrollTop = 0; // Reset to top when reaching bottom
          } else {
            div.scrollTop += 1; // Scroll down
          }
        }
      }, 60); // Adjust speed here
    }
    return () => clearInterval(interval);
  }, [scrolling]);

  // Realtime listener lấy tasks từ Firestore
  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("date", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(data);
    });
    return () => unsubscribe();
  }, []);

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

  // Lọc tasks hiển thị theo tuần
  const filteredTasks = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return taskDate >= start && taskDate <= end;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleChange = (delta) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + delta * 7);
    setCurrentWeek(newWeek);
  };

  // Thêm/sửa task lên Firestore
  const handleSave = async () => {
    if (!newTask.date || !newTask.content.trim()) {
      alert("Vui lòng nhập ngày và nội dung công việc.");
      return;
    }
    try {
      if (newTask.id) {
        // Sửa công việc cũ
        const ref = doc(db, "tasks", newTask.id);
        await updateDoc(ref, {
          ...newTask
        });
      } else {
        // Thêm công việc mới
        await addDoc(collection(db, "tasks"), newTask);
      }
      setShow(false);
      setNewTask({ id: null, date: '', content: '', dept: '', location: '', note: '' });
    } catch (err) {
      alert("Có lỗi xảy ra khi lưu dữ liệu!");
      console.error(err);
    }
  };

  // Xoá task khỏi Firestore
  const handleDelete = async (id) => {
    try {
      const ref = doc(db, "tasks", id);
      await deleteDoc(ref);
    } catch (err) {
      alert("Có lỗi khi xoá!");
      console.error(err);
    }
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
            <td colSpan={showActions ? 6 : 5} className="bg-light" style={{padding: '8px 14px'}}>
              <div className="border-start border-4 border-primary ps-2 py-2 fw-bold text-primary bg-info-subtle fs-6">
                {formatDateFull(date)}
              </div>
            </td>
          </tr>
          {tasksByDate.map(task => (
            <tr key={task.id}>
              <td style={{ minWidth: 120 }}>{formatDateFull(task.date)}</td>
              <td style={{ minWidth: 180 }}>{task.content}</td>
              <td style={{ minWidth: 120 }}>{task.dept}</td>
              <td style={{ minWidth: 120 }}>{task.location}</td>
              <td style={{ minWidth: 120 }}>{task.note}</td>
              {showActions && (
                <td style={{ minWidth: 100 }} className="text-nowrap">
                  <Button variant="warning" size="sm" className="me-1"
                    onClick={() => { setNewTask(task); setShow(true); }}>Sửa</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(task.id)}>Xoá</Button>
                </td>
              )}
            </tr>
          ))}
          <tr>
            <td colSpan={showActions ? 6 : 5} className="text-end fst-italic text-secondary" style={{background:'#f9f9f9'}}>
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
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap">
        <Button variant="outline-primary" className="rounded-circle shadow-sm" onClick={() => handleChange(-1)}>
          <FaChevronLeft />
        </Button>
        <div className="fw-bold fs-5 text-dark">
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
          width: '100%',
          maxWidth: '100vw',
          margin: '0 auto',
          boxShadow: '0 2px 8px #0001',
          borderRadius: 10,
          background: '#fff'
        }}
      >
        <table className="table table-bordered mb-0" style={{ minWidth: 900, fontSize: 15 }}>
          <thead className="bg-white" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            <tr>
              <th style={{ minWidth: 120 }}>Thời gian</th>
              <th style={{ minWidth: 180 }}>Nội dung</th>
              <th style={{ minWidth: 120 }}>Người thực hiện</th>
              <th style={{ minWidth: 120 }}>Địa điểm</th>
              <th style={{ minWidth: 120 }}>Ghi chú</th>
              {showActions && <th style={{ minWidth: 100 }}>Hành động</th>}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      {/* Modal thêm/sửa công việc */}
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