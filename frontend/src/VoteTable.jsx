import  { useEffect, useState } from "react";
import "./VoteTable.css";
import { useLocation } from "react-router-dom";
import axios from "axios";

const VoteTable = () => {
  // Preloaded data for 20 votes
  const [initialVotes, setInitialVotes] = useState([]);

  const location = useLocation();
  const block = location.state;

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_API_URL}/vote/get-votes`,
          { from: block.from, to: block.to },
          { withCredentials: true }
        );
        const votesList = response.data.data;

        const updatedList = await Promise.all(
          votesList.map(async (vote) => {
            const candidate = await axios.post(
              `${import.meta.env.VITE_REACT_APP_API_URL}/candidates/get-candidate`,
              { candidateId: vote.candidateId },
              { withCredentials: true }
            );

            const voter = await axios.post(
              `${import.meta.env.VITE_REACT_APP_API_URL}/users/get-user`,
              { voterId: vote.voterId },
              { withCredentials: true }
            );


            const time = getTime(vote.createdAt)

            return {
              voter: voter.data.data.publicHash,
              candidate: candidate.data.data.name,
              timestamp: time
            };
          })
        );

        setInitialVotes(updatedList)
      } catch (error) {
        console.error("Error fetching result:", error);
      }
    };

    fetchResult(); // Call the function
  }, [block]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter votes based on the search term
  const filteredVotes = initialVotes.filter((vote) =>
    vote.voter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTime = (timeline) => {
    const date = new Date(timeline);

    const formattedDate = `${String(date.getUTCDate()).padStart(
      2,
      "0"
    )}-${String(date.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}-${date.getUTCFullYear()} ${String(date.getUTCHours()).padStart(
      2,
      "0"
    )}-${String(date.getUTCMinutes()).padStart(2, "0")}-${String(
      date.getUTCSeconds()
    ).padStart(2, "0")}`;

    return formattedDate
  };

  return (
    <div className="box">
      <h1 className="head">Voting Records</h1>
      <div className="search-bar">
        <input
          type="text"
          className="input"
          placeholder="Search by Voter Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <hr className="line" />
      <div className="table-container">
        <table className="vote-table">
          <thead>
            <tr>
              <th>Voter</th>
              <th>Candidate</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredVotes.length > 0 ? (
              filteredVotes.map((vote, index) => (
                <tr key={index}>
                  <td>{vote.voter}</td>
                  <td>{vote.candidate}</td>
                  <td>{vote.timestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoteTable;
