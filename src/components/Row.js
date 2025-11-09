import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import MovieModal from "./MovieModal";
import "./Row.css";

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, A11y } from "swiper";

import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

export default function Row({ isLargeRow, title, id, fetchUrl }) {
  const [movies, setMovies] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [movieSelected, setMovieSelected] = useState({});

  useEffect(() => {
    fetchMovieData();
  }, []);

  const fetchMovieData = async () => {
    const request = await axios.get(fetchUrl);
    console.log("request", request);
    setMovies(request.data.results);
    console.log("request.data.results", request.data.results);
  };

  const handleClick = (movie) => {
    setModalOpen(true);
    setMovieSelected(movie);
  };

  return (
    <section className="row">
      <h2>{title}</h2>
      <Swiper 
        // install Swiper modules
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        loop={true} // loop 기능을 사용할 것인지
        breakpoints={{
          1378: {
            slidesPerView: 6, // 한번에 보이는 슬라이드 개수
            slidesPerGroup: 6, // 몇개씩 슬라이드 할지
          },
          998: {
            slidesPerView: 5,
            slidesPerGroup: 5,
          },
          625: {
            slidesPerView: 4,
            slidesPerGroup: 4,
          },
          0: {
            slidesPerView: 3,
            slidesPerGroup: 3,
          },
        }}
        navigation  // arrow 버튼 사용 유무 
        pagination={{ clickable: true }} // 페이지 버튼 보이게 할지 
      >
        <div id={id} className="row__posters">
          {movies.map((movie) => (
            <SwiperSlide className={isLargeRow ? "row__swiperSlideLarge" : ""}>
              <div 
                className={`row__poster-container ${isLargeRow && "row__posterLarge"}`}
                onClick={() => handleClick(movie)} 
              >
                <img
                  key={movie.id}
                  style={{ padding: "20px 0" , cursor: 'pointer'}}
                  className={`row__poster ${isLargeRow && "row__posterLarge"}`}
                  src={`https://image.tmdb.org/t/p/original/${
                    isLargeRow ? movie.poster_path : movie.backdrop_path
                } `}
                alt={movie.name}
                // onClick={() => handleClick(movie)}
                />

                {/* 요약 정보 */}
                <div className="row__poster-info">
                  <h3 className="row__poster-title">{movie.title || movie.name || movie.original_name}</h3>
                  <p className="row__poster-date">{movie.release_date || movie.first_air_date}</p>
                  <p className="row__poster-overview"> 평점: {movie.vote_average}</p>
                </div>
                
              </div>
            </SwiperSlide>
          ))}
        </div>
      </Swiper>
      {modalOpen && (
        <MovieModal {...movieSelected} setModalOpen={setModalOpen} />
      )}
    </section>
  );
}