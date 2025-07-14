import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import Login from "./pages/Login";
import CustomRoutes from "./pages/CustomRoutes";

const App = () => {

const firebaseConfig = {
  apiKey: "AIzaSyAHj4_L4FlL2aziqd8s-OlOaeApGk4fqTo",
  authDomain: "chat-app-38191.firebaseapp.com",
  projectId: "chat-app-38191",
  storageBucket: "chat-app-38191.firebasestorage.app",
  messagingSenderId: "1087893064178",
  appId: "1:1087893064178:web:3e6cea54d63070624b836b"
};

const app = initializeApp(firebaseConfig);

  return (
    <>
    <CustomRoutes/>
    </>
  );
};

export default App;
