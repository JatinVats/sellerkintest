import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Navbar from "./Navbar";
import Loader from "./Loader";
import "../styles/listingAnalyzer.css";
import {
  convertNumber,
  convertEpochToDateString,
  convertToUSD,
} from "../utils/helperFunctions";
import { handleCredits } from "../utils/handleCredits";

const ListingAnalyzer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fixedSearchTerm, setFixedSearchTerm] = useState("");
  const [limit, setLimit] = useState(50);
  const [sortOn, setSortOn] = useState("");
  const [reviewCount, setReviewCount] = useState(0);
  const [listingData, setListingData] = useState({});
  const [keywordListingsData, setKeywordListingsData] = useState([]);
  const [taxonomyData, setTaxonomyData] = useState({});
  const [imageData, setImageData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [isListingsLoading, setIsListingsLoading] = useState(false);
  const [section, setSection] = useState("overview");
  const [authUser, setAuthUser] = useState(null);
  // const [listingsCount, setListingsCount] = useState(0);

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

  // useEffect(() => {
  //   let parent;
  //   if(Object.keys(taxonomyData).length > 0){

  //   }
  // }, [taxonomyData]);

  const getListingId = () => {
    // setFixedSearchTerm(searchTerm);
    setIsLoading(true);
    setIsOverviewLoading(true);
    // setIsListingsLoading(true);

    const regex = /^\d+$/;
    if (regex.test(searchTerm)) return searchTerm;
    else {
      const regex = /\/listing\/(\d+)\//;
      let match = searchTerm.match(regex);
      if (!match) {
        match = searchTerm.match(/listing_id=(\d+)/);
      }
      console.log(match);
      if (match && match[1]) {
        return match[1];
      } else {
        setIsLoading(false);
        return null;
      }
    }
  };

  const getProduct = async (listingId) => {
    // setListingId(null);
    if (authUser) {
      const creditUpdateResponse = await handleCredits(authUser.uid);
      if (creditUpdateResponse?.ok) {
        setIsOverviewLoading(true);
        fetch(`/application/listings/${listingId}`)
          .then((response) => response.json())
          .then((data) => {
            setListingData((prevState) => ({
              ...prevState,
              ...JSON.parse(data.body),
            }));
            console.log(JSON.parse(data.body));
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        fetch(`/application/listings/${listingId}/images`)
          .then((response) => response.json())
          .then((data) => {
            setListingData((prevState) => ({
              ...prevState,
              imageData: JSON.parse(data.body),
            }));
            setIsOverviewLoading(false);
            console.log(JSON.parse(data.body));
          })
          .catch((error) => {
            console.error("Error:", error);
            setIsOverviewLoading(false);
          });
      }
    } else {
      navigate("/signin");
    }
  };

  const sortProductsByViews = () => {
    const sortedProducts = [...keywordListingsData].sort(
      (a, b) => b.views - a.views
    );
    setKeywordListingsData((prevData) => [...sortedProducts]);
  };

  const sortProductsByFavorers = () => {
    const sortedProducts = [...keywordListingsData].sort(
      (a, b) => b.num_favorers - a.num_favorers
    );
    setKeywordListingsData((prevData) => [...sortedProducts]);
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const collapse = (id) => {
    const section = document.getElementById(id);
    section.classList.toggle("collapsed");
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
    <div className="listing-analyzer body">
      {/* <img src="logo.png" alt="sellerkin logo" /> */}
      <Navbar page={3} />
      <main>
        <div className="top">
          <div className="search-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                let listingId = getListingId();
                if (listingId != null) {
                  getProduct(listingId);
                }
              }}
            >
              <input
                type="text"
                onChange={handleChange}
                value={searchTerm}
                placeholder="Paste a link or id for listing..."
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
          <div className="content">
            <div className="row-1">
              <div className="other-img-wrapper">
                {isOverviewLoading ||
                  listingData?.imageData?.results.map((image) => {
                    return (
                      <div>
                        <img
                          src={image.url_fullxfull}
                          alt={image.alt_text}
                          key={image.listing_image_id}
                        />
                      </div>
                    );
                  })}
              </div>
              <div className="main-img-wrapper">
                {(isOverviewLoading && <Loader />) || (
                  <img
                    src={listingData?.imageData?.results[0].url_fullxfull}
                    alt={listingData?.imageData?.results[0].alt_text}
                  />
                )}
              </div>
              <div className="content-wrapper">
                <h1>{listingData?.title}</h1>

                <div>
                  <p className="price">
                    {(isOverviewLoading && <Loader />) ||
                      (listingData?.listing?.price?.divisor != 0 &&
                        listingData?.price?.amount &&
                        listingData?.price?.currency_code &&
                        `$ ${convertToUSD(
                          listingData.price.amount / listingData.price.divisor,
                          listingData.price.currency_code
                        )}`)}
                  </p>
                  <p>{listingData?.shop?.shop_name}</p>
                </div>
                {isOverviewLoading ? (
                  <Loader />
                ) : (
                  Object.keys(listingData).length > 0 && (
                    <div className="tables">
                      <div className="table">
                        <h5>Listing Stats</h5>
                        <ul>
                          <li>
                            <p>Views</p>
                            <p>
                              {(isOverviewLoading && <Loader />) ||
                                listingData?.views}
                            </p>
                          </li>
                          <li>
                            <p>Favorites</p>
                            <p>
                              {(isOverviewLoading && <Loader />) ||
                                (listingData?.num_favorers &&
                                  convertNumber(listingData?.num_favorers))}
                            </p>
                          </li>
                          <li>
                            <p>Quantity left</p>
                            <p>
                              {(isOverviewLoading && <Loader />) ||
                                listingData?.quantity}
                            </p>
                          </li>
                          <li>
                            <p>Is customizable</p>
                            <p>
                              {(isOverviewLoading && <Loader />) ||
                              listingData?.is_customizable
                                ? "Yes"
                                : "No"}
                            </p>
                          </li>
                          <li>
                            <p>Creation Date</p>
                            <p>
                              {(isOverviewLoading && <Loader />) ||
                                (listingData?.creation_timestamp &&
                                  convertEpochToDateString(
                                    listingData?.creation_timestamp
                                  ))}
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="row-2">
              <div className="">
                <h4>Tags</h4>
                <div>
                  {listingData?.tags?.map((tags) => {
                    return tags.split(" ").map((tag) => {
                      return <p>{tag}</p>;
                    });
                  })}
                </div>
              </div>
              <div>
                <h4>Description</h4>
                <p>{listingData?.description?.trim()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListingAnalyzer;
