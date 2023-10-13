import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import userSignOut from "../utils/userSignOut";
import { trimText } from "../utils/helperFunctions";

const Navbar = (props) => {
  const [noOfCreditsUsed, setNoOfCreditsUsed] = useState(24);
  const [creditLimit, setCreditLimit] = useState(100);
  const [authUser, setAuthUser] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // setAuthUser(null);
        navigate("/signin");
      }
      // console.log(user);
      setAuthUser(user);
    });

    return () => {
      listen();
    };
  }, []);
  return (
    <nav>
      <Link to="/">
        <img src="logo-white.svg" alt="sellerkin logo" />
      </Link>
      <div className="options">
        <ul>
            <Link style={{
               textDecoration: 'none',
               color:"white"

          
          }} to="/dashboard">
          <li className={props.page === 1 ? "selected" : ""}>
              <svg
                width="51"
                height="50"
                viewBox="0 0 51 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="22"
                  width="28"
                  height="27"
                  rx="2"
                  stroke="white"
                  stroke-width="2"
                />
                <rect
                  x="1"
                  y="1"
                  width="28"
                  height="14"
                  rx="2"
                  stroke="white"
                  stroke-width="2"
                />
                <rect
                  x="36"
                  y="1"
                  width="14"
                  height="48"
                  rx="2"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
              Dashboard
          </li>
            </Link>
            <Link style={{
               textDecoration: 'none',
               color:"white"

          
          }} to="/keywordfinder">
          <li className={props.page === 2 ? "selected" : ""}>
              <svg
                width="52"
                height="54"
                viewBox="0 0 52 54"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M26.3775 32V28.416L26.2175 27.744V21.632C26.2175 20.3307 25.8335 19.328 25.0655 18.624C24.3188 17.8987 23.1882 17.536 21.6735 17.536C20.6708 17.536 19.6895 17.7067 18.7295 18.048C17.7695 18.368 16.9588 18.8053 16.2975 19.36L15.0175 17.056C15.8922 16.352 16.9375 15.8187 18.1535 15.456C19.3908 15.072 20.6815 14.88 22.0255 14.88C24.3508 14.88 26.1428 15.4453 27.4015 16.576C28.6602 17.7067 29.2895 19.4347 29.2895 21.76V32H26.3775ZM20.8095 32.192C19.5508 32.192 18.4415 31.9787 17.4815 31.552C16.5428 31.1253 15.8175 30.5387 15.3055 29.792C14.7935 29.024 14.5375 28.16 14.5375 27.2C14.5375 26.2827 14.7508 25.4507 15.1775 24.704C15.6255 23.9573 16.3402 23.36 17.3215 22.912C18.3242 22.464 19.6682 22.24 21.3535 22.24H26.7295V24.448H21.4815C19.9455 24.448 18.9108 24.704 18.3775 25.216C17.8442 25.728 17.5775 26.3467 17.5775 27.072C17.5775 27.904 17.9082 28.576 18.5695 29.088C19.2308 29.5787 20.1482 29.824 21.3215 29.824C22.4735 29.824 23.4762 29.568 24.3295 29.056C25.2042 28.544 25.8335 27.7973 26.2175 26.816L26.8255 28.928C26.4202 29.9307 25.7055 30.7307 24.6815 31.328C23.6575 31.904 22.3668 32.192 20.8095 32.192Z"
                  fill="white"
                />
                <path
                  d="M50.3103 52.9992C50.7103 53.38 51.3433 53.3646 51.7241 52.9647C52.105 52.5647 52.0896 51.9318 51.6897 51.5509L50.3103 52.9992ZM36.9228 40.2492L50.3103 52.9992L51.6897 51.5509L38.3022 38.8009L36.9228 40.2492Z"
                  fill="white"
                />
                <circle
                  cx="22.95"
                  cy="22.95"
                  r="21.95"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
              keyword finder
          </li>
            </Link>
            <Link style={{
               textDecoration: 'none',
               color:"white"

          
          }} to="/listinganalyzer">
          <li className={props.page === 3 ? "selected" : ""}>
              <svg
                width="57"
                height="54"
                viewBox="0 0 57 54"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1V51C1 52.1046 1.89543 53 3 53H56"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M9 38.5L21.7805 22.1938C22.6249 21.1166 24.2775 21.1867 25.0276 22.3315L31.5161 32.235C32.2535 33.3605 33.8696 33.4514 34.7285 32.4156L50 14"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              listing analyzer
          </li>
            </Link>
            <Link style={{
               textDecoration: 'none',
               color:"white"

          
          }} to="/productfinder">
          <li className={props.page === 4 ? "selected" : ""}>
              <svg
                width="52"
                height="54"
                viewBox="0 0 52 54"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M50.3103 52.9992C50.7103 53.38 51.3433 53.3646 51.7241 52.9647C52.105 52.5647 52.0896 51.9318 51.6897 51.5509L50.3103 52.9992ZM36.9228 40.2492L50.3103 52.9992L51.6897 51.5509L38.3022 38.8009L36.9228 40.2492Z"
                  fill="white"
                />
                <circle
                  cx="22.95"
                  cy="22.95"
                  r="21.95"
                  stroke="white"
                  stroke-width="2"
                />
                <path
                  d="M13 19.5L20.2727 14H33M13 19.5H25.7273M13 19.5V32H25.7273M33 14L25.7273 19.5M33 14V26.6L25.7273 32M25.7273 19.5V32"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
              product finder
          </li>
            </Link>
            <Link style={{
               textDecoration: 'none',
               color:"white"

          
          }} to="/shopanalyzer">
          <li className={props.page === 5 ? "selected" : ""}>
              <svg
                width="56"
                height="53"
                viewBox="0 0 56 53"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M53.5317 11.0153L53.7292 11.3238C56.1026 15.4656 53.6886 20.9057 48.9289 21.5347C48.5536 21.5809 48.1874 21.6075 47.8179 21.6075C45.4436 21.6075 43.3428 20.5856 41.8848 19.003L41.1471 18.2022L40.4118 19.0053C38.9657 20.5849 36.8665 21.6075 34.4809 21.6075C32.1048 21.6075 29.9956 20.5844 28.5499 19.0053L27.8123 18.1997L27.0748 19.0053C25.6291 20.5844 23.5199 21.6075 21.1438 21.6075C18.7678 21.6075 16.6585 20.5844 15.2129 19.0053L14.4753 18.1997L13.7377 19.0053C12.2921 20.5844 10.1828 21.6075 7.80678 21.6075C7.44734 21.6075 7.07134 21.5809 6.69691 21.5349C1.83949 20.8812 -0.567392 15.1822 2.10275 11.016C2.1028 11.0159 2.10285 11.0158 2.1029 11.0158L7.9735 1.86198L7.97475 1.86003C8.30835 1.3372 8.9174 1 9.57618 1H46.0689C46.7277 1 47.3368 1.3372 47.6704 1.86003L47.6712 1.86131L53.5317 11.0153Z"
                  stroke="white"
                  stroke-width="2"
                />
                <path
                  d="M6.39027 25.1117V37.1154C6.39027 44.3176 6.00174 52 12.6067 52C14.0097 52 16.3744 52 18.5 52M36 52C48.3509 52 48.3509 46.7184 48.3509 37.1154C48.3509 27.5125 48.3509 25.1117 48.3509 24.6316M36 52V37C36 35.8954 35.1046 35 34 35H20.5C19.3954 35 18.5 35.8954 18.5 37V52M36 52C30.6852 52 25.7923 52 18.5 52"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              shop analyzer
          </li>
            </Link>
        </ul>
        <div className="bottom">
          {/* <div className="credits-wrapper">
            <p> Credits used</p>
            <div>
              <p>{`${noOfCreditsUsed}/${creditLimit}`}</p>
              <div className="progress-bar">
                <div
                  style={{ width: `${(100 * noOfCreditsUsed) / creditLimit}%` }}
                ></div>
              </div>
            </div>
          </div> */}

          <div className="more">
            <div style={showSettings ? {} : { display: "none" }}>
              <Link to="/forgotpassword">Change Password</Link>
              <p className="sign-out-button" onClick={userSignOut}>
                Sign out
              </p>
            </div>
            <div
              className="email"
              onClick={() => setShowSettings((prevState) => !prevState)}
            >
              <div>{authUser?.email?.slice(0, 1)}</div>
              {authUser?.email ? trimText(authUser.email, 14) : ""}
            </div>
            {/* <div onClick={() => setShowSettings((prevState) => !prevState)}>
              <svg
                width="55"
                height="52"
                viewBox="0 0 55 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="53"
                  height="9.81818"
                  rx="4.90909"
                  stroke="white"
                  stroke-width="2"
                />
                <rect
                  x="1"
                  y="21.0908"
                  width="53"
                  height="9.81818"
                  rx="4.90909"
                  stroke="white"
                  stroke-width="2"
                />
                <rect
                  x="1"
                  y="41.1819"
                  width="53"
                  height="9.81818"
                  rx="4.90909"
                  stroke="white"
                  stroke-width="2"
                />
              </svg>
              More options
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
