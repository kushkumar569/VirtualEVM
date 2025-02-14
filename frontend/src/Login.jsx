import { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [butn, setButn] = useState("Submit");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      email,
      username,
      hashed_password: password,
    };
    try {
      setButn("Loding...");
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/users/login`,
        userData,
        { withCredentials: true }
      );

      setError("");
      navigate("/election");
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
        <h1 className="head">Login</h1>
        <div className="line"></div>
        <div className="blocks">
          <div className="block">
            <label className="lebel">Username</label>
            <br />
            <input
              type="text"
              placeholder="Username"
              className="input"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <br />
          </div>
          <div className="block">
            <label className="lebel">Email</label>
            <br />
            <input
              type="email"
              placeholder="Email"
              className="input"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <br />
          </div>
          <div className="block">
            <label className="lebel">Password</label>
            <br />
            <input
              type="password"
              placeholder="Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
              required
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
