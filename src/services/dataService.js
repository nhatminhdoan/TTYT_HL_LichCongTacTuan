import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

// Lưu tasks cho user
export const saveTasks = async (userId, tasks) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'tasks'), {
      tasks: tasks,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu tasks:', error);
    throw error;
  }
};

// Lấy tasks của user
export const getTasks = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'tasks');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().tasks || [];
    }
    return [];
  } catch (error) {
    console.error('Lỗi khi lấy tasks:', error);
    throw error;
  }
};

// Lưu ghi chú tuần cho user
export const saveWeekNotes = async (userId, weekNotes) => {
  try {
    await setDoc(doc(db, 'users', userId, 'data', 'weekNotes'), {
      notes: weekNotes,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu ghi chú:', error);
    throw error;
  }
};

// Lấy ghi chú tuần của user
export const getWeekNotes = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'weekNotes');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().notes || {};
    }
    return {};
  } catch (error) {
    console.error('Lỗi khi lấy ghi chú:', error);
    throw error;
  }
};

// Lưu thông tin user
export const saveUserInfo = async (userId, userInfo) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userInfo,
      updatedAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu thông tin user:', error);
    throw error;
  }
};

// Lấy thông tin user
export const getUserInfo = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    throw error;
  }
};

