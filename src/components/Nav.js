import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Nav.css";
import axios from "../api/axios";
import useOnClickOutside from "../hooks/useOnClickOutside";

export default function Nav() {
  const [show, setShow] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // 스크롤 시 nav 색상 변경
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setShow(true);
      else setShow(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 장르 API 호출
  useEffect(() => {
    async function fetchGenres() {
      try {
        const request = await axios.get("/genre/movie/list?language=ko-KR");
        setGenres(request.data.genres);
      } catch (error) {
        console.log("error fetching genres", error);
      }
    }
    fetchGenres();
  }, []);

  // 외부 클릭 시 닫기
  useOnClickOutside(dropdownRef, () => setShowCategories(false));

  const handleChange = (e) => {
    setSearchValue(e.target.value);
    navigate(`/search?q=${e.target.value}`);
  };

  return (
    <nav className={`nav ${show && "nav__black"}`}>
      <div className="nav__left">
        <img
          alt="Netflix logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/170px-Netflix_2015_logo.svg.png"
          className="nav__logo"
          onClick={() => (window.location.href = "/")}
        />

        {/* 카테고리 드롭다운 */}
        <div className="nav__category-container" ref={dropdownRef}>
          <button
            className="nav__category-button"
            onClick={() => setShowCategories(!showCategories)}
          >
            카테고리 ▾
          </button>

          {showCategories && (
            <div className="nav__category-dropdown">
              {(() => {
                const columns = [[], [], []];
                genres.forEach((genre, index) => {
                  columns[index % 3].push(genre);
                });
                return columns.map((col, colIndex) => (
                  <div className="nav__category-column" key={colIndex}>
                    {col.map((genre) => (
                      <Link
                        key={genre.id}
                        to={`/category/${genre.id}/${genre.name}`}
                        className="nav__category-item"
                        onClick={() => setShowCategories(false)}
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽 검색창 및 아바타 */}
      <div className="nav__right">
        <input
          value={searchValue}
          onChange={handleChange}
          className="nav__input"
          type="text"
          placeholder="영화를 검색해주세요."
        />
        <img
          alt="User logged"
          src="https://occ-0-4796-988.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABbme8JMz4rEKFJhtzpOKWFJ_6qX-0y5wwWyYvBhWS0VKFLa289dZ5zvRBggmFVWVPL2AAYE8xevD4jjLZjWumNo.png?r=a41"
          className="nav__avatar"
        />
      </div>
    </nav>
  );
}
