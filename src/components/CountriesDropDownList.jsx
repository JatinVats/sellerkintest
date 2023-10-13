import React, { useState } from "react";
import "../styles/dropdownList.css";

const CountriesDropDownList = ({
  data,
  selectedCountry,
  handleCountryClick,
}) => {
  const [showDropdownLevel0, setShowDropdownLevel0] = useState(false);

  const toggleDropdownLevel0 = () => {
    setShowDropdownLevel0((prevState) => !prevState);
  };

  //   data.results?.find((item) => item.id === selectedLevel0).name

  return (
    <div className="dropdown level0-dropdown">
      <div className="dropdown-item">
        <div>
          <div className="arrow-icon" onClick={toggleDropdownLevel0}>
            {showDropdownLevel0 ? (
              <svg
                width="30"
                height="16"
                viewBox="0 0 30 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 15L13.9827 1.71537C14.3688 1.32031 15.0021 1.31312 15.397 1.6993L29 15"
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
              >
                <path
                  d="M29 1L16.0173 14.2846C15.6312 14.6797 14.9979 14.6869 14.603 14.3007L0.999999 1"
                  stroke="#2C2C2C"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            )}
          </div>
          {selectedCountry.length > 0 ? selectedCountry : "All Countries"}
        </div>{" "}
      </div>
      {showDropdownLevel0 && (
        <div className="level0-dropdown-content">
          {data?.map((country) => (
            <div
              key={country.name}
              className={`dropdown-item ${
                selectedCountry === country.name ? "selected" : ""
              }`}
            >
              <div>
                <p
                  onClick={() => {
                    handleCountryClick(country.name);
                    setShowDropdownLevel0(false);
                  }}
                >
                  {country.name}{" "}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountriesDropDownList;
