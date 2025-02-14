import axios from "axios";
import "./candidate.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Candidate() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarList, setAvatarList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [butn, setButn] = useState("Submit");
  const navigate = useNavigate();

  // Array of avatar image URLs (replace these with actual URLs or dynamically generate them)
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/logo/get-user-images`,
          { withCredentials: true }
        );
        setAvatarList(response.data.data); // Store the fetched avatars in state
      } catch (error) {
        console.error("Error fetching avatars:", error);
      }
    };
    fetchAvatars(); // Call the function
  }, [avatarList]);

  const filteredAvatarList = avatarList.filter((avatar) => {
    // console.log(avatar)
    return avatar.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Open modal
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const selectAvatar = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name,
      username,
      email,
      hashed_password: password,
      logo: selectedAvatar._id,
    };

    console.log(userData);

    try {
      setButn("Loading...");
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/candidates/register`,
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
        <h1 className="head">Candidate Registration</h1>
        <div className="line"></div>
        <div className="blocks">
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
          <div className="block">
            <label className="lebel">Email</label>
            <br />
            <input
              type="email"
              placeholder="Email"
              className="input"
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              placeholder="Password"
              className="input"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
          </div>
        </div>

        <div>
          <div className="choose-avatar-container">
            <button className="avatar-button" onClick={openModal}>
              Choose Avatar
            </button>

            {selectedAvatar && (
              <div id="selectedAvatarContainer">
                <img
                  src={selectedAvatar.image}
                  alt="Selected Avatar"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    border: "2px solid #007bff",
                    boxShadow: "10px 10px 14px 1px rgba(00, 00, 00, 0.4)",
                  }}
                />
              </div>
            )}
          </div>

          {modalVisible && (
            <div className="modal-overlay">
              <div className="modal-container1">
                <div className="stky">
                  <span onClick={closeModal} className="modal-close-button">
                    &times;
                  </span>
                  <h2 className="modal-title">Select an Avatar</h2>

                  {/* Search Box */}
                  <input
                    type="text"
                    placeholder="Search avatars..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="modal-container">
                  <div className="avatar-grid">
                    {filteredAvatarList.map((avatarUrl, index) => (
                      <div key={index} className="avatar-item">
                        <img
                          src={avatarUrl.image}
                          alt={`Avatar ${index + 1}`}
                          onClick={() => selectAvatar(avatarUrl)}
                          className="avatar-image"
                        />
                        <p className="avatar-name">{avatarUrl.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          {butn}
        </button>
        <p className="err">{error}</p>
        <br />
      </div>
    </>
  );
}

export default Candidate;
