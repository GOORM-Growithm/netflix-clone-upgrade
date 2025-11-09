import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Nav.css";
import axios from "../api/axios";
import useOnClickOutside from "../hooks/useOnClickOutside";

export default function Nav() {
  const [show, setShow] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // 현재 카테고리 이름 추출
  const currentCategoryName = (() => {
    const pathParts = location.pathname.split("/");
    // 경로: /category/:genreId/:genreName
    if (pathParts[1] === "category" && pathParts[3]) {
      // decodeURIComponent로 한글 디코딩
      return decodeURIComponent(pathParts[3]);
    }
    return null;
  })();

  // 네비 색상 전환
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

  /* 검색 입력 처리 */
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // 입력값이 없을 경우엔 검색 페이지로 이동하지 않음
    if (value.trim() === "") return;

    // 현재 페이지가 카테고리인지 판단
    const isInCategory = location.pathname.startsWith("/category/");
    if (isInCategory) {
      // 현재 경로: /category/:genreId/:genreName
      const [, , genreId, genreName] = location.pathname.split("/");
      navigate(
        `/category/${genreId}/${genreName}?q=${encodeURIComponent(value)}`
      );
    } else {
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <nav className={`nav ${show && "nav__black"}`}>
      <img
        alt="Netflix logo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/170px-Netflix_2015_logo.svg.png"
        className="nav__logo"
        onClick={() => (window.location.href = "/")}
      />
      <div className="nav__category-box">
        <div className="nav__category-container" ref={dropdownRef}>
          <button
            className="nav__category-button"
            onClick={() => setShowCategories(!showCategories)}
          >
            {currentCategoryName ? `${currentCategoryName} ▾` : "카테고리 ▾"}
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

        <input
          value={searchValue}
          onChange={handleChange}
          className="nav__input"
          type="text"
          placeholder="영화를 검색해주세요."
        />
      </div>

      <img
        alt="User logged"
        src="https://occ-0-4796-988.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABbme8JMz4rEKFJhtzpOKWFJ_6qX-0y5wwWyYvBhWS0VKFLa289dZ5zvRBggmFVWVPL2AAYE8xevD4jjLZjWumNo.png?r=a41"
        className="nav__avatar"
      />
    </nav>
  );
}
