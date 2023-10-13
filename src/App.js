import { React, useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import "./global.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import KeywordFinder from "./components/KeywordFinder";
import ShopAnalyzer from "./components/ShopAnalyzer";
import ListingAnalyzer from "./components/ListingAnalyzer";
import ProductFinder from "./components/ProductFinder";
import Signup from "./components/Signup";
import Signin from "./components/Signin";
import Callback from "./components/Callback";
import Dashboard from "./components/Dashboard";
import DropdownList from "./components/DropdownList";
import ForgotPassword from "./components/ForgotPassword";
import Landing from "./components/Landing";

function App() {
  const [page, setPage] = useState(1);
  const [taxonomyData, setTaxonomyData] = useState({});

  useEffect(() => {
    fetch("/application/ping")
      .then((response) => response.json())
      .then((data) => {
        console.log("Server pinged successfully: ");
      })
      .catch((error) => {
        console.log("Error pinging server:", error);
      });

    fetch("/application/buyer-taxonomy/nodes")
      .then((response) => response.json())
      .then((data) => {
        setTaxonomyData(JSON.parse(data.body));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div className="page">
      <div className="container">
        {/* <main>
          {page == 1 ? (
            <ProductFinder />
          ) : page == 3 ? (
            <ShopAnalyzer />
          ) : (
            <ProductFinder />
          )}
        </main> */}
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Landing />}></Route>
            <Route exact path="/dashboard" element={<Dashboard />}></Route>
            <Route
              exact
              path="/dropdownlist"
              element={<DropdownList data={taxonomyData} />}
            ></Route>
            <Route exact path="/signin" element={<Signin />}></Route>
            <Route exact path="/signup" element={<Signup />}></Route>
            <Route
              exact
              path="/forgotpassword"
              element={<ForgotPassword />}
            ></Route>
            <Route exact path="/callback" element={<Callback />}></Route>
            <Route
              exact
              path="/keywordfinder"
              element={<KeywordFinder />}
            ></Route>
            <Route
              exact
              path="/listinganalyzer"
              element={<ListingAnalyzer />}
            ></Route>
            <Route
              exact
              path="/productfinder"
              element={<ProductFinder taxonomyData={taxonomyData} />}
            ></Route>
            <Route
              exact
              path="/shopanalyzer"
              element={<ShopAnalyzer />}
            ></Route>
          </Routes>
        </BrowserRouter>
      </div>
      <footer>
        <div className="divider"></div>
        <p>
          The term " Etsy " is a trademark of Etsy, Inc. This application uses
          the Etsy API but is not endorsed or certified by Etsy, Inc.
        </p>
      </footer>
    </div>
  );
}
// }

export default App;
