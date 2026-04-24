import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaPlus, FaArrowDown, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { saveTasks, getTasks, saveWeekNotes, getWeekNotes } from '../services/dataService';
import LoginModal from './LoginModal';
import FirebaseTest from './FirebaseTest';

// ...existing code...

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

// Format giờ dạng "8h30p - 10h0p"
function formatTimeRange(startTime, endTime) {
  const fmt = (t) => {
    if (!t || typeof t !== 'string' || !t.includes(':')) return null;
    const [hh, mm] = t.split(':');
    const H = parseInt(hh, 10);
    const M = parseInt(mm, 10);
    return `${H}h${M}p`;
  };
  const s = fmt(startTime);
  const e = fmt(endTime);
  if (s && e) return `${s} - ${e}`;
  if (s) return s;
  if (e) return e;
  return '';
}

function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [editTask, setEditTask] = useState({
    id: null,
    date: '',
    session: '',
    startTime: '',
    endTime: '',
    content: '',
    dept: '',
    location: ''
  });
  const [weekNotes, setWeekNotes] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setLoading(true);
        try {
          const [tasksData, notesData] = await Promise.all([
            getTasks(u.uid),
            getWeekNotes(u.uid)
          ]);
          setTasks(Array.isArray(tasksData) ? tasksData : []);
          setWeekNotes(notesData && typeof notesData === 'object' ? notesData : {});
        } catch (error) {
          console.error('Lỗi khi load dữ liệu từ Firestore:', error);
          // fallback localStorage
          try {
            const localTasks = localStorage.getItem("tasks");
            const localNotes = localStorage.getItem("weekNotes");
            if (localTasks) {
              const parsed = JSON.parse(localTasks);
              setTasks(Array.isArray(parsed) ? parsed : []);
            } else setTasks([]);
            if (localNotes) {
              const parsed = JSON.parse(localNotes);
              setWeekNotes(parsed && typeof parsed === 'object' ? parsed : {});
            } else setWeekNotes({});
          } catch (e) {
            console.error('Lỗi khi load từ localStorage:', e);
            setTasks([]);
            setWeekNotes({});
          }
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setTasks([]);
        setWeekNotes({});
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Tự động lưu ghi chú
  useEffect(() => {
    if (Object.keys(weekNotes).length === 0) return;
    if (user) {
      saveWeekNotes(user.uid, weekNotes).catch(err => {
        console.error('Lỗi lưu ghi chú Firestore:', err);
        try {
          localStorage.setItem("weekNotes", JSON.stringify(weekNotes));
        } catch (e) {
          console.error('Lỗi lưu ghi chú localStorage:', e);
        }
      });
    } else {
      try {
        localStorage.setItem("weekNotes", JSON.stringify(weekNotes));
      } catch (e) {
        console.error('Lỗi lưu ghi chú localStorage:', e);
      }
    }
  }, [weekNotes, user]);

  // Auto-scroll
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

  // Save tasks (Firestore or local)
  const saveTasksToFirestore = async (newTasks) => {
    const safeTasks = Array.isArray(newTasks) ? newTasks : [];
    if (user) {
      try {
        await saveTasks(user.uid, safeTasks);
        setTasks(safeTasks);
      } catch (error) {
        console.error('Lỗi khi lưu tasks vào Firestore:', error);
        try {
          localStorage.setItem("tasks", JSON.stringify(safeTasks));
          setTasks(safeTasks);
          alert('Lưu tạm vào localStorage do lỗi Firestore.');
        } catch (e) {
          console.error('Lỗi lưu vào localStorage:', e);
          alert('Không thể lưu dữ liệu. Vui lòng thử lại.');
        }
      }
    } else {
      try {
        localStorage.setItem("tasks", JSON.stringify(safeTasks));
        setTasks(safeTasks);
      } catch (e) {
        console.error('Lỗi lưu vào localStorage:', e);
        alert('Không thể lưu dữ liệu. Vui lòng thử lại.');
      }
    }
  };

  // Week helpers
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
  const getWeekKey = (startDate) => startDate.toISOString().split('T')[0];

  const [start, end] = getWeekRange(currentWeek);
  const currentWeekKey = getWeekKey(start);

  // Filter tasks in week
  const filteredTasks = Array.isArray(tasks)
    ? tasks.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      }).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const handleChangeWeek = (delta) => {
    const nw = new Date(currentWeek);
    nw.setDate(nw.getDate() + delta * 7);
    setCurrentWeek(nw);
  };

  // Save single task (validate)
  const handleSave = () => {
    if (!editTask.date || !editTask.session || !editTask.content.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin công việc (ngày, buổi, nội dung).");
      return;
    }
    // If one of start/end provided, require both
    const hasStart = !!editTask.startTime;
    const hasEnd = !!editTask.endTime;
    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      alert("Vui lòng nhập cả giờ bắt đầu và giờ kết thúc, hoặc bỏ cả hai.");
      return;
    }
    let updated = Array.isArray(tasks) ? tasks.slice() : [];
    if (editTask.id) {
      updated = updated.map(t => t.id === editTask.id ? { ...t, ...editTask } : t);
    } else {
      updated = [...updated, { ...editTask, id: Date.now().toString() }];
    }
    saveTasksToFirestore(updated);
    setShowModal(false);
    setEditTask({ id: null, date: '', session: '', startTime: '', endTime: '', content: '', dept: '', location: '' });
  };

  const handleDelete = (id) => {
    const updated = Array.isArray(tasks) ? tasks.filter(t => t.id !== id) : [];
    saveTasksToFirestore(updated);
  };

  // Render rows grouped by date
  const renderRows = () => {
    const grouped = filteredTasks.reduce((acc, task) => {
      const key = task.date || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
    const rows = [];
    Object.entries(grouped).forEach(([date, tasksByDate]) => {
      rows.push(
        <React.Fragment key={`group-${date}`}>
          <tr className="date-divider-row">
            <td colSpan={showActions ? 5 : 4} className="date-divider-cell text-center">
              {formatDateVN(date)} ({getVietnameseDay(date)})
            </td>
          </tr>
          {tasksByDate.map(task => {
            const timeLabel = formatTimeRange(task.startTime, task.endTime);
            const displayTime = timeLabel ? `${task.session} - ${timeLabel}` : task.session;
            return (
              <tr key={task.id}>
                <td>{displayTime}</td>
                <td>{task.content}</td>
                <td>{task.dept}</td>
                <td>{task.location}</td>
                {showActions && (
                  <td>
                    <Button variant="warning" size="sm" className="me-1"
                      onClick={() => { setEditTask({
                        id: task.id || null,
                        date: task.date || '',
                        session: task.session || '',
                        startTime: task.startTime || '',
                        endTime: task.endTime || '',
                        content: task.content || '',
                        dept: task.dept || '',
                        location: task.location || ''
                      }); setShowModal(true); }}>Sửa</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(task.id)}>Xoá</Button>
                  </td>
                )}
              </tr>
            );
          })}
        </React.Fragment>
      );
    });
    return rows;
  };

  // Loading
  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', fontFamily: "'Times New Roman', Times, serif", fontSize: '18px', color: '#666'
      }}>
        Đang tải...
      </div>
    );
  }

  // Not logged in view
  if (!user) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100vh', fontFamily: "'Times New Roman', Times, serif",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
      }}>
        <div style={{
          textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', maxWidth: '500px', marginBottom: '20px'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Lịch Công Tác Tuần</h2>
          <p style={{ color: '#6c757d', marginBottom: '30px' }}>Vui lòng đăng nhập để sử dụng ứng dụng</p>
          <Button variant="primary" size="lg" onClick={() => setShowLogin(true)}
            style={{ background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)", border: "none", padding: "12px 30px" }}>
            <FaUser style={{ marginRight: "8px" }} /> Đăng nhập
          </Button>
        </div>
        {/* Component test Firebase hidden if breaks UI */}
        <LoginModal show={showLogin} onHide={() => setShowLogin(false)} onLoginSuccess={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", minHeight: '100vh', padding: 0, margin: 0, background: 'none' }}>
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap" style={{ fontSize: 22 }}>
        <Button variant="outline-primary" className="rounded-circle shadow-sm" onClick={() => handleChangeWeek(-1)}>
          <FaChevronLeft />
        </Button>
        <div className="fw-bold fs-4 text-dark">{formatDateVN(start)} - {formatDateVN(end)}</div>
        <Button variant="outline-primary" className="rounded-circle shadow-sm" onClick={() => handleChangeWeek(1)}>
          <FaChevronRight />
        </Button>
        <Button variant="success" className="rounded-circle shadow-sm" onClick={() => { setEditTask({ id: null, date: '', session: '', startTime: '', endTime: '', content: '', dept: '', location: '' }); setShowModal(true); }}>
          <FaPlus />
        </Button>
        <Button variant="info" className="rounded-circle shadow-sm" onClick={() => setScrolling(!scrolling)}>
          <FaArrowDown />
        </Button>
        <Button variant={showActions ? "secondary" : "outline-secondary"} className="shadow-sm" onClick={() => setShowActions(!showActions)}>
          {showActions ? "Ẩn" : "Hiện"}
        </Button>
        <Button variant={showNotes ? "warning" : "outline-warning"} className="shadow-sm" onClick={() => setShowNotes(!showNotes)}>
          {showNotes ? "Ẩn ghi chú" : "Ghi chú"}
        </Button>
        {/* {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#fff", fontSize: "14px" }}>Xin chào, {user.email}</span>
            <Button variant="outline-light" size="sm" onClick={() => signOut(auth)} style={{ padding: "6px 12px" }}>
              <FaSignOutAlt style={{ marginRight: "4px" }} /> Đăng xuất
            </Button>
          </div>
        ) : (
          <Button variant="outline-light" size="sm" onClick={() => setShowLogin(true)} style={{ padding: "6px 12px" }}>
            <FaUser style={{ marginRight: "4px" }} /> Đăng nhập
          </Button>
        )} */}
        {/* Test Firebase removed to avoid UI issues */}
      </div>

      <div ref={scrollRef} id="task-table-scroll" style={{
        width: '100vw', minWidth: '100vw', maxWidth: '100vw', margin: 0, padding: 0, borderRadius: 0,
        border: '2px solid #1cb5e0', boxShadow: 'none', position: 'relative', overflowX: 'auto',
        overflowY: 'hidden', background: 'none', maxHeight: showNotes ? '550px' : '600px', transition: 'max-height 0.3s ease'
      }}>
        <table className="table table-bordered mb-0" style={{ width: '100%', minWidth: 700, fontSize: 33, margin: 0, borderCollapse: 'collapse', background: 'transparent' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 100, background: 'linear-gradient(90deg,#1cb5e0 0%,#000851 100%)', color: '#fff', fontSize: 33 }}>
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

      {showNotes && (
        <div style={{ margin: "15px auto 0 auto", padding: "15px 20px", background: "#f8f9fa", borderRadius: "6px", maxWidth: "800px", border: "1px solid #dee2e6" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #007bff", paddingBottom: "8px" }}>
            <div style={{ width: "24px", height: "24px", background: "#007bff", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", marginRight: "10px" }}>📝</div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#212529" }}>Ghi chú tuần: {formatDateVN(start)} - {formatDateVN(end)}</div>
          </div>
          <textarea value={weekNotes[currentWeekKey] || ""} onChange={e => { const newNotes = { ...weekNotes }; newNotes[currentWeekKey] = e.target.value; setWeekNotes(newNotes); }} style={{
            outline: "none", padding: "10px 12px", minHeight: "32px", maxHeight: "60px", borderRadius: "4px", background: "#fff",
            border: "1px solid #ced4da", fontSize: "14px", fontFamily: "'Times New Roman', Times, serif", lineHeight: "1.3", color: "#495057", transition: "border-color 0.2s ease", overflowY: "auto", resize: "none", width: "100%", boxSizing: "border-box"
          }} onFocus={e => { e.target.style.border = "2px solid #007bff"; }} onBlur={e => { e.target.style.border = "1px solid #ced4da"; }} placeholder="Nhập ghi chú cho tuần này..." />
        </div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: 22 }}>{editTask.id ? 'Cập nhật công việc' : 'Thêm công việc'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Ngày</Form.Label>
              <Form.Control type="date" value={editTask.date} onChange={e => setEditTask({ ...editTask, date: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Buổi</Form.Label>
              <Form.Select value={editTask.session} onChange={e => setEditTask({ ...editTask, session: e.target.value })}>
                <option value="">Chọn buổi</option>
                <option value="Sáng">Sáng</option>
                <option value="Chiều">Chiều</option>
                <option value="Cả ngày">Cả ngày</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giờ bắt đầu (không bắt buộc)</Form.Label>
              <Form.Control type="time" value={editTask.startTime} onChange={e => setEditTask({ ...editTask, startTime: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giờ kết thúc (không bắt buộc)</Form.Label>
              <Form.Control type="time" value={editTask.endTime} onChange={e => setEditTask({ ...editTask, endTime: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control as="textarea" rows={2} value={editTask.content} onChange={e => setEditTask({ ...editTask, content: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Người thực hiện</Form.Label>
              <Form.Control value={editTask.dept} onChange={e => setEditTask({ ...editTask, dept: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Địa điểm</Form.Label>
              <Form.Control value={editTask.location} onChange={e => setEditTask({ ...editTask, location: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Huỷ</Button>
          <Button variant="primary" onClick={handleSave}>Lưu</Button>
        </Modal.Footer>
      </Modal>

      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} onLoginSuccess={() => { setShowLogin(false); }} />

      <style>{`
        @media (max-width: 1100px) {
          #task-table-scroll { max-width: 100vw !important; min-width: 100vw !important; width: 100vw !important; }
        }
        @media (max-width: 700px) {
          #task-table-scroll, .table { font-size: 15px !important; min-width: 700px !important; }
          .date-divider-cell { font-size: 19px !important; padding: 8px 5px !important; }
          .table th, .table td { padding: 8px 5px !important; }
        }
        .date-divider-cell {
          padding: 10px 16px; font-weight: 800; font-size: 23px; color: #fff;
          background: linear-gradient(90deg,#43cea2 0%,#185a9d 100%); font-family: 'Times New Roman', Times, serif;
          text-align: center !important;
        }
        body, #root { padding: 0 !important; margin: 0 !important; background: none !important; }
      `}</style>
    </div>
  );
}

export default TaskTable;