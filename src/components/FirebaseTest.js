import React, { useState } from 'react';
import { Button, Alert, Card } from 'react-bootstrap';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

function FirebaseTest() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testFirestore = async () => {
    setLoading(true);
    setError('');
    setStatus('');

    try {
      // Test 1: Kiểm tra kết nối cơ bản
      setStatus('Đang kiểm tra kết nối Firebase...');
      
      // Test 2: Thử ghi dữ liệu test
      setStatus('Đang thử ghi dữ liệu test...');
      const testDoc = doc(db, 'test', 'connection-test');
      await setDoc(testDoc, {
        message: 'Test connection',
        timestamp: new Date(),
        status: 'success'
      });
      
      // Test 3: Thử đọc dữ liệu
      setStatus('Đang thử đọc dữ liệu...');
      const docSnap = await getDoc(testDoc);
      
      if (docSnap.exists()) {
        setStatus('✅ Kết nối Firebase thành công! Database đã sẵn sàng.');
      } else {
        setStatus('⚠️ Có thể ghi nhưng không đọc được dữ liệu.');
      }
      
    } catch (error) {
      console.error('Firebase test error:', error);
      setError(`Lỗi: ${error.code || error.message}`);
      
      if (error.code === 'permission-denied') {
        setStatus('❌ Lỗi quyền truy cập. Kiểm tra Firestore Rules.');
      } else if (error.code === 'unavailable') {
        setStatus('❌ Firestore không khả dụng. Kiểm tra database đã được tạo chưa.');
      } else if (error.code === 'not-found') {
        setStatus('❌ Database không tồn tại. Hãy tạo Firestore Database trước.');
      } else {
        setStatus('❌ Lỗi không xác định. Kiểm tra cấu hình Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    setError('');
    setStatus('');

    try {
      setStatus('Đang kiểm tra Authentication...');
      
      // Test đăng nhập ẩn danh
      const userCredential = await signInAnonymously(auth);
      setStatus(`✅ Authentication hoạt động! User ID: ${userCredential.user.uid}`);
      
    } catch (error) {
      console.error('Auth test error:', error);
      setError(`Lỗi Auth: ${error.code || error.message}`);
      
      if (error.code === 'auth/configuration-not-found') {
        setStatus('❌ Authentication chưa được bật. Hãy bật Email/Password trong Firebase Console.');
      } else {
        setStatus('❌ Lỗi Authentication không xác định.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearTestData = async () => {
    try {
      const testDoc = doc(db, 'test', 'connection-test');
      await setDoc(testDoc, {});
      setStatus('Đã xóa dữ liệu test.');
    } catch (error) {
      setError(`Lỗi khi xóa: ${error.message}`);
    }
  };

  return (
    <Card style={{ margin: '20px', maxWidth: '600px' }}>
      <Card.Header style={{
        background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
        color: "#fff"
      }}>
        <h5 style={{ margin: 0 }}>🔧 Test Kết Nối Firebase</h5>
      </Card.Header>
      
      <Card.Body>
        <div style={{ marginBottom: '20px' }}>
          <p>Kiểm tra kết nối Firebase trước khi sử dụng ứng dụng:</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <Button 
            variant="primary" 
            onClick={testFirestore}
            disabled={loading}
          >
            {loading ? 'Đang test...' : 'Test Firestore'}
          </Button>
          
          <Button 
            variant="info" 
            onClick={testAuth}
            disabled={loading}
          >
            {loading ? 'Đang test...' : 'Test Auth'}
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={clearTestData}
            disabled={loading}
          >
            Xóa Test Data
          </Button>
        </div>
        
        {status && (
          <Alert variant={status.includes('✅') ? 'success' : status.includes('❌') ? 'danger' : 'info'}>
            {status}
          </Alert>
        )}
        
        {error && (
          <Alert variant="danger">
            <strong>Chi tiết lỗi:</strong><br />
            {error}
          </Alert>
        )}
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <h6>Hướng dẫn khắc phục:</h6>
          <ol>
            <li>Vào <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
            <li>Chọn project: <strong>lichcongtactuan-b1bfc</strong></li>
            <li>Tạo <strong>Firestore Database</strong></li>
            <li>Bật <strong>Authentication</strong> → Email/Password</li>
            <li>Cập nhật <strong>Firestore Rules</strong></li>
          </ol>
        </div>
      </Card.Body>
    </Card>
  );
}

export default FirebaseTest;

