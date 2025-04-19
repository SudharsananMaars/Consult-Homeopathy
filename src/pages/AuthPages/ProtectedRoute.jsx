import { Navigate, useLocation } from "react-router-dom";
// import jwtDecode from "jwt-decode";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userType = decoded.user.userType;
    console.log("decoded",userType);
    console.log("allowed list",allowedRoles);
    console.log("allowed",allowedRoles.includes(userType));
    if (allowedRoles.includes(userType)) {
      return children;
    } else {
      return <Navigate to="/forbidden" replace />;
    }
  } catch (error) {
    return <Navigate to="/unauthorized" replace />;
  }
};

export default ProtectedRoute;
