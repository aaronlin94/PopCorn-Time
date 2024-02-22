import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
// some logic that does not deal with rendering (such as data fetching) can be split into custom hooks so they can be reusable
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

const KEY = "33d9d0aa";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  // accepting the return values from the customhook, useMovies.
  // passing query into useMovies, since it is needed.
  const { movies, isLoading, error } = useMovies(query);

  // initial value and key name to use in the custom hook
  const [watched, setWatched] = useLocalStorageState([], "watched");

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <SearchResults movies={movies} />
      </NavBar>
      <Main>
        {/* <Box movies={movies}>
          {isLoading ? <Loader /> : <MovieList movies={movies} />}
        </Box> */}
        <Box>
          {/* sometimes using short circuiting is a cleaner code than nested ternery operators */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectedId={setSelectedId} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId && (
            <MovieDetails
              selectedId={selectedId}
              setWatched={setWatched}
              onSelectedId={setSelectedId}
              watched={watched}
              key={selectedId}
            />
          )}
        </Box>
        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList
            watched={watched}
            setWatched={setWatched}
            onSelectedId={setSelectedId}
            selectedId={selectedId}
          />
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>{message}</span>
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>PopcornTime</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  // useRef is used to store data for reference purposes.
  // updating it does not cause re-render and the value stays the same through each re-render
  const inputElement = useRef(null);

  useEffect(function () {
    function callback(event) {
      // checking if current selected DOM is equal the DOM element variable defined via useRef
      if (document.activeElement === inputElement.current) {
        if (event.code === "Enter") {
          inputElement.current.blur();
        }
      }
    }
    document.addEventListener("keydown", callback);
    return function () {
      document.addEventListener("keydown", callback);
    };
  }, []);

  useEffect(function () {
    // .current selects the element where the useRef value is stored
    console.log(inputElement.current);
    inputElement.current.focus();
  }, []); // [] means first mount. so basically, the code means on first mount, the element with useRef will be selected and it will be focused on first mount.
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      // useRef value is stored here as ref, so when using .current with the useEffect, this element will be selected
      ref={inputElement}
    />
  );
}

function SearchResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// function WatchedBox() {
//

//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMoviesList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies, onSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectedId={onSelectedId} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectedId }) {
  return (
    <li
      onClick={() =>
        onSelectedId((selectedId) =>
          movie.imdbID === selectedId ? null : movie.imdbID
        )
      }
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, setWatched, onSelectedId, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // can solve the problem by setting a function state as well in setUserRating
  const [userRating, setUserRating] = useState(function () {
    const watchedUserRating = watched.find(
      (element) => element.imdbID === selectedId
    )?.userRating;
    return watchedUserRating || null;
  });

  // derived state from watched. when clicking remove list, the watched state changes so watchedUserRating dervied state got calculated again
  // const watchedUserRating =
  //   watched.find((element) => element.imdbID === selectedId)?.userRating ||
  //   null;

  const [currentWatchedMovie] = watched.filter(
    (element) => element.imdbID === selectedId
  );

  // check if currentSelected movie is in the watched array or not
  // includes can only check string like values, not objects, so need to convert the objects array into some value array
  const watchedId = watched
    .map((element) => element.imdbID)
    .includes(selectedId);

  // const counter = useRef(0);
  // useEffect(function(){
  //   if (userRating) counter.current=counter.current+1
  // },[userRating])

  // the useEffect that auto updates userRating that will trigger if the selected Id is in watched array
  useEffect(
    function () {
      if (!watchedId) return;

      // watch state will change so, watchedUserRating will be calculated again
      const indexInList = watched.indexOf(currentWatchedMovie);
      setWatched((watched) =>
        watched.filter((element) => element.imdbID !== selectedId)
      );
      currentWatchedMovie.userRating = userRating;
      // correct algorithm for placing currentWatchedMovie in its place correctly back in the array list.
      // imagine this scenario, watched=[0,1,3,4,5]=[watched.slice(0,2),2,watched.slice(2)]
      // because in original watched array, watched[2] is still 3.
      setWatched((watched) => [
        ...watched.slice(0, indexInList),
        currentWatchedMovie, ...watched.slice(indexInList)
      ]);
    },
    [userRating]
  );
  useEffect(
    function () {
      console.log(userRating);
    },
    [userRating]
  );

  useEffect(
    function () {
      if (!watchedId) setUserRating(null);
    },
    [watchedId]
  );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleSetWatched() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    if (watchedId) return;
    setWatched((watched) => [...watched, newWatchedMovie]);
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const response = await fetch(
          `https://www.omdbapi.com/?i=${selectedId}&apikey=${KEY}`
        );
        const data = await response.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `${title} || PopCorn Time`;
      // return function are cleanup effect functions that is helpful to setup the initial state back again. the cleanup will start when the effect's related component has been unmounted
      return function () {
        document.title = "PopCorn Time";
      };
    },
    [title]
  );

  // when selectedId changes the useEffect will trigger and fetch the data and re render the component
  // if selectedId is not selected, the useEffect will only trigger once and will not do anything except changing the id specified by the onClick function above in Movie li component

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <img src={poster} alt="Poster" />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUserRating}
                defaultRating={userRating}
              />
              <button
                className="btn-add"
                onClick={
                  !watchedId
                    ? handleSetWatched
                    : () => {
                        setUserRating(null);
                        setWatched((watched) =>
                          watched.filter(
                            (element) => element.imdbID !== selectedId
                          )
                        );
                      }
                }
              >
                {!watchedId ? "Add To List" : "Remove From List"}
              </button>
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  // const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  // const avgUserRating = average(watched.map((movie) => movie.userRating));
  const sumRuntime = watched
    .map((movie) => movie.runtime)
    .reduce((acc, movie) => acc + movie, 0);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        {/* <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p> */}
        <p>
          <span>⏳</span>
          <span>{sumRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, setWatched, onSelectedId, selectedId }) {
  return (
    <ul className="list watched-list-movies">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          setWatched={setWatched}
          onSelectedId={onSelectedId}
          selectedId={selectedId}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, setWatched, onSelectedId, selectedId }) {
  return (
    <li
      onClick={() => {
        if (selectedId === movie.imdbID) return;
        onSelectedId(movie.imdbID);
      }}
    >
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() =>
            setWatched((watched) =>
              watched.filter((element) => element.imdbID !== movie.imdbID)
            )
          }
        >
          Remove
        </button>
      </div>
    </li>
  );
}

// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];
