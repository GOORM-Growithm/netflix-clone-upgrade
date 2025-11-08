import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../../api/axios";
import "./CategoryPage.css";

export default function CategoryPage() {
  const { genreId, genreName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const searchTerm = query.get("q");

  const [genres, setGenres] = useState([]);

  // Pagination
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedGenre, setSelectedGenre] = useState({
    id: parseInt(genreId),
    name: decodeURIComponent(genreName),
  });



  // 전체 장르 목록을 API로 불러옴
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

  // 선택된 장르가 바뀔 때마다 해당 장르의 영화를 불러옴
  useEffect(() => {
    if (selectedGenre && selectedGenre.id) {
      if (searchTerm) {
        fetchMoviesByGenreAndSearch(selectedGenre.id, searchTerm, currentPage);
      } else {
        fetchMoviesByGenre(selectedGenre.id, currentPage);
      }
    }
  }, [selectedGenre, currentPage, searchTerm]);

  const fetchMoviesByGenre = async (id, pageNum) => {
    try {
      const request = await axios.get(
        `/discover/movie?with_genres=${id}&language=ko-KR&page=${pageNum}`
      );
      setMovies(request.data.results);
      setTotalPages(request.data.total_pages);
    } catch (error) {
      console.log("error", error);
    }
  };

  // 검색 + 장르 필터링 로직
  const fetchMoviesByGenreAndSearch = async (id, term, pageNum) => {
    try {
      const request = await axios.get(
        `/search/movie?query=${term}&language=ko-KR&page=${pageNum}`
      );
      // TMDB는 genre+query 동시 지원 안 하므로 client-side filter 필요
      const filtered = request.data.results.filter((m) =>
        m.genre_ids.includes(parseInt(id))
      );
      setMovies(filtered);
      setTotalPages(request.data.total_pages);
    } catch (error) {
      console.log("error", error);
    }
  };


  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);

    // 현재 검색어 유지 여부 확인
    const currentQuery = new URLSearchParams(location.search);
    const currentSearch = currentQuery.get("q");

    if (currentSearch) {
      // 검색어가 있으면 그대로 다음 장르에도 전달
      navigate(`/category/${genre.id}/${genre.name}?q=${encodeURIComponent(currentSearch)}`);
    } else {
      // 검색어 없으면 기본 이동
      navigate(`/category/${genre.id}/${genre.name}`);
    }
  };

  const handlePageChange = (page) => {
    window.scrollTo(0, 0); // 페이지 변경 시 맨 위로 스크롤
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages === 0) return null;

    // TMDB는 최대 500페이지만 지원함
    const maxPages = Math.min(totalPages, 500);
    const pageButtons = [];


    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(maxPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(maxPages, 5);
    }
    if (currentPage > maxPages - 3) {
      startPage = Math.max(1, maxPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-button ${i === currentPage ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-button"
        >
          &lt; Prev
        </button>
        {startPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)} className="page-button">1</button>
            {startPage > 2 && <span>...</span>}
          </>
        )}
        {pageButtons}
        {endPage < maxPages && (
          <>
            {endPage < maxPages - 1 && <span>...</span>}
            <button onClick={() => handlePageChange(maxPages)} className="page-button"> 
            {maxPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === maxPages}
          className="page-button"
        >
          Next &gt;
        </button>
      </div>
    );
  };

  return (
    <section className="category-container">
      
      <div className="filter-container">
        <h2>장르</h2>
        <div className="genre-list">
          {genres.map((genre) => (
            <button
              key={genre.id}
              className={`genre-button ${
                selectedGenre?.id === genre.id ? "active" : ""
              }`}
              onClick={() => handleGenreClick(genre)}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      <div className="results-container">
        <h2>{selectedGenre ? selectedGenre.name : "장르를 선택하세요"}</h2>

        {searchTerm && (
          <p className="search-info">
            ‘{selectedGenre.name}’ 카테고리 내에서 “{searchTerm}” 검색 중
          </p>
        )}

        {movies.length > 0 ? (
          <div className="movie-grid">
            {movies.map((movie) => {
              if (movie.backdrop_path) {
                const movieImageUrl =
                  "https://image.tmdb.org/t/p/w400" + movie.backdrop_path;
                return (
                  <div className="movie" key={movie.id}>
                    <div
                      onClick={() => navigate(`/${movie.id}`)}
                      className="movie__column-poster"
                    >
                      <img
                        src={movieImageUrl}
                        alt={movie.title || "movie poster"}
                        className="movie__poster"
                      />
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        ) : (
          <p className="no-results-text">
            {searchTerm
              ? `‘${selectedGenre.name}’ 카테고리 내에 “${searchTerm}” 결과가 없습니다.`
              : "영화 목록을 불러올 수 없습니다."}
          </p>
        )}

        {movies.length > 0 && renderPagination()}
      </div>
    </section>
  );
}
