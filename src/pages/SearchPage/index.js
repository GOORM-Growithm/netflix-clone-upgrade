import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useDebounce } from "../../hooks/useDebounce";
import "./SearchPage.css";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isFetchingRef = useRef(false);

  const useQuery = () => new URLSearchParams(useLocation().search);
  const query = useQuery();
  const searchTerm = query.get("q");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  /* 검색어에 따른 페이지 초기화 */
  useEffect(() => {
    if (debouncedSearchTerm) {
      setPage(1);
      setHasMore(true);
      fetchSearchMovie(debouncedSearchTerm, 1, true);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  /* 스크롤 이벤트 */
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

      if (
        scrollTop + clientHeight >= scrollHeight - 200 &&
        !isFetchingRef.current &&
        hasMore
      ) {
        console.log("Scroll triggered, fetching next page: ", page + 1);
        setPage((prev) => prev + 1);
      }

      setShowScrollTop(scrollTop > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, page]);

  /* 페이지 번호에 따른 추가 로딩 */
  useEffect(() => {
    if (page > 1 && debouncedSearchTerm) {
      fetchSearchMovie(debouncedSearchTerm, page);
    }
  }, [page]);

  /* 뷰포트에 내용이 다 차지 않을 경우 (고해상도 모니터) */
  useEffect(() => {
    if (hasMore && !isFetchingRef.current) {
      const { scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight <= clientHeight + 100) {
        console.log("컨텐츠가 한 화면 이하 — 다음 페이지 자동 요청");
        setPage((prev) => prev + 1);
      }
    }
  }, [searchResults]);


  const fetchSearchMovie = async (searchTerm, pageNum = 1, reset = false) => {
    if (isFetchingRef.current) {
      console.log("⏸️ fetch blocked - already fetching...");
      return;
    }

    console.log("searchTerm", searchTerm);
    isFetchingRef.current = true;
    setIsFetching(true);

    try {
      const request = await axios.get(
        `/search/multi?include_adult=false&query=${searchTerm}&page=${pageNum}`
      );
      console.log("search request", request);

      const results = request.data.results || [];
      if (results.length === 0 || results.length < 20) {
        setHasMore(false);
        console.log("더 이상 불러올 결과 없음");
      }

      setSearchResults((prev) => (reset ? results : [...prev, ...results]));
    } catch (error) {
      console.log("error", error);
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
    }
  };

  /* 맨 위로 이동 */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // auto | instant | smooth
    });
  };

  /* 결과 렌더링 */
  const renderSearchResults = () => {
    return searchResults.length > 0 ? (
      <section className="search-container">
        {searchResults.map((movie) => {
          if (movie.backdrop_path !== null && movie.media_type !== "person") {
            const movieImageUrl =
              "https://image.tmdb.org/t/p/w400" + movie.backdrop_path;
            return (
              <div className="search-movie" key={movie.id}>
                <div
                  onClick={() => navigate(`/${movie.id}`)}
                  className="search-movie__column-poster"
                >
                  <img
                    src={movieImageUrl}
                    alt="movie"
                    className="search-movie__poster"
                  />
                </div>
              </div>
            );
          }
        })}
        {isFetching && <p className="loading">Loading...</p>}
        {!hasMore && (
          <p className="end-of-results">모든 결과를 불러왔습니다.</p>
        )}
      </section>
    ) : (
      <section className="no-results">
        <div className="no-results__text">
          <p>
            찾고자하는 검색어 "{debouncedSearchTerm}"에 맞는 영화가 없습니다.
          </p>
        </div>
      </section>
    );
  };

  return (
    <>
      {renderSearchResults()}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}
    </>
  );
}
