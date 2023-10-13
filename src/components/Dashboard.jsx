import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";

import "../styles/dashboard.css";
import Navbar from "./Navbar";
import Loader from "./Loader";
import {
  convertNumber,
  trimText,
  convertEpochToDateString,
} from "../utils/helperFunctions";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(30);
  const [initialShopData, setInitialShopData] = useState({});
  const [shopData, setShopData] = useState({});
  const [featuredListings, setFeaturedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noOfCreditsUsed, setNoOfCreditsUsed] = useState(0);
  const [creditLimit, setCreditLimit] = useState(-1);
  const [authUser, setAuthUser] = useState(100);

  const grantUrl =
    "https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=https://sellerkintempfe.onrender.com/callback&scope=email_r%20shops_r%20listings_r%20transactions_r%20cart_r%20profile_r%20feedback_r%20favorites_r%20billing_r%20address_r&client_id=aoeoryx59j26t30056nqabv8&state=superstate&code_challenge=4oferpTzRMn8rZb9RJwTpZ_t4YfenI4N9NqHDLBTLLo&code_challenge_method=S256";
    // "https://www.etsy.com/oauth/connect?response_type=code&redirect_uri=http://localhost:8001/callback&scope=email_r%20shops_r%20listings_r%20transactions_r%20cart_r%20profile_r%20feedback_r%20favorites_r%20billing_r%20address_r&client_id=aoeoryx59j26t30056nqabv8&state=superstate&code_challenge=4oferpTzRMn8rZb9RJwTpZ_t4YfenI4N9NqHDLBTLLo&code_challenge_method=S256";

  const navigate = useNavigate();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // setAuthUser(null);
        navigate("/signin");
      } else {
        setAuthUser(user);
        setCredits(user.uid);
      }
    });

    return () => {
      listen();
    };
  }, []);

  const setCredits = async (uid) => {
    const q = query(collection(db, "credits"), where("user_id", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("User profile not found.");
      return;
    }

    // We assume there's only one document matching the user_id, so we use the first one
    const userDoc = querySnapshot.docs[0];
    const currentCredits = userDoc.data().credits;
    const creditLimit = userDoc.data().credit_limit;

    setNoOfCreditsUsed(currentCredits);
    setCreditLimit(creditLimit);
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="dashboard body">
      <Navbar page={1} />
      <main>
        <div className="top">
          {/* <div className="search-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // getShop();
              }}
            >
              <input
                type="text"
                onChange={handleChange}
                value={searchTerm}
                placeholder="Search Shops..."
                id="primary-search-input"
              />
              <svg
                onClick={() => setSearchTerm("")}
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="11" fill="#8B8B8B" />
                <path
                  d="M8 8L13.6569 13.6569"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M13.6567 8L7.99988 13.6569"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <button type="submit">Search</button>
            </form>
          </div> */}
          <h2>Dashboard</h2>
        </div>
        <div>
          <div className="title">
            <span>
              {shopData?.shop_name && (
                <img
                  src={shopData?.icon_url_fullxfull}
                  alt={shopData?.title + "icon"}
                />
              )}
            </span>
            <div>
              {(isLoading && <Loader />) ||
                (shopData?.shop_name && (
                  <>
                    <h2>{shopData?.shop_name}</h2>
                    <div>
                      on Etsy since{" "}
                      {convertEpochToDateString(shopData?.create_date)} •{" "}
                      {shopData?.review_average?.toFixed(2)}
                      <img
                        src="star-solid.svg"
                        alt="yellow review star image"
                      />
                    </div>
                  </>
                ))}
            </div>
          </div>
          {/* <div className="sub-menu">
          <ul>
            <li>Overview</li>
            <li>Analytics</li>
          </ul>
        </div> */}
          <div className="content">
            {/* <div className="primary-content">
              <h4>
                Sales{" "}
                <p>
                  {(isLoading && <Loader />) ||
                    (shopData?.transaction_sold_count &&
                      convertNumber(shopData?.transaction_sold_count))}
                </p>
              </h4>
              <h4>
                Revenue{" "}
                <p>
                  {(isLoading && <Loader />) ||
                    (shopData?.transaction_sold_count && "560k")}
                </p>
              </h4>
              <h4>
                Conversion Rate{" "}
                <p>
                  {(isLoading && <Loader />) ||
                    (shopData?.transaction_sold_count &&
                      (
                        (shopData?.transaction_sold_count / shopData?.views) *
                        100
                      ).toFixed(2) + " %")}
                </p>
              </h4>
              <h4>
                Total Views
                <p>
                  {(isLoading && <Loader />) ||
                    (shopData?.views && convertNumber(shopData?.views))}
                </p>
              </h4>
            </div> */}
            <div className="column-1">
              <div>
                <div>
                  <h4>Connect Your Shop</h4>
                  <p>
                    Connect your shop to get in depth analysis of you shop. We
                    use Etsy's official website for connecting your shop
                    securely
                  </p>
                  <button type="button">
                    <a href={grantUrl} target="_blank">
                      Connect Etsy shop
                    </a>
                  </button>
                </div>
              </div>
              <div className="credits-wrapper">
                <div>
                  <div>
                    <h4> Credits used: </h4>
                    <p>{`${noOfCreditsUsed}/${creditLimit}`}</p>
                    <svg
                      width="54"
                      height="55"
                      viewBox="0 0 54 55"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={() => (authUser ? setCredits(authUser.uid) : "")}
                    >
                      <path
                        d="M3.28276 18.7724C2.71654 19.7209 3.02637 20.9487 3.97478 21.5149C4.92319 22.0811 6.15103 21.7713 6.71724 20.8229L3.28276 18.7724ZM48.1544 21.7676C49.2424 21.9584 50.279 21.2312 50.4699 20.1433L53.5803 2.41404C53.7712 1.32608 53.0439 0.289394 51.956 0.0985251C50.868 -0.0923439 49.8313 0.634887 49.6405 1.72284L46.8757 17.4822L31.1164 14.7174C30.0284 14.5265 28.9917 15.2537 28.8009 16.3417C28.61 17.4296 29.3372 18.4663 30.4252 18.6572L48.1544 21.7676ZM6.71724 20.8229C9.92624 15.4478 15.7373 9.26565 22.6925 7.49858C26.0996 6.63296 29.8429 6.80534 33.8445 8.72444C37.8832 10.6613 42.2927 14.4316 46.8627 20.9462L50.1373 18.6491C45.3073 11.7637 40.4126 7.43818 35.5742 5.11776C30.6988 2.77958 25.9921 2.53321 21.7075 3.62175C13.2794 5.76302 6.74043 12.9808 3.28276 18.7724L6.71724 20.8229Z"
                        fill="black"
                      />
                      <path
                        d="M50.7172 35.8228C51.2835 34.8744 50.9736 33.6465 50.0252 33.0803C49.0768 32.5141 47.849 32.8239 47.2828 33.7723L50.7172 35.8228ZM5.8456 32.8276C4.75765 32.6368 3.72095 33.364 3.53009 34.452L0.419695 52.1812C0.228826 53.2691 0.956057 54.3058 2.04401 54.4967C3.13196 54.6876 4.16865 53.9603 4.35952 52.8724L7.12432 37.1131L22.8836 39.8779C23.9716 40.0687 25.0083 39.3415 25.1991 38.2535C25.39 37.1656 24.6628 36.1289 23.5748 35.938L5.8456 32.8276ZM47.2828 33.7723C44.0738 39.1474 38.2627 45.3296 31.3075 47.0966C27.9004 47.9623 24.1571 47.7899 20.1555 45.8708C16.1168 43.9339 11.7073 40.1636 7.13731 33.649L3.86269 35.9461C8.69274 42.8315 13.5874 47.157 18.4258 49.4775C23.3012 51.8156 28.0079 52.062 32.2925 50.9735C40.7206 48.8322 47.2596 41.6144 50.7172 35.8228L47.2828 33.7723Z"
                        fill="black"
                      />
                    </svg>
                  </div>
                  <div>
                    {(100 * noOfCreditsUsed) / creditLimit}%
                    <div className="progress-bar">
                      <div
                        style={{
                          width: `${(100 * noOfCreditsUsed) / creditLimit}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="column-2">
              <div>
                <h4>Kickstart your journey</h4>
                <ul>
                  <li>
                    <span>Keyword Finder</span>
                    <p>
                      Check any metrics like views, favorites for any keyword
                    </p>
                  </li>
                  <li>
                    <span>Listing Analyzer</span>
                    <p>
                      Analyze any listing by copy paste its link or listing id
                      on search bar
                    </p>
                  </li>
                  <li>
                    <span>Product Finder</span>
                    <p>
                      Find the products you are looking for using different
                      filters
                    </p>
                  </li>
                  <li>
                    <span>Shop Analyzer</span>
                    <p>Analyze any shop and get their key insights </p>
                  </li>
                </ul>
              </div>
            </div>

            {Object.keys(shopData).length > 0 && (
              <div className="secondary-content">
                <div className="tables">
                  <div className="table">
                    <h5>Shop Stats</h5>
                    <ul>
                      <li>
                        <p>Active Listings</p>
                        <p>
                          {(isLoading && <Loader />) ||
                            shopData?.listing_active_count}
                        </p>
                      </li>
                      <li>
                        <p>sales per Listings</p>
                        <p>
                          {(isLoading && <Loader />) ||
                            (shopData?.transaction_sold_count &&
                              Math.round(
                                shopData?.transaction_sold_count /
                                  shopData?.listing_active_count
                              ))}
                        </p>
                      </li>
                      <li>
                        <p>Favorites</p>
                        <p>
                          {(isLoading && <Loader />) ||
                            (shopData?.num_favorers &&
                              convertNumber(shopData?.num_favorers))}
                        </p>
                      </li>
                    </ul>
                  </div>
                  <div className="table">
                    <h5>Shop Stats</h5>
                    <ul>
                      <li>
                        <p>Review Count</p>
                        <p>
                          {(isLoading && <Loader />) ||
                            (shopData?.review_count &&
                              convertNumber(shopData?.review_count))}
                        </p>
                      </li>
                      <li>
                        <p>Accepts Custom requests</p>
                        <p>
                          {(isLoading && <Loader />) ||
                            (shopData?.accepts_custom_requests &&
                              (shopData?.accepts_custom_requests
                                ? "Yes"
                                : "No"))}
                        </p>
                      </li>
                      <li>
                        {/* <p>Favorites</p>
                      <p>{shopData.num_favorers}</p> */}
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4>Featured Items</h4>
                  <div id="dataContainer">
                    {(isLoading && <Loader />) ||
                      featuredListings?.map((featuredListing, index) => {
                        return (
                          <>
                            <a
                              href={featuredListing?.url}
                              target="_blank"
                              key={index}
                            >
                              <div>
                                <div>
                                  <img
                                    src={
                                      featuredListing?.imageData?.results
                                        ? featuredListing.imageData.results[0]
                                            .url_fullxfull
                                        : ""
                                    }
                                    alt={
                                      featuredListing?.imageData?.results
                                        ? featuredListing.imageData.results[0]
                                            .alt_text
                                        : ""
                                    }
                                  />
                                </div>
                                <p>{trimText(featuredListing?.title, 36)}</p>
                                <div>
                                  <span>
                                    {convertNumber(featuredListing.views)}{" "}
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      height="1em"
                                      viewBox="0 0 576 512"
                                    >
                                      <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
                                    </svg>
                                  </span>
                                  <span>
                                    {convertNumber(
                                      featuredListing.num_favorers
                                    )}{" "}
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      height="1em"
                                      viewBox="0 0 512 512"
                                    >
                                      <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </a>
                          </>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
            {/* <button type="button" onClick={sendResetPasswordEmailFunction}>
              reset password
            </button> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
