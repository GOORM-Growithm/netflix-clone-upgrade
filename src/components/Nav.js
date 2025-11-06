import React, { useState, useEffect,useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Nav.css";
import useOnClickOutside from "../hooks/useOnClickOutside";
import axios from "../api/axios"; 

export default function Nav() {
  const [show, setShow] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  
  //state와 ref 선언
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef(null);

 // TMDB API에서 장르 목록을 가져옴
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      console.log("window.scrollY", window.scrollY);
      if (window.scrollY > 50) {
        setShow(true);
      } else {
        setShow(false);
      }
    });

    return () => {
      window.removeEventListener("scroll", () => {});
    };
  }, []);

  //장르 목록을 API에서 불러오는 useEffect
  useEffect(() => {
    async function fetchGenres() {
      try {
        // api/axios.js에 설정된 baseURL과 api_key, language를 사용해 요청
        const request = await axios.get("/genre/movie/list");
        setGenres(request.data.genres);
        console.log("Fetched Genres:", request.data.genres); // (확인용)
      } catch (error) {
        console.log("error fetching genres", error);
      }
    }
    fetchGenres();
  }, []);

    // 검색 입력 시
  const handleChange = (e) => {
    setSearchValue(e.target.value);
    navigate(`/search?q=${e.target.value}`);
  };

// 드롭다운 외부 클릭 시 닫기
  useOnClickOutside(dropdownRef, () => setShowCategories(false));

  // 카테고리 목록
  /*const categories = [
    { name: "NETFLIX ORIGINALS", id: "NO" },
    { name: "Trending Now", id: "TN" },
    { name: "Top Rated", id: "TR" },
    { name: "Action Movies", id: "AM" },
    { name: "Comedy Movies", id: "CM" },
    { name: "아시아 드라마", id: "AD" },
    { name: "SF & 판타지", id: "SF" },
    { name: "호러", id: "HO" },
    { name: "로맨스", id: "RO" },
    { name: "애니", id: "AN" },
  ];
*/


return (
    <nav className={`nav ${show && "nav__black"} `}>
      {/* 왼쪽 영역: 로고 + 카테고리 */}
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
             {genres.map((genre) => ( 
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
          )}
        </div>
      </div>
      {/* 오른쪽 영역: 검색창 + 프로필 */}
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

