import axios from "../api/axios";
import React, { useEffect, useState } from "react";
import requests from "../api/requests";
import "./Banner.css";
import styled from "styled-components";
export default function Banner() {
  const [movie, setMovie] = useState([]);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 현재 상영 중인 영화 정보 가져오기 (20작)
      const request = await axios.get(requests.fetchNowPlaying);
      const movies = request.data.results;

      // 각 영화의 상세 정보 요청
      /// 병렬 요청을 위한 Promise 준비
      const movieDetailPromises = movies.map(movie =>
        axios.get(`movie/${movie.id}`, {
          params: { append_to_response: "videos"},
        })
      );
      /// 20개 병렬 요청 처리
      const movieDetailResponses = await Promise.allSettled(movieDetailPromises);
      
      // 응답에 성공한 비디오 목록 중 videos가 존재하는 영화만 필터링
      const moviesWithVideos = movieDetailResponses
        .filter(res => res.status === "fulfilled")
        .map(res => res.value.data)
        .filter(movie => movie.videos?.results?.length > 0);

      // 임의의 영화 선정
      if (moviesWithVideos.length > 0) {
        const randomMovie = moviesWithVideos[Math.floor(Math.random() * moviesWithVideos.length)];
        setMovie(randomMovie);
      } else {
        console.warn("No Movies with videos.");
      }
    } catch (error) {
      console.error("Error fetching movie data : ", error);
    }
  };

  const truncate = (str, n) => {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  console.log('movie',movie);
  if (!isClicked) {
    return (
      <header
        className="banner"
        style={{
          backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie.backdrop_path}")`,
          backgroundPosition: "top center",
          backgroundSize: "cover",
        }}
      >
        <div className="banner__contents">
          <h1 className="banner__title">
            {movie.title || movie.name || movie.original_name}
          </h1>

          <div className="banner__buttons">
            <button
              className="banner__button play"
              onClick={() => setIsClicked(true)}
            >
              Play
            </button>
            <button className="banner__button info">More Information</button>
          </div>

          <h1 className="banner__description">
            {truncate(movie.overview, 100)}
          </h1>
        </div>
        <div className="banner--fadeBottom" />
      </header>
    );
  } else {
    return (
      <Container>
        <HomeContainer>
          <Iframe
            width="640"
            height="360"
            src={`https://www.youtube.com/embed/${movie.videos.results[0].key}?controls=0&autoplay=1&loop=1&mute=1&playlist=${movie.videos.results[0].key}`}
            title="YouTube video player"
            frameborder="0"
            allow="autoplay; fullscreen"
            allowfullscreen
          ></Iframe>
        </HomeContainer>
      </Container>
    );
  }
}

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.65;
  border: none;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
`;

const HomeContainer = styled.div`
  width: 100%;
  height: 100%;
`;
