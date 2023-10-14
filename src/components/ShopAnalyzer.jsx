import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  convertNumber,
  trimText,
  convertEpochToDateString,
  getDaySuffix,
  convertToUSD,
} from "../utils/helperFunctions";
import { handleCredits } from "../utils/handleCredits";
import "../styles/shopAnalyzer.css";
import Navbar from "./Navbar";
import Loader from "./Loader";

const ShopAnalyzer = () => {
  const backendURL="https://sellerkintempbe.onrender.com";
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(30);
  const [initialShopData, setInitialShopData] = useState({});
  const [shopData, setShopData] = useState({});
  const [featuredListings, setFeaturedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/signin");
      } else setAuthUser(user);
    });

    return () => {
      listen();
    };
  }, []);

  const getShop = async () => {
    if (authUser) {
      const creditUpdateResponse = await handleCredits(authUser.uid);
      if (creditUpdateResponse?.ok) {
        setIsLoading(true);
        fetch(`${backendURL}/application/shops?shop_name=${searchTerm}`)
          .then((response) => response.json())
          .then((data) => {
            // console.log("frontend:", JSON.parse(data.body));
            if (!("error" in JSON.parse(data.body)))
              setInitialShopData({ ...JSON.parse(data.body).results[0] });
            // console.log(JSON.parse(data.body).results[0]);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    } else {
      alert("login first!");
    }
  };

  useEffect(() => {
    // console.log("useEffect started");
    if (Object.keys(initialShopData).length > 0) {
      let countViews = 0;
      let countFavorers = 0;
      let listingsIdArray = [];
      console.log(initialShopData.shop_id);

      // stores the total views and favorites of all listings
      let setViewsFavorers = async () => {
        for (
          let offset = 0;
          offset <= initialShopData.listing_active_count;
          offset = offset + 100
        ) {
          // stores all listing ids
          try {
            const response = await fetch(
              `${backendURL}/application/shops/${initialShopData.shop_id}/listings/active?limit=100&offset=${offset}`
            );
            const data = await response.json();
            const shopListings = JSON.parse(data.body).results;

            listingsIdArray = [
              ...listingsIdArray,
              ...shopListings?.map((listing) => listing.listing_id),
            ];
          } catch (error) {
            console.error(
              `Error fetching data from getListingsByListingIds api:`,
              error
            );
          }

          // console.log("listingsIdArray: ", listingsIdArray);
        }

        // stores all the views and favorers using listing ids
        for (
          let offset = 0;
          offset <= listingsIdArray.length;
          offset = offset + 100
        ) {
          let listingIdString = "";
          for (
            let i = offset;
            i < Math.min(offset + 100, listingsIdArray.length);
            i++
          ) {
            listingIdString += `listing_ids[]y${listingsIdArray[i]}x`;
          }

          try {
            // fetches 100 listings data at a time
            // console.log("aaa1:", listingIdString);
            const response = await fetch(
              `${backendURL}/application/listings/getbatch/batch?listing_ids_string=x${listingIdString}x`
            );
            const data = await response.json();
            const listings = JSON.parse(data.body).results;
            // console.log("aaa2:", JSON.parse(data.body));

            listings?.map((listing) => {
              countFavorers += listing.num_favorers;
              countViews += listing.views;
            });
          } catch (error) {
            console.error(
              `Error fetching data from getListingsByListingIds api:`,
              error
            );
          }

          // console.log("views: ", countViews);
        }

        setShopData((prevState) => ({
          ...initialShopData,
          views: countViews,
          num_favorers: countFavorers,
        }));
        setIsLoading(false);
      };

      setViewsFavorers();

      fetch(`${backendURL}/application/shops/${initialShopData.shop_id}/listings/featured`)
        .then((response) => response.json())
        .then((data) => {
          // setFeaturedListings([...JSON.parse(data.body).results]);
          let featuredListingsWithoutImages = JSON.parse(data.body).results;

          let fetchImagePromises = featuredListingsWithoutImages.map(
            async (product) => {
              // countViews += product.views;
              // countFavorers += product.num_favorers;
              return new Promise((resolve) => {
                setTimeout(async () => {
                  const response = await fetch(
                    `${backendURL}/application/listings/${product.listing_id}/images`
                  );
                  const imageData = await response.json();
                  // console.log("images: ", JSON.parse(imageData.body));
                  resolve({
                    ...product,
                    imageData: { ...JSON.parse(imageData.body) },
                  });
                }, 300); // Delay of _ second
              });
            }
          );

          // console.log("1: ", fetchImagePromises);
          Promise.all(fetchImagePromises)
            .then((featuredListings) => {
              setFeaturedListings(featuredListings);
              // setShopData((prevState) => ({
              //   ...initialShopData,
              //   views: countViews,
              //   num_favorers: countFavorers,
              // }));
              // setIsLoading(false);
              // setViewsFavorers();
              // console.log("frontend:", shopData);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [initialShopData]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="shop-analyzer body">
      <Navbar page={5} />
      <main>
        <div className="top">
          <div className="search-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                getShop();
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
          </div>
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
            <div className="primary-content">
              <h4>
                Sales{" "}
                <p>
                  {(isLoading && <Loader />) ||
                    (shopData?.transaction_sold_count &&
                      convertNumber(shopData?.transaction_sold_count))}
                </p>
              </h4>
              {/* <h4>
                Revenue{" "}
                <p>
                  {(isLoading && <Loader />) ||
                    (shopData?.transaction_sold_count && "560k")}
                </p>
              </h4> */}
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
            </div>
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
                            (shopData?.accepts_custom_requests ? "Yes" : "No"))}
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
                                  {convertNumber(featuredListing.num_favorers)}{" "}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopAnalyzer;
