import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/landing.css";

const Landing = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setIsLoggedIn(false);
      } else setIsLoggedIn(true);
    });

    return () => {
      listen();
    };
  }, []);
  return (
    <div className="landing-body">
      {/* <div className="box box-1"></div>
      <div className="box box-2"></div> */}
      {/* <Navbar index="1" /> */}
      <div className="nav">
        <Link to="/" className="name">
          <img src="/logo.png"></img>
        </Link>
        <ul className="menu-items">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/">About Us</Link>
          </li>
          {isLoggedIn ? (
            <li id="dashboard-link">
              <Link to="/dashboard">dashboard</Link>
            </li>
          ) : (
            <>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
              <li>
                <Link to="/signin">Login</Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className="content">
        <div className="left">
          <h1>All you need to grow your Etsy business, in one place.</h1>
          <p className="desc">
            Get key insights on all sorts of Etsy data like keywords, shops,
            listings and many more and grow your business manifold.
          </p>
          <div className="buttons">
            <div className="left-btn">
              <Link to="/signup">
                <button>Sign up for free</button>
              </Link>
            </div>
            <div className="right-btn">
              <Link to="/signin">
                <button>Sign in to your account</button>
              </Link>
            </div>
          </div>
        </div>
        <div className="right">
          <img src="/Sellerkin_mockup_1.png" />
        </div>
      </div>
    </div>
  );
};

export default Landing;
