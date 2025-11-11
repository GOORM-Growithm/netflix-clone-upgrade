import React from "react";
import { HashRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import DetailPage from "./pages/DetailPage";
import MainPage from "./pages/MainPage";
import SearchPage from "./pages/SearchPage";
import CategoryPage from "./pages/CategoryPage/CategoryPage";

const Layout = () => {
  return (
    <div>
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} />
            <Route path=":movieId" element={<DetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="category/:genreId/:genreName" element={<CategoryPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
