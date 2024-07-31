// auth.js
import { auth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export const register = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
