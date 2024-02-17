import { useState, useEffect } from "react";

// key means the key from key-value pair
// by setting the key as parameter, we have more control as to what to name the key
// used to name the key as "watched" back in all in one file.
// custom hooks can be set up parameters just like regular JS functions

export function useLocalStorageState(ini, key) {
  // functions can be used in useState as well but they have to return a value
  // function to get stored local data
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem(key);
    // important incase the user deletes local storage
    return storedValue ? JSON.parse(storedValue) : ini;
  });
  useEffect(
    function () {
      // adding to local storage code
      // anytime, watched is changed, watched will be stored in a json key-value object format in a locale storage
      localStorage.setItem(key, JSON.stringify(watched));
    },
    [watched, key]
  );
  return [watched, setWatched];
}
