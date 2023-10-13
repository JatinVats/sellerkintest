import { React, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { AiFillCaretLeft, AiFillCaretRight } from 'react-icons/ai';


import {
  convertNumber,
  trimText,
  getDaysSinceEpoch,
  convertToUSD,
} from "../utils/helperFunctions";
import Navbar from "./Navbar";
import Loader from "./Loader";
import { handleCredits } from "../utils/handleCredits";
import "../styles/keywordFinder.css";
import Table from "./Table";

const KeywordFinder = () => {
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
  const [section, setSection] = useState("overview");
  const [shopLocation, setShopLocation] = useState("");
  const [taxonomyId, setTaxonomyId] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [sortBy, setSortBy] = useState("default");
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
          `/application/listings/active?keywords=${searchTerm}&limit=${limit}&sort_on=${sortOn}&offset=0&shop_location=${shopLocation}&taxonomy_id=${taxonomyId}&min_price=${maxPrice}&min_price=${maxPrice}`
        )
          .then((response) => response.json())
          .then((data) => {
            // console.log("1:", JSON.parse(data.body).results);
            if (!("error" in JSON.parse(data.body))) {
              let productsWithoutImages = JSON.parse(data.body).results;
              setMatchedListingsCount(JSON.parse(data.body).count);

              // setKeywordData((prevState) => ({
              //   ...prevState,
              //   // products: [...productsWithoutImages],
              // }));

              let productIdsWithoutImages = JSON.parse(data.body).results?.map(
                (listing) => {
                  return listing.listing_id;
                }
              );
              setViewsFavorers(
                JSON.parse(data.body).count,
                productIdsWithoutImages
              );

              // let fetchImagePromises = productsWithoutImages.map(
              //   async (product) => {
              //     return new Promise((resolve) => {
              //       setTimeout(async () => {
              //         // countViews += product.views;
              //         // countFavorers += product.num_favorers;
              //         const response = await fetch(
              //           `/application/listings/${product.listing_id}/images`
              //         );
              //         const imageData = await response.json();
              //         console.log("images: ", JSON.parse(imageData.body));
              //         resolve({
              //           ...product,
              //           imageData: { ...JSON.parse(imageData.body) },
              //         });
              //       }, 300); // Delay of _ second
              //     });
              //   }
              // );

              // console.log("1: ", fetchImagePromises);
              // Promise.all(fetchImagePromises)
              //   .then((productsWithImages) => {
              //     setKeywordData((prevState) => ({
              //       ...prevState,
              //       products: [...productsWithImages],
              //     }));
              //     console.log("data updated");
              //     // setIsLoading(false);
              //   })
              //   .catch((error) => {
              //     console.error("Error:", error);
              //   });

              // let reviewPromises = productsWithoutImages.map(async (product) => {
              //   return await fetch(
              //     `/application/listings/${product.listing_id}/reviews`
              //   )
              //     .then((response) => response.json())
              //     .then((data) => {
              //       // setReviewCount(
              //       //   (prevState) => prevState + JSON.parse(data.body).count
              //       // );
              //       totalReviewCount +=
              //         typeof JSON.parse(data.body).count == "number"
              //           ? JSON.parse(data.body).count
              //           : 0;
              //       return JSON.parse(data.body).count;
              //       // console.log(typeof JSON.parse(data.body).count);
              //     });
              // });
              // Promise.all(reviewPromises)
              //   .then((reviews) => {
              //     setReviewCount(totalReviewCount);
              //     // console.log("reviews updated:", totalReviewCount, reviewCount);
              //   })
              //   .catch((error) => {
              //     console.error("Error:", error);
              //   });
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        let setViewsFavorers = async (
          listingsCount,
          productIdsWithoutImages
        ) => {
          console.log("listingsCount 3: ", listingsCount);
          let idPromises = [],
            propertyValuePromises = [];

          // For loop to store all ids, 100 per iteration, order doesn't matter, so fetch can be called concurrently
          // let offset1;
          // for (
          //   offset1 = 0;
          //   offset1 <= Math.min(listingsCount, 900);
          //   offset1 = offset1 + 100
          // ) {
          //   const promise = fetch(
          //     `/application/listings/active?keywords=${searchTerm}&limit=100&sort_on=${sortOn}&offset=${offset1}&shop_location=&taxonomy_id=&min_price=&min_price=`
          //   )
          //     .then((response) => response.json())
          //     .then((data) => {
          //       console.log("2:", JSON.parse(data.body).results);
          //       const allListings = JSON.parse(data.body).results;

          //       return allListings?.map((listing) => listing.listing_id);
          //     })
          //     .catch((error) => {
          //       console.error(
          //         `Error fetching data from getListingsByListingIds api:`,
          //         error
          //       );
          //       return []; // Return an empty array if an error occurs
          //     });

          //   idPromises.push(promise);
          // }

          let allListings = [];

          // For loop to store all ids, 100 per iteration, in sequential order
          for (
            let offset1 = 0;
            offset1 <= Math.min(listingsCount, 900);
            offset1 += 100
          ) {
            try {
              const response = await fetch(
                `/application/listings/active?keywords=${searchTerm}&limit=100&sort_on=${sortOn}&offset=${offset1}&shop_location=&taxonomy_id=&min_price=&min_price=`
              );
              const data = await response.json();
              const listings = JSON.parse(data.body).results;
              allListings.push(
                ...listings?.map((listing) => listing.listing_id)
              ); // Collect the fetched listings

              // ... (Existing code for the second for loop)
            } catch (error) {
              console.error(
                "Error fetching data from getListingsByListingIds API:",
                error
              );
              return; // Stop further processing if an error occurs
            }
          }

          // Now, 'allListings' contains all fetched listings from the loop
          // You can use it for further logic after the loop ends
          console.log("All Listings:", allListings);

          // Wait for all the promises to resolve using Promise.all()
          // const listingsIdArrays = await Promise.all(idPromises);

          // Flatten the array of arrays into a single array
          const flattenedListingsIdArray = allListings.flat();
          // const flattenedListingsIdArray = listingsIdArrays.flat();
          // const flattenedListingsIdArray = await Promise.all(promises);
          console.log("2:", flattenedListingsIdArray);

          let intermediateSums = [];

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
                console.log("3:", JSON.parse(data.body).results);
                const listings = JSON.parse(data.body).results;

                let sumFavorers = 0,
                  sumViews = 0,
                  sumCreationTimestamp = 0,
                  sumPrice = 0,
                  count = 0;

                listings?.forEach((listing) => {
                  sumFavorers += listing.num_favorers;
                  sumViews += listing.views;
                  let priceInUSD = convertToUSD(
                    listing.price.amount / listing.price.divisor,
                    listing.price.currency_code
                  );
                  sumPrice += priceInUSD;
                  sumCreationTimestamp += listing.creation_timestamp;
                  if (priceInUSD != 0) count++;
                  // console.log(listing.taxonomy_id);
                });

                intermediateSums.push({
                  sumFavorers,
                  sumViews,
                  sumPrice,
                  sumCreationTimestamp,
                  count,
                });

                // console.log("length:", intermediateSums.length);
                // console.log("price:", sumPrice);
              })
              .catch((error) => {
                console.error(
                  "Error fetching data from getListingsByListingIds api:",
                  error
                );
              });

            propertyValuePromises.push(promise);
          }

          // Use Promise.all() to wait for all the promises to resolve concurrently
          await Promise.all(propertyValuePromises);

          // Calculate the final sum by iterating through the intermediate sums
          let countFavorers = 0,
            countViews = 0,
            totalPrice = 0,
            totalCreationTimestamp = 0,
            totalCount = 0;
          // n = Math.min(listingsCount, 1000);
          // n = intermediateSums.length;

          intermediateSums.forEach((sums) => {
            countFavorers += sums.sumFavorers;
            countViews += sums.sumViews;
            totalPrice += sums.sumPrice;
            totalCreationTimestamp += sums.sumCreationTimestamp;
            totalCount += sums.count;
          });

          // After the iteration, you can use the updated countFavo

          setKeywordData((prevState) => ({
            ...prevState,
            views: countViews,
            num_favorers: countFavorers,
            totalPrice: totalPrice,
            totalCreationTimestamp: totalCreationTimestamp,
            totalCount: totalCount,
          }));
          setIsOverviewLoading(false);
          // console.log(getDaysSinceEpoch(totalCreationTimestamp / totalCount));

          let listingIdString = "";
          productIdsWithoutImages.map((id) => {
            listingIdString += `listing_ids[]y${id}x`;
          });
          const response = await fetch(
            `/application/listings/getbatch/batch?listing_ids_string=x${listingIdString}x`
          );
          const data = await response.json();

          let productsWithoutImages1 = JSON.parse(data.body).results?.map(
            (listing) => {
              const { listing_id, title, url, num_favorers, views, price } =
                listing;
              let priceInUSD = convertToUSD(
                price.amount / price.divisor,
                price.currency_code
              );
              // console.log(title, views, num_favorers);
              return {
                listing_id,
                title,
                url,
                num_favorers,
                views,
                price: priceInUSD,
              };
            }
          );

          // let productsWithoutImages2 = productsWithoutImages1.map(
          //   async (listing) => {
          //     return new Promise((resolve) => {
          //       setTimeout(async () => {
          //         // countViews += product.views;
          //         // countFavorers += product.num_favorers;
          //         const response = await fetch(
          //           `/application/listings/${listing.listing_id}/images`
          //         );
          //         const imageData = await response.json();
          //         console.log("images: ", JSON.parse(imageData.body));
          //         resolve({
          //           ...listing,
          //           imageData: { ...JSON.parse(imageData.body) },
          //         });
          //       }, 250); // Delay of _ second
          //     });
          //   }
          // );

          // let productsWithoutImages2 = productsWithoutImages1?.map(
          //   async (listing) => {
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

          // let productsWithoutImages2 = productsWithoutImages1?.map(
          //   async (listing) => {
          //     await new Promise((resolve) => setTimeout(resolve, 1000));
          //     const response = await fetch(
          //       `/application/listings/${listing.listing_id}/images`
          //     );
          //     const imageData = await response.json();
          //     console.log("images: ", JSON.parse(imageData.body));
          //     return {
          //       ...listing,
          //       imageData: { ...JSON.parse(imageData.body) },
          //     };
          //   }
          // );

          Promise.all(productsWithoutImages1)
            .then((productsWithImages) => {
              setKeywordListingsData([...productsWithImages]);
              setDefaultKeywordListingsData([...productsWithImages]);
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

  // let setImages = (ListingPropertyValues) => {
  //   // console.log("1: ", ListingPropertyValues);
  //   // let fetchImagePromises = initialKeywordListingsData?.map(
  //   //   async (product) => {
  //   //     return new Promise((resolve) => {
  //   //       setTimeout(async () => {
  //   //         // countViews += product.views;
  //   //         // countFavorers += product.num_favorers;
  //   //         const response = await fetch(
  //   //           `/application/listings/${product.listing_id}/images`
  //   //         );
  //   //         const imageData = await response.json();
  //   //         // console.log("images: ", JSON.parse(imageData.body));
  //   //         resolve({
  //   //           ...product,
  //   //           imageData: { ...JSON.parse(imageData.body) },
  //   //         });
  //   //       }, 300); // Delay of _ second
  //   //     });
  //   //   }
  //   // );

  //   let fetchImagePromises = ListingPropertyValues?.map((product) => {
  //     fetch(`/application/listings/${product.listing_id}/images`)
  //       .then((response) => response.json())
  //       .then((imageData) => {
  //         return {
  //           ...product,
  //           imageData: { ...JSON.parse(imageData.body) },
  //         };
  //       });
  //   }); // Delay of _ second

  //   Promise.all(fetchImagePromises)
  //     .then((productsWithImages) => {
  //       setKeywordListingsData((prevState) => [...productsWithImages]);
  //       // console.log("data updated:", productsWithImages);
  //       setIsListingsLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // };

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
    setKeyword(event.target.value);
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


// suggested keywords code
const [keyword, setKeyword] = useState();
const [page, setPage] = useState(1);
const [fetchedData, setFetchedData] = useState(null); // Store the fetched data
  // const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

 
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/application/similarkeywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, page: 1, itemsPerPage: 10000 }), // Fetch all data
      });
      const data = await response.json();
      setFetchedData(data); // Store all the fetched data
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedSuggestedTags = fetchedData
    ? fetchedData.suggestedKeywords.slice(startIndex, endIndex)
    : [];
  const paginatedSearchVolumeData = {};
  const paginatedPowerData = {};

  if (fetchedData) {
    for (const suggestedTag of paginatedSuggestedTags) {
      paginatedSearchVolumeData[suggestedTag] = fetchedData.searchVolumeData[suggestedTag];
      paginatedPowerData[suggestedTag] = fetchedData.powerData[suggestedTag];
    }
  }
// suggestedkeywordscodeend












  return (
    <div className="keyword-finder body">
      {/* <img src="logo.png" alt="sellerkin logo" /> */}
      <Navbar page={2} />
      <main>
        <div className="top">
          <div className="search-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                findProducts();
                fetchData();
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
        <div id="header-1">
          <div className="title">
            <h2>
              <p>Keyword:</p> {fixedSearchTerm}
            </h2>
            {/* <span>O pin </span> */}
          </div>
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
        </div>
        <div>
          {section == "overview" && (
            <div className="content">
              <div className="primary-content">
                <h4>
                  Views{" "}
                  <p>
                    {(isOverviewLoading && <Loader />) ||
                      (keywordData?.views
                        ? convertNumber(keywordData?.views)
                        : "")}
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
                {/* <h4>
              Avg age{" "}
              <p>
                {(isOverviewLoading && <Loader />) ||
                (keywordData?.totalCreationTimestamp && keywordData?.totalCount)
                  ? getDaysSinceEpoch(
                      keywordData.totalCreationTimestamp /
                        keywordData.totalCount
                    )
                  : ""}{" "}
              </p>
            </h4> */}
                {/*<h4>
              Reviews{" "}
              <p>
                {(isOverviewLoading && <Loader />) ||
                  (reviewCount > 999
                    ? convertNumber(reviewCount)
                    : reviewCount)}
              </p>
            </h4> */}
                {/* <section className="listings">
          </section> */}
              </div>
{/*  */}
              <div className="App">
      <h1 id="tableHeading">Similar Keywords</h1>
     
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Table 
            data={{
              suggestedKeywords: paginatedSuggestedTags,
              searchVolumeData: paginatedSearchVolumeData,
              powerData: paginatedPowerData,
            }}
          />
          <div className="pagination">
            <button id="paginationButtonPrev" onClick={() => setPage(page - 1)} disabled={page === 1}>
            <AiFillCaretLeft/>
            </button>
            <span className="paginationText">{page}</span>
            <button id="paginationButtonNext" onClick={() => setPage(page + 1) } disabled={paginatedSuggestedTags.length < itemsPerPage}><AiFillCaretRight/></button>
          </div>
        </>
      )}
    </div>


{/*  */}








            </div>
          )}
        </div>
        {section == "listings" && (
          <div>
            {/* <section className="listings" id="listings-1">
              {isOverviewLoading ||
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
                ))}
            </section> */}

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
                                      ? product.imageData.results[0].alt_text
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
                            {product?.views ? convertNumber(product?.views) : 0}{" "}
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
          </div>
        )}
      </main>
    </div>
  );
};

export default KeywordFinder;
