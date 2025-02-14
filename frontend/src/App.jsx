import {BrowserRouter as Router,Route,Routes} from 'react-router-dom';
import './App.css'
import Voter from './voter.jsx'
import Candidate from './Candidate.jsx'
import FrontPage from './FrontPage.jsx'
import Election from './Election.jsx';
import Login from './Login.jsx';
import Result from './Result.jsx';
import VoteTable from './VoteTable.jsx';

function App() {

  return (
    <Router>
      <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/voter" element={<Voter />} />
          <Route path="/candidate" element={<Candidate/>} />
          <Route path= "/election" element={<Election/>}/>
          <Route path= "/voter-login" element={<Login/>}/>
          <Route path= "/result" element={<Result/>}/>
          <Route path= "/result_table" element={<VoteTable/>}/>
      </Routes>
    </Router>
  )
}

export default App
