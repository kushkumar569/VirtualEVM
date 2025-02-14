/* eslint-disable no-unused-vars */
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import img from "./glitch.gif";
import { useEffect } from "react";
import axios from "axios";

function HomePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [candidateCheck, setCandidateCheck] = useState(false);
  const [voterCheck, setVoterCheck] = useState(false);
  const [votingDisabled, setVotingDisabled] = useState(true);
  const [candidateDisabled, setCandidateDisabled] = useState(true);
  const [voterDisabled, setVoterDisabled] = useState(true);
  const [btn, setBtn] = useState("Start Election");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function candidate() {
    if (candidateDisabled) {
      setShowPopup(true);
      setMessage("The voting period is yet to start.");
    } else if (candidateCheck) {
      setShowPopup(true);
      setMessage("Candidate registration is completed.");
    } else navigate("/candidate");
  }

  function voter() {
    if (candidateDisabled) {
      setShowPopup(true);
      setMessage("The voting period is yet to start.");
    } else if (voterDisabled) {
      setShowPopup(true);
      setMessage("The voter registration period is yet to start.");
    } else if (voterCheck) {
      setShowPopup(true);
      setMessage("Voter registration is completed.");
    } else navigate("/voter");
  }

  function Election() {
    if (candidateDisabled) {
      setShowPopup(true);
      setMessage("The voting period is yet to start.");
    } else if (voterDisabled) {
      setShowPopup(true);
      setMessage("The voter registration period is yet to start.");
    } else if (votingDisabled) {
      setShowPopup(true);
      setMessage("Voting is yet to start.");
    } else {
      if (btn === "Start Election") navigate("/voter-login");
      else if (btn === "Result") navigate("/result");
    }
  }

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    const fetchVotingTimeline = async () => {
      try {
        const votingTimeline = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/voting/get-voting-timeline`,
          { withCredentials: true }
        );
        const votingTime = votingTimeline.data.data;
        const currentDate = new Date(
          new Date().toISOString().replace("Z", "+00:00")
        );
        if (
          currentDate.getTime() <
          new Date(votingTime.candidateRegistrationStart).getTime()
        ) {
          setCandidateCheck(false);
          setVoterCheck(false);
          setVotingDisabled(true);
          setCandidateDisabled(true);
          setVoterDisabled(true);
        } else if (
          currentDate.getTime() <
          new Date(votingTime.voterRegistrationStart).getTime()
        ) {
          setCandidateDisabled(false);
        } else if (
          currentDate.getTime() < new Date(votingTime.votingStart).getTime()
        ) {
          setCandidateDisabled(false);
          setVoterDisabled(false);
          setCandidateCheck(true);
        } else if (
          currentDate.getTime() < new Date(votingTime.votingEnd).getTime()
        ) {
          setCandidateDisabled(false);
          setVoterDisabled(false);
          setCandidateCheck(true);
          setVotingDisabled(false);
          setVoterCheck(true);
        } else {
          setCandidateDisabled(false);
          setVoterDisabled(false);
          setCandidateCheck(true);
          setVotingDisabled(false);
          setVoterCheck(true);
          setBtn("Result");
        }

        console.log(new Date().toISOString().replace("Z", "+00:00"));
      } catch (error) {
        console.error("Error fetching voting timeline:", error);
      }
    };
    // Call the function
    fetchVotingTimeline();
  }, []);

  return (
    <>
      <img className="img" src={img} />
      <div className="main">
        <button onClick={candidate} className="candidate">
          candidate Registration
          <div className="checkbox-wrapper-31">
            <input type="checkbox" title="title" checked={candidateCheck} />
            <svg viewBox="0 0 35.6 35.6">
              <circle
                className="background"
                cx="17.8"
                cy="17.8"
                r="17.8"
              ></circle>
              <circle className="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
              <polyline
                className="check"
                points="11.78 18.12 15.55 22.23 25.17 12.87"
              ></polyline>
            </svg>
          </div>
        </button>
        <button onClick={voter} className="candidate">
          Generate VoterID
          <div className="checkbox-wrapper-31">
            <input type="checkbox" title="title" checked={voterCheck} />
            <svg viewBox="0 0 35.6 35.6">
              <circle
                className="background"
                cx="17.8"
                cy="17.8"
                r="17.8"
              ></circle>
              <circle className="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
              <polyline
                className="check"
                points="11.78 18.12 15.55 22.23 25.17 12.87"
              ></polyline>
            </svg>
          </div>
        </button>
      </div>
      <div>
        <button
          className="candidate"
          onClick={Election}
        >
          {btn}
        </button>
      </div>

      <div className="container">
        {showPopup && (
          <div className="popup">
            <div className="popup-content">
              <p>{message}</p>
              <button className="cancel-btn" onClick={handleClosePopup}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
