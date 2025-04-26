import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search.jsx";
import Spinner from "./components/spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
console.log(API_KEY);
//const API_KEY ='eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZmEyM2YyODRjZTM4NzAzMzc3Y2Q2YjI0M2ZhYjYwNSIsIm5iZiI6MTczODY5MTg5MS4zNTY5OTk5LCJzdWIiOiI2N2EyNTUzMzdlYmIwNjE0ZmYyNmMyY2EiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.bcElh67ivfozmUJYM9cRoEnvomH_GX7IaqQW5vt2Teo';

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
/*
const url = 'https://api.themoviedb.org/3/authentication';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmZmEyM2YyODRjZTM4NzAzMzc3Y2Q2YjI0M2ZhYjYwNSIsIm5iZiI6MTczODY5MTg5MS4zNTY5OTk5LCJzdWIiOiI2N2EyNTUzMzdlYmIwNjE0ZmYyNmMyY2EiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.bcElh67ivfozmUJYM9cRoEnvomH_GX7IaqQW5vt2Teo'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));
*/
// import './index.css'

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [movieList, setMovieList] = useState([]);
  // const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      console.log(endpoint);

      const response = await fetch(endpoint, API_OPTIONS);

      //alert(response);
      if (!response.ok) {
        console.log(`API Error: Status ${response.status}`);
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      console.log(data);

      if (data.Response === "false") {
        setErrorMessage(data.Error || "Error feacting movies");
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error feacting movies: ${error}`);
      setErrorMessage(`Error feacting movies. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  // const loadTrendingMovies = async () => {
  //   try {
  //     const movies = await getTrendingMovies();

  //     setTrendingMovies(movies);
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // useEffect(() => {
  //   loadTrendingMovies();
  // }, []);

  // console.log(trendingMovies);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className={"text-gradient"}>Movies </span>
            With lil_fitse
            <br /> without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* {trendingMovies.length > 0 && (
        <section className="trending">
          <h2>Trending Movies</h2>
          <ul>
            {trendingMovies.map((movie, index) => ( 
              <li key={movie.id}>
                <p>{index + 1}</p>
              </li>
              ))}
          </ul>
        </section>
      )} */}
        <section className="all-movies">
          <h1>{searchTerm}</h1>
          <h2>All Movies</h2>
          {isLoading ? (
            //<p className="text-white">Loading...</p>
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : movieList.length > 0 ? (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
                // <p key={movie.id} className="text-white">{movie.title}</p>
              ))}
            </ul>
          ) : (
            <p className="text-white">No movie available.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
