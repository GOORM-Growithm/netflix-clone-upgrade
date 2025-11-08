import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import "./CategoryPage.css"; 

export default function CategoryPage() {
  const { genreId, genreName } = useParams(); 
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]); 

  //페이지네이션
  const [totalPages, setTotalPages] = useState(0); 
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedGenre, setSelectedGenre] = useState({ 
    id: parseInt(genreId), 
    name: decodeURIComponent(genreName) 
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
     fetchMoviesByGenre(selectedGenre.id, currentPage);
    }
  }, [selectedGenre, currentPage]); 

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

  
  const handleGenreClick = (genre) => {
    setSelectedGenre(genre); 
    setCurrentPage(1);
    navigate(`/category/${genre.id}/${genre.name}`, { replace: true });
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
        {renderPagination()}
      </div>
    </section>
  );
}
