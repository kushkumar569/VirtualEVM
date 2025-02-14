import { useEffect, useRef } from "react";
import "./Glitch.css"; // Ensure to include your CSS here

const Ticker = () => {
  const wordRef = useRef(null); // Initialize as null
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()-_=+{}|[]\\;':\"<>?,./`~".split("");
  const cycleCount = 5;

  useEffect(() => {
    if (wordRef.current) {
      const letters = Array.from(wordRef.current.children); // Get the children of the wordRef
      
      let done = false;
      let cycleCurrent = 0;
      let letterCurrent = 0;

      const getChar = () => chars[Math.floor(Math.random() * chars.length)];

      const reset = () => {
        done = false;
        cycleCurrent = 0;
        letterCurrent = 0;

        letters.forEach((letter) => {
          letter.textContent = letter.getAttribute("data-orig"); // Restore the original text
          letter.classList.remove("done");
        });
        loop();
      };

      const loop = () => {
        // Iterate over each letter for animation
        letters.forEach((elem, index) => {
          if (index >= letterCurrent) {
            if (elem.textContent !== " ") {
              // Change text content to random character during animation
              elem.textContent = getChar();
              elem.style.opacity = Math.random() * 0.5 + 0.5;
            }
          }
        });

        if (cycleCurrent < cycleCount) {
          cycleCurrent++;
        } else if (letterCurrent < letters.length) {
          const currLetter = letters[letterCurrent];
          cycleCurrent = 0;

          // When the animation for this letter is complete, restore the original text
          currLetter.textContent = currLetter.getAttribute("data-orig");
          currLetter.style.opacity = 1;
          currLetter.classList.add("done");
          letterCurrent++;
        } else {
          done = true;
        }

        if (!done) {
          requestAnimationFrame(loop);
        } else {
          setTimeout(reset, 2000); // Reset after the animation
        }
      };

      loop(); // Start the loop

      return () => {
        done = true; // Clean up and stop the animation when the component unmounts
      };
    }
  }, [chars, cycleCount]);

  return (
    <div className="word" ref={wordRef}>
      {Array.from("Virtual EVM").map((char, index) => {
        return (
          <span key={index} data-orig={char}>
            {char}
          </span>
        );
      })}
    </div>
  );
};

const Glitch = () => {
  return (
    <div className="app-container">
      <Ticker />
      <div className="overlay"></div>
    </div>
  );
};

export default Glitch;