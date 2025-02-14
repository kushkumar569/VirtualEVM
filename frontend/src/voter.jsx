import { useState } from "react";
import "./voter.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Voter() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [butn, setButn] = useState("Submit");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name,
      username,
      email,
      hashed_password: password,
    };

    try {
      setButn("Loading...");
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/users/register`,
        userData
      );
      setError("");
      navigate("/");
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(errorMessage, "text/html");
        const extractedMessage = doc
          .querySelector("pre")
          .innerText.split("at")[0];
        setError(extractedMessage.slice(7));
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setButn("Submit");
    }
  };

  return (
    <>
      <div className="box">
        <h1 className="head">Generate VoterID</h1>
        <div className="line"></div>
        <div className="blocks">
          <div className="block">
            <label className="lebel">Email</label>
            <br />
            <input
              type="text"
              placeholder="Email"
              className="input"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <br />
          </div>
          <div className="block">
            <label className="lebel">UserName</label>
            <br />
            <input
              type="text"
              placeholder="UserName"
              className="input"
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
          </div>
          <div className="block">
            <label className="lebel">Password</label>
            <br />
            <input
              type="text"
              placeholder="Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
          </div>
          <div className="block">
            <label className="lebel">Name</label>
            <br />
            <input
              type="text"
              placeholder="Name"
              className="input"
              onChange={(e) => setName(e.target.value)}
            />
            <br />
          </div>
        </div>
        <button className="btn" onClick={handleSubmit}>
          {butn}
        </button>
        <p className="err">{error}</p>
      </div>
    </>
  );
}

export default Voter;
