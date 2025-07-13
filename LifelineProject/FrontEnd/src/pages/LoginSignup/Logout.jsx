import { useContext, useEffect } from "react"
import AuthContext from "../../context/AuthContext"
import useAxios from "../../utils/useAxios";


const Logout = () => {
    const axios = useAxios();
    const { logoutUser } = useContext(AuthContext);
    const waitForLogout = async () => {await logoutUser(axios);}
    useEffect(() => {
        waitForLogout();
    }, []);
}

export default Logout;