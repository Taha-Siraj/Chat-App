import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, onSnapshot, query, orderBy, getFirestore, where } from 'firebase/firestore';
import Header from './Header';

export default function UserList() {
  return (
    <>
     <Header/>
    </>
  );
}
