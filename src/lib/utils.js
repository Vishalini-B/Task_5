import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INITIAL_DATA = {
  transactions: [],
  bills: [],
  budget: { monthlyLimit: 2000 },
  notificationSettings: {
    billAlerts: true,
    budgetWarnings: true,
    largeTransactionAlerts: false,
    largeTransactionThreshold: 5000,
  },
  profile: {
    displayName: '',
    photoURL: '',
    email: ''
  },
  notifications: []
};

export function useFinanceData(userId) {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setData(INITIAL_DATA);
      setLoading(false);
      return;
    }

    setLoading(true);

    const userDocRef = doc(db, 'users', userId);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setData(prev => ({
          ...prev,
          budget: { monthlyLimit: userData.monthlyLimit || 2000 },
          notificationSettings: userData.notificationSettings || INITIAL_DATA.notificationSettings,
          profile: {
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || '',
            email: userData.email || ''
          }
        }));
      } else {
        setDoc(userDocRef, {
          uid: userId,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          photoURL: auth.currentUser?.photoURL || '',
          monthlyLimit: 2000,
          role: 'client',
          notificationSettings: INITIAL_DATA.notificationSettings
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${userId}`));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${userId}`));

    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const transactionsQuery = query(transactionsRef, orderBy('date', 'desc'));
    const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(prev => ({ ...prev, transactions }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/transactions`));

    const billsRef = collection(db, 'users', userId, 'bills');
    const unsubBills = onSnapshot(billsRef, (snapshot) => {
      const bills = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(prev => ({ ...prev, bills }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/bills`));

    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const notificationsQuery = query(notificationsRef, orderBy('date', 'desc'));
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(prev => ({ ...prev, notifications }));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/notifications`));

    return () => {
      unsubUser();
      unsubTransactions();
      unsubBills();
      unsubNotifications();
    };
  }, [userId]);

  const addNotification = async (notification) => {
    if (!userId) return;
    const path = `users/${userId}/notifications`;
    try {
      await addDoc(collection(db, path), {
        ...notification,
        date: new Date().toISOString(),
        isRead: false,
        uid: userId
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const markNotificationAsRead = async (id) => {
    if (!userId) return;
    const path = `users/${userId}/notifications/${id}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'notifications', id), {
        isRead: true
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteNotification = async (id) => {
    if (!userId) return;
    const path = `users/${userId}/notifications/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'notifications', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addTransaction = async (transaction) => {
    if (!userId) return;
    const path = `users/${userId}/transactions`;
    try {
      await addDoc(collection(db, path), {
        ...transaction,
        uid: userId
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const deleteTransaction = async (id) => {
    if (!userId) return;
    const path = `users/${userId}/transactions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'transactions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addBill = async (bill) => {
    if (!userId) return;
    const path = `users/${userId}/bills`;
    try {
      await addDoc(collection(db, path), {
        ...bill,
        isPaid: false,
        uid: userId
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const toggleBillPaid = async (id) => {
    if (!userId) return;
    const bill = data.bills.find(b => b.id === id);
    if (!bill) return;
    const path = `users/${userId}/bills/${id}`;
    try {
      await updateDoc(doc(db, 'users', userId, 'bills', id), {
        isPaid: !bill.isPaid
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteBill = async (id) => {
    if (!userId) return;
    const path = `users/${userId}/bills/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'bills', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const updateBudget = async (limit) => {
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        monthlyLimit: limit
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const updateNotificationSettings = async (settings) => {
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        notificationSettings: {
          ...data.notificationSettings,
          ...settings
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return {
    data,
    loading,
    addTransaction,
    deleteTransaction,
    addBill,
    toggleBillPaid,
    deleteBill,
    updateBudget,
    updateNotificationSettings,
    markNotificationAsRead,
    deleteNotification,
  };
}

// utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
