import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// import StarRating from './StarRating.jsx'

// function ApiConsumer (){
//   const [movieRating,setMovieRating] = useState(0);
//   return(
//     <div>
//       {/* connecting external setter to the component API setter to get access */}
//       <StarRating color='green' maxRating={5} onSetRating={setMovieRating}/>
//       <p>This movie was rated {movieRating} stars</p>
//     </div>
//   )
// }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <StarRating maxRating={10}/>
    <StarRating maxRating={3} messages={["Bad","Good","Excellent"]} defaultRating={3}/>
    <ApiConsumer/> */}
    <App />
  </React.StrictMode>
);
