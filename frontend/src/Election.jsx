import { useEffect, useState } from "react";
import "./Election.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Election() {
  const [buttons, setButtons] = useState([]);
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        // Fetch initial data
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/candidates/all-candidates`,
          { withCredentials: true }
        );

        const initialButtons = response.data.data;

        // Update logos asynchronously
        const updatedButtons = await Promise.all(
          initialButtons.map(async (button) => {
            const response2 = await axios.post(
              `${import.meta.env.VITE_REACT_APP_API_URL}/logo/get-image`,
              { logo: button.logo },
              { withCredentials: true }
            );
            return {
              ...button,
              logo: response2.data.data.image,
            };
          })
        );

        // Update state once with the processed data
        setButtons(updatedButtons);
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    };

    fetchAvatars(); // Call the function
  }, []); // Remove buttons from dependency array


  const handleClick = async (number) => {
    setActiveButton(number);
    try {
      const voter = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/users/current-user`,
          { withCredentials: true }
        );
      const candidate = buttons[number];

      const voteData = {
        candidateId : candidate._id,
        voterId : voter.data.data.voter2._id
      }

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/vote/voting`,
        voteData,
        { withCredentials: true }
      );

      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/users/logout`,
        {},
        { withCredentials: true }
      );

      navigate("/")
      
    } catch (error) {
      console.log("Error on voting ", error)
    }
    setTimeout(() => {
      setActiveButton(null); // Reset after a short time for a blinking effect
    }, 500);
  };

  return (
    <div className="evm-container">
      <div className="evm-header">
        <div className="indicator">
          <div className="indicator-light"></div>
          <span className="indicator-text">Ready</span>
        </div>
      </div>
      <div className="evm-body">
        <div className="number-column">
          {buttons.map((candidate, index) => (
            <div key={index} className="number-cell">
              {candidate.name}
              <div
                className={`led-light ${
                  activeButton === index ? "led-on" : ""
                }`}
              ></div>
            </div>
          ))}
        </div>
        <div className="button-column">
          {buttons.map((candidate, index) => (
            <button
              key={index}
              className="vote-button"
              onClick={() => handleClick(index)}
            >
              <img
                src={candidate.logo}
                alt="Selected Avatar"
                style={{
                  borderRadius: "50%",
                  width: "31px",
                  height: "31px",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Election;
