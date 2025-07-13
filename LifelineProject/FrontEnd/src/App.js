import './App.css';
import AboutUs from './pages/Landing/AboutUs';
import LandingPage from './pages/Landing/LandingPage';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import Logout from './pages/LoginSignup/Logout';
import Register from './pages/Register/Register';
import PreStudentDashboard from './pages/Extras/preStudentDashboard';
import StudentDash from './pages/Student/StudentDash';
import StudentEnroll from './pages/Student/StudentEnroll';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext"
import { PrestudentPrivateRoute, StudentPrivateRoute, FacultyPrivateRoute, CashierPrivateRoute, BranchManagerPrivateRoute, SupervisorPrivateRoute } from "./utils/PrivateRoute"
import Faculty from './pages/Faculty/Faculty';
import FacultyProfile from './pages/Extras/FacultyProfile';
import Cashier from './pages/Cashier/Cashier';
import BranchManager from './pages/BranchManager/BranchManager';
import AnnounceCreator from './pages/BranchManager/AnnounceCreator';
import ViewDetails from './pages/Extras/ViewDetails';
import AddClass from './pages/Extras/AddClass';
import ViewStudents from './pages/Faculty/viewStudents';
import StudentProto from './pages/Extras/StudentProto';
import FacultyProto from './pages/Extras/FacultyProto';
import Reports from './pages/BranchManager/Reports';
import CreateModule from './pages/BranchManager/CreateModule';
import CreateProgram from './pages/BranchManager/CreateProgram';
import CreateClass from './pages/BranchManager/CreateClass';
import ManageInstructors from './pages/BranchManager/ManageInstructors';
import ManageSchedule from './pages/BranchManager/ManageSchedule';
import MatchingModule from './pages/BranchManager/MatchingModule';
import ViewAnnouncement from './pages/BranchManager/ViewAnnouncement';
import Supervisor from './pages/Supervisor/Supervisor';
import SReports from './pages/Supervisor/SReports';
import Insights from './pages/Supervisor/Insights';


//test page for testing components
import TestPage from './pages/Extras/TestPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/*General/Public Routes*/}
          <Route path="/*" element={<LandingPage />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/aboutus" element={<AboutUs />} />

          {/*Cashier Routes*/}
          <Route path="/cashier" element={<CashierPrivateRoute><Cashier /></CashierPrivateRoute>} />

          {/*Student Routes*/}
          <Route path="/student" element={<StudentPrivateRoute><StudentDash /></StudentPrivateRoute>} />
          <Route path="/studentEnroll" element={<StudentPrivateRoute><StudentEnroll /></StudentPrivateRoute>} />


          {/*Faculty Routes*/}
          <Route path="/Faculty" element={<FacultyPrivateRoute><Faculty /></FacultyPrivateRoute>} />
          <Route path="/ViewStudents/:courseID/:courseName" element={<FacultyPrivateRoute><ViewStudents /></FacultyPrivateRoute>} />
        


          {/*Branch Manager Routes*/}
          <Route path="/ViewDetails" element={<BranchManagerPrivateRoute><ViewDetails /></BranchManagerPrivateRoute>} />
          <Route path="/BranchManager" element={<BranchManagerPrivateRoute><BranchManager /></BranchManagerPrivateRoute>} />
          <Route path="/CreateModule" element={<BranchManagerPrivateRoute><CreateModule /> </BranchManagerPrivateRoute>} />
          <Route path="/CreateProgram" element={<BranchManagerPrivateRoute><CreateProgram /></BranchManagerPrivateRoute>} />
          <Route path="/CreateClass" element={<BranchManagerPrivateRoute><CreateClass /></BranchManagerPrivateRoute>} />
          <Route path="/ManageInstructors" element={<BranchManagerPrivateRoute><ManageInstructors /></BranchManagerPrivateRoute>} />
          <Route path="/ManageSchedule" element={<BranchManagerPrivateRoute><ManageSchedule /></BranchManagerPrivateRoute>} />
          <Route path="/Reports" element={<BranchManagerPrivateRoute><Reports /></BranchManagerPrivateRoute>} />
          <Route path="/Matching" element={<MatchingModule />} />
          <Route path="/CreateAn" element={<BranchManagerPrivateRoute><AnnounceCreator /></BranchManagerPrivateRoute>} />
          <Route path="/ViewAn" element={<BranchManagerPrivateRoute><ViewAnnouncement /></BranchManagerPrivateRoute>} />
          


          {/*Super Admin Routes*/}
          <Route path="/supervisor" element={<SupervisorPrivateRoute><Supervisor /></SupervisorPrivateRoute>} />
          <Route path="/SReports" element={<SupervisorPrivateRoute><SReports /></SupervisorPrivateRoute>} />
          <Route path="/Insights" element={<SupervisorPrivateRoute><Insights /></SupervisorPrivateRoute>} />

          {/*Test Pages and Unused*/}
          <Route path="/test" element={<TestPage />} />
          <Route path="/FacultyProto" element={<FacultyProto />} />
          <Route path="/studentproto" element={<StudentProto />} />
          <Route path="/addClass" element={<FacultyPrivateRoute><AddClass /></FacultyPrivateRoute>} />
          <Route path="/faculty/user" element={<FacultyPrivateRoute><FacultyProfile /></FacultyPrivateRoute>} />
          <Route path="/prestudentdashboard" element={<PrestudentPrivateRoute><PreStudentDashboard /></PrestudentPrivateRoute>} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
