import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import {UserDataContext} from "../context/userContext";
interface ProtectedProp{
    children:React.ReactNode;
    allowedRoles:("user"|"admin"|"sudoadmin")[];
    redirectTo?: string;  

}
const ProtectectedRoute=({children,allowedRoles,redirectTo = "/login"}:ProtectedProp)=>{

const context = useContext(UserDataContext);
if (!context) return null;
const { user,loading } = context;

if(loading){
    return <div>Loading...</div>
}

if(!user.role){
    return <Navigate to={redirectTo} />
}
if(allowedRoles.includes(user.role)){
return <>{children}</>
}
return <Navigate to="/login" />
}

export default ProtectectedRoute;