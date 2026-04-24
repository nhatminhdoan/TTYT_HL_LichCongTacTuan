import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function LoginModal({ show, onHide, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Đăng nhập
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
        onHide();
      } else {
        // Đăng ký
        await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
        onHide();
      }
    } catch (error) {
      let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Tài khoản không tồn tại.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email đã được sử dụng.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu (ít nhất 6 ký tự).';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton style={{
        background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
        color: "#fff",
        borderBottom: "none"
      }}>
        <Modal.Title style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ padding: "25px" }}>
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
              Email
            </Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                padding: "12px 16px"
              }}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "600", color: "#2c3e50" }}>
              Mật khẩu
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                padding: "12px 16px"
              }}
            />
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
                border: "none",
                fontWeight: "500"
              }}
            >
              {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </Button>
          </div>
        </Form>
        
        <div className="text-center mt-3">
          <Button
            variant="link"
            onClick={toggleMode}
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default LoginModal;

