import React, { useState } from "react";
import "../styles/dropdownList.css";

const Level0Dropdown = ({
  data,
  selectedLevel0,
  selectedLevel1,
  handleLevel0Click,
  handleLevel1Click,
  selectedCategory,
}) => {
  const [showDropdownLevel0, setShowDropdownLevel0] = useState(false);
  const [dropdownLevel1Id, setDropdownLevel1Id] = useState(null);

  const toggleDropdownLevel0 = () => {
    setShowDropdownLevel0((prevState) => !prevState);
  };
  const toggleDropdownLevel1 = (id) => {
    setDropdownLevel1Id((prevState) => (prevState ? null : id));
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
          {selectedCategory.length > 0 ? selectedCategory : "All Categories"}
        </div>{" "}
      </div>
      {showDropdownLevel0 && (
        <div className="level0-dropdown-content">
          {data.results?.map((item) => (
            <div
              key={item.id}
              className={`dropdown-item ${
                selectedLevel0 === item.id ? "selected" : ""
              }`}
            >
              <div>
                <div
                  className="arrow-icon"
                  onClick={() => toggleDropdownLevel1(item.id)}
                >
                  {dropdownLevel1Id == item.id ? (
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
                <p
                  onClick={() => {
                    handleLevel0Click(item.id, item.name);
                    setShowDropdownLevel0(false);
                  }}
                >
                  {item.name}{" "}
                </p>
              </div>
              {item.id == dropdownLevel1Id && (
                <div className="level1-dropdown">
                  {data.results
                    ?.find((item) => item.id === dropdownLevel1Id)
                    ?.children.map((child) => (
                      <div
                        key={child.id}
                        className={`dropdown-item ${
                          selectedLevel1 === child.id ? "selected" : ""
                        }`}
                        onClick={() => {
                          handleLevel1Click(child.id, child.name);
                          setShowDropdownLevel0(false);
                        }}
                      >
                        <p>{child.name}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// const DropdownList = ({ data }) => {
//   const [selectedLevel0, setSelectedLevel0] = useState(null);
//   const [selectedLevel1, setSelectedLevel1] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   const handleLevel0Click = (id, itemName) => {
//     setSelectedLevel0(id);
//     setSelectedLevel1(null);
//     setSelectedCategory(itemName);
//     console.log("level 1: ", selectedLevel1);
//   };

//   const handleLevel1Click = (id, itemName) => {
//     setSelectedLevel0(null);
//     setSelectedLevel1(id);
//     setSelectedCategory(itemName);
//     console.log("level 0: ", selectedLevel0);
//   };

//   return (
//     <div className="dropdown-container">
//       <Level0Dropdown
//         data={data}
//         selectedLevel0={selectedLevel0}
//         selectedLevel1={selectedLevel1}
//         handleLevel0Click={handleLevel0Click}
//         handleLevel1Click={handleLevel1Click}
//         selectedCategory={selectedCategory}
//       />
//     </div>
//   );
// };

export default Level0Dropdown;
