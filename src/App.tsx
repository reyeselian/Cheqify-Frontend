import Home from "./pages/Home";
import { Container } from "react-bootstrap";
import Header from "./components/Header";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <UserProvider>
      {/* 🔹 Navbar premium con lógica de sesión */}
      <Header />

      {/* 🔹 Contenedor principal */}
      <Container className="mt-5 pt-4">
        <Home />
      </Container>
    </UserProvider>
  );
}
