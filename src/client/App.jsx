import React from "react";
import "./styles/index.css";
import { Routes, Route } from "react-router-dom";

//Componentes de prueba
const LoginPage = () => {
  <div>Página de inicio de sesión</div>;
};
const RegisterPage = () => {
  <div>Página de Registro</div>;
};
const HomePage = () => {
  <div>Página de inicio(Dashboard)</div>;
};
const PatientsPage = () => {
  <div>Dashboard de Pacientes</div>;
};
const NotFoundPage = () => {
  <div>404 - Página no encontrada</div>;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
