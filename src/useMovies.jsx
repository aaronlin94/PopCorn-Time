// to create a custom hook, copy and paste port of the logic that is complete on its own and can be resuable
// make sure to include all the necessary uesStates and useEffects.
// return the values that will be needed in the main file. 

import { useState, useEffect } from "react";

const KEY = "33d9d0aa";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // async function is typically under useEffect to prevent infinite loading (as data is fetched the component will be rerendered and making the data fetch again and rerender again and so on)
  // useEffect function will load only after the component finished rendering
  // [] means the effect will execute only when it first mounts (the first time it got render into the screen (not counting rerenders))
  useEffect(
    function () {
      // data fetching control code
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          // resetting previous error state if there was any
          setError("");
          const result = await fetch(
            `https://www.omdbapi.com/?s=${query}&apikey=${KEY}`,
            { signal: controller.signal }
            // data fetching control code
          );

          if (!result.ok) throw new Error("Something went wrong");

          const data = await result.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setMovies(data.Search);
          setError("");
        } catch (error) {
          console.error(error);
          if (error.name !== "AbortError") {
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();
      // cleanup effect for data fetching
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  // by putting query state in the dependency array, the effect will trigger every time query state changes
  // this is a widely used search algorithm with useEffect
  return {movies, isLoading, error}
}
