


import { useState, useEffect } from "react";



//Update media query
const useMediaQuery = (query:string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("resize", listener);
  }, [query]);

  return matches;
}

export default useMediaQuery;