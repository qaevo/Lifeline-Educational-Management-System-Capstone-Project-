import { useContext } from "react";
import { Navigate } from "react-router-dom"
import AuthContext from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export const PrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);
    return auth.authTokens ? <>{children}</> : <Navigate to="/login" />
}

export const PrestudentPrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);

    if (auth.authTokens && localStorage.getItem("authTokens") !== null) {
        const decoded = jwtDecode(localStorage.getItem("authTokens"));
        if (decoded.role === "PRE-STUDENT" || decoded.role === "ADMIN") {
            return <>{children}</>
        }
    }
    return <Navigate to="/" />;
}

export const StudentPrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);

    if (auth.authTokens && localStorage.getItem("authTokens") !== null) {
        const decoded = jwtDecode(localStorage.getItem("authTokens"));
        if (decoded.role === "STUDENT" || decoded.role === "ADMIN") {
            return <>{children}</>
        }
    }
    return <Navigate to="/" />;
}

export const FacultyPrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);

    if (auth.authTokens && localStorage.getItem("authTokens") !== null) {
        const decoded = jwtDecode(localStorage.getItem("authTokens"));
        if (decoded.role === "FACULTY" || decoded.role === "ADMIN") {
            return <>{children}</>
        }
    }
    return <Navigate to="/" />;
}

export const CashierPrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);

    if (auth.authTokens && localStorage.getItem("authTokens") !== null) {
        const decoded = jwtDecode(localStorage.getItem("authTokens"));
        if (decoded.role === "CASHIER" || decoded.role === "ADMIN") {
            return <>{children}</>
        }
    }
    return <Navigate to="/" />;
}

export const BranchManagerPrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);

    if (auth.authTokens && localStorage.getItem("authTokens") !== null) {
        const decoded = jwtDecode(localStorage.getItem("authTokens"));
        if (decoded.role === "BRANCH_MANAGER" || decoded.role === "ADMIN") {
            return <>{children}</>
        }
    }
    return <Navigate to="/" />;
}

export const SupervisorPrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);

    if (auth.authTokens && localStorage.getItem("authTokens") !== null) {
        const decoded = jwtDecode(localStorage.getItem("authTokens"));
        if (decoded.role === "SUPERVISOR" || decoded.role === "ADMIN") {
            return <>{children}</>
        }
    }
    return <Navigate to="/" />;
}

export default PrivateRoute;