import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";
import "./DetailPage.css";

export default function DetailPage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState({});

  const [genres, setGenres] = useState([]);

  const formatDateToKorean = (dateString) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
  };

  useEffect(() => {
    async function fetchData() {
      const request = await axios.get(`/movie/${movieId}`);
      setMovie(request.data);
      setGenres(request.data.genres);
    }

    fetchData();
  }, [movieId]);

  if (!movie) return <div>...loading</div>;

  return (
    <section
      className="detail__contanier"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original/${movie.backdrop_path})`,
      }}
    >
      <div className="detail__info_contanier">
        <h1 className="detail__title">{movie?.title}</h1>
        <div className="genre__contanier">
          {genres?.map((genre) => (
            <div className="genre">{genre.name}</div>
          ))}
        </div>
        <div className="detail__info">
          <span className="detail__rating">
            ⭐ 평점 {movie?.vote_average?.toFixed(1)}
          </span>
          <span className="detail__runtime">⏱ {movie.runtime}분</span>
          <span className="detail__release">
            📅 {formatDateToKorean(movie?.release_date)} 개봉
          </span>
        </div>
        <div className="detail__subinfo">
          <div className="image__contanier">
            <img
              src={`http://www.themoviedb.org/t/p/w300_and_h450_bestv2${movie?.poster_path}`}
            />
          </div>

          <div className="subinfo__contanier">
            <p className="detail__overview">{movie?.overview}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
