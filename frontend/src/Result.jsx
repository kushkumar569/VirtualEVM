import { useEffect, useState } from "react";
import "./Result.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Result = () => {
  const [result, setResult] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Fetch initial data
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/candidates/all-candidates`,
          { withCredentials: true }
        );

        const candidates = response.data.data;

        // Update logos asynchronously
        const updatedResult = await Promise.all(
          candidates.map(async (candidate) => {
            const response = await axios.post(
              `${import.meta.env.VITE_REACT_APP_API_URL}/vote/count-votes`,
              { candidateId: candidate._id },
              { withCredentials: true }
            );

            return {
              name: candidate.name,
              votes: response.data.data,
            };
          })
        );

        const response2 = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/timelines/get-all-timeline`,
          { withCredentials: true }
        );

        // Update state once with the processed data
        setResult(updatedResult);
        setBlocks(response2.data.data);
      } catch (error) {
        console.error("Error fetching result:", error);
      }
    };

    fetchResult(); // Call the function
  }, []);

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

    return formattedDate;
  };

  const handleClick = async (block) => {
    navigate("/result_table", { state: block });
  };

  return (
    <div className="box">
      <div className="head">
        <h2>Voting Result</h2>
      </div>

      {/* Person Details */}
      <div className="persons-details">
        {result.map((candidate, index) => (
          <div key={index} className="person-detail">
            <div className="person-name">{candidate.name}</div>
            <div className="votes-count">{candidate.votes}</div>
          </div>
        ))}
        {/* Add more person details here */}
      </div>

      {/* Chain of blocks */}
      <div className="chain-container">
        <div className="chain">
          {blocks.map((block, index) => (
            <div key={index} className="block-and-chain">
              <div className="rounded-block" onClick={() => handleClick(block)}>
                <div className="hover-content">
                  <div>{"Id: " + block._id}</div>
                  <div>{"From: " + getTime(block.from)}</div>
                  <div>{"To: " + getTime(block.to)}</div>
                </div>
              </div>
              {index < blocks.length - 1 && <div className="link"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
