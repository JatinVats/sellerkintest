import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Navbar from "./Navbar";
import Loader from "./Loader";
import Level0Dropdown from "./DropdownList";
import CountriesDropDownList from "./CountriesDropDownList";
import "../styles/productFinder.css";
import {
  convertNumber,
  trimText,
  getDaysSinceEpoch,
  convertToUSD,
} from "../utils/helperFunctions";
import { handleCredits } from "../utils/handleCredits";
import { countries } from "../utils/countries";

const ProductFinder = (props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fixedSearchTerm, setFixedSearchTerm] = useState("");
  const [limit, setLimit] = useState(50);
  const [sortOn, setSortOn] = useState("");
  const [reviewCount, setReviewCount] = useState(0);
  const [keywordData, setKeywordData] = useState({});
  const [keywordListingsData, setKeywordListingsData] = useState([]);
  const [defaultKeywordListingsData, setDefaultKeywordListingsData] = useState(
    []
  );
  const [matchedListingsCount, setMatchedListingsCount] = useState(0);
  const [initialKeywordListingsData, setInitialKeywordListingsData] = useState(
    []
  );
  const [imageData, setImageData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [isListingsLoading, setIsListingsLoading] = useState(false);
  const [section, setSection] = useState("listings");
  const [taxonomyId, setTaxonomyId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minNumFavorers, setMinNumFavorers] = useState("");
  const [maxNumFavorers, setMaxNumFavorers] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minViews, setMinViews] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [sortBy, setSortBy] = useState("default");
  // const [taxonomyData, setTaxonomyData] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  // const [listingsCount, setListingsCount] = useState(0);

  const [selectedLevel0, setSelectedLevel0] = useState(null);
  const [selectedLevel1, setSelectedLevel1] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [areCategoriesLoading, setAreCategoriesLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [authUser, setAuthUser] = useState(null);

  const handleLevel0Click = (id, itemName) => {
    setSelectedLevel0(id);
    setSelectedLevel1(null);
    setSelectedCategory(itemName);
    // console.log("level 0: ", id);
  };

  const handleLevel1Click = (id, itemName) => {
    setSelectedLevel0(null);
    setSelectedLevel1(id);
    setSelectedCategory(itemName);
    // console.log("level 1: ", id);
  };

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
  };

  const navigate = useNavigate();

  useEffect(() => {
    // setAreCategoriesLoading(true);
    const listen = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // setAuthUser(null);
        navigate("/signin");
      } else {
        setAuthUser(user);
      }
    });

    return () => {
      listen();
    };
  }, []);

  let listingsIdArray = [];

  const weights = {
    creation_timestamp: 0,
    last_modified_timestamp: 0,
    quantity: 0,
    featured_rank: 0,
    num_favorers: 0.67,
    non_taxable: 0,
    is_customizable: 0,
    is_personalizable: 0,
    is_private: 0,
    ratingAndReview: 0,
    views: 0.33,
    sales: 0,
  };
  const findProducts = async () => {
    if (authUser) {
      const creditUpdateResponse = await handleCredits(authUser.uid);
      if (creditUpdateResponse?.ok) {
        setIsLoading(true);
        setIsOverviewLoading(true);
        setIsListingsLoading(true);
        setFixedSearchTerm(searchTerm);

        // fetch most recent {limit} number of listings
        fetch(
          `/application/listings/active?keywords=${searchTerm}&limit=${limit}&sort_on=${sortOn}&offset=0&shop_location=${selectedCountry}&taxonomy_id=${
            selectedLevel0
              ? selectedLevel0
              : selectedLevel1
              ? selectedLevel1
              : ""
          }&min_price=${minPrice}&min_price=${maxPrice}`
        )
          .then((response) => response.json())
          .then((data) => {
            // console.log("1:", JSON.parse(data.body).results);
            if (!("error" in JSON.parse(data.body))) {
              let productsWithoutImages = JSON.parse(data.body).results;
              setMatchedListingsCount(JSON.parse(data.body).count);

              setViewsFavorers(
                JSON.parse(data.body).count
                // productIdsWithoutImages
              );
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        let setViewsFavorers = async (listingsCount) => {
          console.log("listingsCount 3: ", listingsCount);
          let idPromises = [],
            listingPromises = [],
            productIdsWithoutImages = [];

          // For loop to store all ids, 100 per iteration, order doesn't matter, so fetch can be called concurrently
          let offset1;
          for (
            offset1 = 0;
            offset1 <= Math.min(listingsCount, 100);
            offset1 = offset1 + 100
          ) {
            // console.log(
            //   `/application/listings/active?keywords=${searchTerm}&limit=100&sort_on=${sortOn}&offset=${offset1}&shop_location=${selectedCountry}&taxonomy_id=${
            //     selectedLevel0
            //       ? selectedLevel0
            //       : selectedLevel1
            //       ? selectedLevel1
            //       : ""
            //   }&min_price=${minPrice}&min_price=${maxPrice}`
            // );
            const promise = fetch(
              `/application/listings/active?keywords=${searchTerm}&limit=100&sort_on=${sortOn}&offset=${offset1}&shop_location=${selectedCountry}&taxonomy_id=${
                selectedLevel0
                  ? selectedLevel0
                  : selectedLevel1
                  ? selectedLevel1
                  : ""
              }&min_price=${minPrice}&min_price=${maxPrice}`
            )
              .then((response) => response.json())
              .then((data) => {
                const allListings = JSON.parse(data.body).results;

                return allListings?.map((listing) => listing.listing_id);
              })
              .catch((error) => {
                console.error(
                  `Error fetching data from getListingsByListingIds api 1:`,
                  error
                );
                return []; // Return an empty array if an error occurs
              });

            idPromises.push(promise);
          }

          // Wait for all the promises to resolve using Promise.all()
          const listingsIdArrays = await Promise.all(idPromises);

          // Flatten the array of arrays into a single array
          const flattenedListingsIdArray = listingsIdArrays.flat();
          // const flattenedListingsIdArray = await Promise.all(promises);
          // console.log("2:", flattenedListingsIdArray);

          let allListingsWithoutImagesData = [];

          // Second for loop
          let offset, i;
          for (
            offset = 0;
            offset <= flattenedListingsIdArray.length;
            offset = offset + 100
          ) {
            let listingIdString = "";
            for (
              i = offset;
              i < Math.min(offset + 100, flattenedListingsIdArray.length);
              i++
            ) {
              listingIdString += `listing_ids[]y${flattenedListingsIdArray[i]}x`;
            }

            // console.log(listingIdString);

            const promise = fetch(
              `/application/listings/getbatch/batch?listing_ids_string=x${listingIdString}x`
            )
              .then((response) => response.json())
              .then((data) => {
                // console.log("3:", JSON.parse(data.body).results);

                const intermediateListingsData = JSON.parse(data.body)
                  .results?.map((listing) => {
                    const {
                      listing_id,
                      title,
                      original_creation_timestamp,
                      url,
                      num_favorers,
                      views,
                      price,
                    } = listing;

                    const priceInUSD =
                      price.divisor > 0 && price.amount
                        ? convertToUSD(
                            price.amount / price.divisor,
                            price.currency_code
                          )
                        : 0;
                    // console.log(title, views, num_favorers);

                    const age = getDaysSinceEpoch(original_creation_timestamp);

                    const valid =
                      num_favorers >= (minNumFavorers || 0) &&
                      num_favorers <= (maxNumFavorers || Number.MAX_VALUE) &&
                      priceInUSD >= (minPrice || 0) &&
                      priceInUSD <= (maxPrice || Number.MAX_VALUE) &&
                      age >= (minAge || 0) &&
                      age <= (maxAge || Number.MAX_VALUE) &&
                      views >= (minViews || 0) &&
                      views <= (maxViews || Number.MAX_VALUE);

                    if (valid) {
                      return {
                        listing_id,
                        title,
                        age,
                        url,
                        num_favorers,
                        views,
                        price: priceInUSD,
                      };
                    }
                  })
                  .filter(Boolean);

                allListingsWithoutImagesData.push(...intermediateListingsData);
                // console.log("all: ", allListingsWithoutImagesData);
              })
              .catch((error) => {
                console.error(
                  "Error fetching data from getListingsByListingIds api 2:",
                  error
                );
              });

            listingPromises.push(promise);
          }

          // Use Promise.all() to wait for all the promises to resolve concurrently
          await Promise.all(listingPromises);

          let listingIdString = "";
          allListingsWithoutImagesData.map((listing) => {
            listingIdString += `listing_ids[]y${listing.listing_id}x`;
          });

          // let allListingsWithImagesData = allListingsWithoutImagesData?.map(
          //   async (listing) => {
          //     await new Promise((resolve) => setTimeout(resolve, 1000));
          //     const response = await fetch(
          //       `/application/listings/${listing.listing_id}/images`
          //     );
          //     const imageData = await response.json();
          //     // console.log("images: ", JSON.parse(imageData.body));
          //     return {
          //       ...listing,
          //       imageData: { ...JSON.parse(imageData.body) },
          //     };
          //   }
          // );

          Promise.all(allListingsWithoutImagesData)
            .then((allListings) => {
              setKeywordListingsData([...allListings]);
              setDefaultKeywordListingsData((prevState) => [...allListings]);
              // console.log("data updated");
              setIsListingsLoading(false);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        };
      }
    } else {
      navigate("/signin");
    }

    // setViewsFavorers();
  };

  const sortProductsByViews = () => {
    if (sortBy == "views-DEC") {
      const sortedProducts = [...defaultKeywordListingsData].sort(
        (a, b) => a.views - b.views
      );
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("views-INC");
    } else if (sortBy == "views-INC") {
      const sortedProducts = [...defaultKeywordListingsData];
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("default");
    } else {
      const sortedProducts = [...defaultKeywordListingsData].sort(
        (a, b) => b.views - a.views
      );
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("views-DEC");
    }
  };

  const sortProductsByFavorers = () => {
    if (sortBy == "favorers-DEC") {
      const sortedProducts = [...defaultKeywordListingsData].sort(
        (a, b) => a.num_favorers - b.num_favorers
      );
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("favorers-INC");
    } else if (sortBy == "favorers-INC") {
      const sortedProducts = [...defaultKeywordListingsData];
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("default");
    } else {
      const sortedProducts = [...defaultKeywordListingsData].sort(
        (a, b) => b.num_favorers - a.num_favorers
      );
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("favorers-DEC");
    }
  };

  const sortProductsByPrice = () => {
    if (sortBy == "price-DEC") {
      const sortedProducts = [...defaultKeywordListingsData].sort(
        (a, b) => a.price - b.price
      );
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("price-INC");
    } else if (sortBy == "price-INC") {
      const sortedProducts = [...defaultKeywordListingsData];
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("default");
    } else {
      const sortedProducts = [...defaultKeywordListingsData].sort(
        (a, b) => b.price - a.price
      );
      setKeywordListingsData((prevData) => [...sortedProducts]);
      setSortBy("price-DEC");
    }
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const collapse = (id) => {
    const section = document.getElementById(id);
    section.classList.toggle("collapsed");
  };

  const getDaysSinceEpoch = (epochSeconds) => {
    const milliseconds = epochSeconds * 1000; // Convert seconds to milliseconds
    const epochDate = new Date(milliseconds); // Create a Date object from epoch milliseconds
    const currentDate = new Date(); // Get the current date

    // Calculate the difference in days
    const timeDifference = currentDate.getTime() - epochDate.getTime();
    // console.log(currentDate.getTime() - epochDate.getTime());
    // console.log(
    //   currentDate.getTime() / (1000 * 3600 * 24) -
    //     epochDate.getTime() / (1000 * 3600 * 24)
    // );
    // console.log();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

    return daysDifference;
  };

  const selectButton = (containerId, id) => {
    const btn_container = document.getElementById(containerId);
    const btns = btn_container.querySelectorAll("button");
    btns.forEach((element, ind) => {
      if (ind + 1 == id) {
        element.classList.add("selected");
      } else element.classList.remove("selected");
    });
  };

  return (
    <div className="product-finder body">
      {/* <img src="logo.png" alt="sellerkin logo" /> */}
      <Navbar page={4} />
      <main>
        <div className="top">
          <div className="search-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                findProducts();
              }}
            >
              <input
                type="text"
                onChange={handleChange}
                value={searchTerm}
                placeholder="Search any keyword..."
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
        {/* <div id="header-1">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            selectButton("header-1", 1);
            setSection("overview");
          }}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            selectButton("header-1", 2);
            setSection("listings");
          }}
        >
          Listings
        </button>
      </div> */}
        <div className="">
          <div className="content">
            <div className="secondary-search-container">
              <div className="filter-header">
                <p>Filters</p>
                {showFilters ? (
                  <svg
                    width="30"
                    height="16"
                    viewBox="0 0 30 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setShowFilters((prevState) => !prevState)}
                  >
                    <path
                      d="M29 1L16.0173 14.2846C15.6312 14.6797 14.9979 14.6869 14.603 14.3007L0.999999 1"
                      stroke="#2C2C2C"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="30"
                    height="16"
                    viewBox="0 0 30 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setShowFilters((prevState) => !prevState)}
                  >
                    <path
                      d="M1 15L13.9827 1.71537C14.3688 1.32031 15.0021 1.31312 15.397 1.6993L29 15"
                      stroke="#2C2C2C"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                )}
              </div>
              <div
                className="row row-1"
                style={!showFilters ? { display: "none" } : {}}
              >
                <div>
                  <label for="country">Country:</label>
                  <div className="dropdown-container">
                    <CountriesDropDownList
                      data={countries}
                      selectedCountry={selectedCountry}
                      handleCountryClick={handleCountryClick}
                    />
                  </div>
                </div>
                <div>
                  <label>Categories:</label>

                  <div className="dropdown-container">
                    {areCategoriesLoading ? (
                      <p>loading...</p>
                    ) : Object.keys(props.taxonomyData).length > 0 ? (
                      <Level0Dropdown
                        data={props.taxonomyData}
                        selectedLevel0={selectedLevel0}
                        selectedLevel1={selectedLevel1}
                        handleLevel0Click={handleLevel0Click}
                        handleLevel1Click={handleLevel1Click}
                        selectedCategory={selectedCategory}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>

              <div
                className="row row-2"
                style={!showFilters ? { display: "none" } : {}}
              >
                {/* <div>
                  <label>Total Sales:</label>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Min Sales"
                    id="min-sales-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Max Sales"
                    id="max-sales-limit"
                  />
                </div>
                <div>
                  <label>Total Revenue:</label>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Min Revenue"
                    id="min-revenue-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Max Revenue"
                    id="max-revenue-limit"
                  />
                </div>
                <div>
                  <label>Monthly Sales:</label>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Min Sales"
                    id="min-monthly-sales-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Max Sales"
                    id="max-monthly-sales-limit"
                  />
                </div>
                <div>
                  <label>Monthly Revenue:</label>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Min Revenue"
                    id="min-monthly-revenue-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    // onChange={handleChange}
                    // value={searchTerm}
                    placeholder="Max Revenue"
                    id="max-monthly-revenue-limit"
                  />
                </div> */}
                <div>
                  {/* . */}
                  <label>Price:</label>
                  <input
                    type="number"
                    onChange={(e) => setMinPrice(e.target.value)}
                    value={minPrice}
                    placeholder="Min Price"
                    id="min-price-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    onChange={(e) => setMaxPrice(e.target.value)}
                    value={maxPrice}
                    placeholder="Max Price"
                    id="max-price-limit"
                  />
                </div>
                <div>
                  <label>Favorites:</label>
                  <input
                    type="number"
                    onChange={(e) => setMinNumFavorers(e.target.value)}
                    value={minNumFavorers}
                    placeholder="Min Favorites"
                    id="min-favorites-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    onChange={(e) => setMaxNumFavorers(e.target.value)}
                    value={maxNumFavorers}
                    placeholder="Max Favorites"
                    id="max-favorites-limit"
                  />
                </div>
                <div>
                  <label>Age:</label>
                  <input
                    type="number"
                    onChange={(e) => setMinAge(e.target.value)}
                    value={minAge}
                    placeholder="Min Age"
                    id="min-age-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    onChange={(e) => setMaxAge(e.target.value)}
                    value={maxAge}
                    placeholder="Max Age"
                    id="max-age-limit"
                  />
                </div>
                <div>
                  <label>Views:</label>
                  <input
                    type="number"
                    onChange={(e) => setMinViews(e.target.value)}
                    value={minViews}
                    placeholder="Min Views"
                    id="min-views-limit"
                  />
                  <div className="line"></div>
                  <input
                    type="number"
                    onChange={(e) => setMaxViews(e.target.value)}
                    value={maxViews}
                    placeholder="Max Views"
                    id="max-views-limit"
                  />
                </div>
              </div>
            </div>

            {/* {section == "overview" && (
        <div className="overview">
          <section>
            <h4>
              Views{" "}
              <p>
                {(isOverviewLoading && <Loader />) ||
                  (keywordData?.views ? convertNumber(keywordData?.views) : "")}
              </p>
            </h4>
            <h4>
              Favorites{" "}
              <p>
                {(isOverviewLoading && <Loader />) ||
                  (keywordData?.num_favorers
                    ? convertNumber(keywordData?.num_favorers)
                    : "")}{" "}
              </p>
            </h4>
            <h4>
              Avg price{" "}
              <p>
                {isOverviewLoading ? (
                  <Loader />
                ) : keywordData?.totalPrice && keywordData?.totalCount ? (
                  `$ ${convertNumber(
                    keywordData?.totalPrice / keywordData?.totalCount
                  )}`
                ) : (
                  ""
                )}
              </p>
            </h4>
            <h4>
              Competing Listings
              <p>
                {(isOverviewLoading && <Loader />) ||
                  (matchedListingsCount > 0 &&
                    convertNumber(matchedListingsCount))}
              </p>
            </h4>
            <h4>
              Reviews{" "}
              <p>
                {(isOverviewLoading && <Loader />) ||
                  (reviewCount > 999
                    ? convertNumber(reviewCount)
                    : reviewCount)}
              </p>
            </h4> 
          </section>
        </div>
      )} */}
            {section == "listings" && (
              <>
                <section className="listings" id="listings-1">
                  <h4>Listings</h4>
                  {/* {isOverviewLoading ||
                    (!isListingsLoading && keywordListingsData.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            sortProductsByViews();
                            selectButton("listings-1", 1);
                          }}
                        >
                          Sort by Views
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            sortProductsByFavorers();
                            selectButton("listings-1", 2);
                          }}
                        >
                          Sort by favorers
                        </button>
                      </>
                    ))} */}
                </section>

                {/* <div id="dataContainer">
                  {isListingsLoading ? (
                    <Loader />
                  ) : (
                    keywordListingsData?.map((product, index) => {
                      // console.log(product);
                      return (
                        <a href={product?.url} target="_blank" key={index}>
                          <div>
                            <div>
                              <img
                                src={
                                  product?.imageData?.results
                                    ? product.imageData.results[0].url_fullxfull
                                    : ""
                                }
                                alt={
                                  product?.imageData?.results
                                    ? product.imageData.results[0].alt_text
                                    : ""
                                }
                              />
                            </div>
                            <p>
                              {product?.title
                                ? trimText(product?.title, 30)
                                : ""}
                            </p>
                            <div>
                              <span>
                                {product?.views && product?.views == 0
                                  ? 0
                                  : convertNumber(product?.views)}{" "}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  height="1em"
                                  viewBox="0 0 576 512"
                                >
                                  <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
                                </svg>
                              </span>
                              <span>
                                {product?.num_favorers &&
                                product?.num_favorers == 0
                                  ? 0
                                  : convertNumber(product?.num_favorers)}{" "}
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
                      );
                    })
                  )}
                </div> */}

                <div class="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>
                          <div onClick={sortProductsByPrice}>
                            Price{" "}
                            <div class="sort-icon">
                              {sortBy == "price-DEC" ? (
                                ""
                              ) : (
                                <div class="triangle-up"></div>
                              )}
                              {sortBy == "price-INC" ? (
                                ""
                              ) : (
                                <div class="triangle-down"></div>
                              )}
                            </div>
                          </div>
                        </th>
                        <th>
                          <div onClick={sortProductsByViews}>
                            Views{" "}
                            <div class="sort-icon">
                              {sortBy == "views-DEC" ? (
                                ""
                              ) : (
                                <div class="triangle-up"></div>
                              )}
                              {sortBy == "views-INC" ? (
                                ""
                              ) : (
                                <div class="triangle-down"></div>
                              )}
                            </div>
                          </div>
                        </th>
                        <th>
                          <div onClick={sortProductsByFavorers}>
                            Favorites{" "}
                            <div class="sort-icon">
                              {sortBy == "favorers-DEC" ? (
                                ""
                              ) : (
                                <div class="triangle-up"></div>
                              )}
                              {sortBy == "favorers-INC" ? (
                                ""
                              ) : (
                                <div class="triangle-down"></div>
                              )}
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {isListingsLoading ? (
                        <Loader />
                      ) : (
                        keywordListingsData?.map((product, index) => {
                          // console.log(product);
                          return (
                            <tr key={index}>
                              <td className="product-title-wrapper">
                                <a href={product?.url} target="_blank">
                                  {/* <div>
                                    <img
                                    src={
                                      product?.imageData?.results
                                        ? product.imageData.results[0]
                                            .url_fullxfull
                                        : ""
                                    }
                                    alt={
                                      product?.imageData?.results
                                        ? product.imageData.results[0]
                                            .alt_text
                                        : ""
                                    }
                                    />
                                  </div> */}

                                  {product?.title
                                    ? trimText(product?.title, 42)
                                      ? trimText(product?.title, 42)
                                      : "No title available"
                                    : "No title available"}
                                </a>
                              </td>
                              <td>
                                {product?.price &&
                                  `$ ${convertNumber(product?.price)}`}{" "}
                              </td>
                              <td>
                                {product?.views
                                  ? convertNumber(product?.views)
                                  : 0}{" "}
                              </td>
                              <td>
                                {product?.num_favorers
                                  ? convertNumber(product?.num_favorers)
                                  : 0}{" "}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductFinder;
