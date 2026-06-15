import axios from "axios";
import { createContext,useEffect,useState } from "react";

interface Media{
    media_id:number,
    filename:string,
    file_url:string
}

interface UsersData{
    id:number,
    email:string,
    role:'user'|'admin'|'sudoadmin'|null,
    user_name:string,
    media?:Media[]
}
interface UserContextData{
    user:UsersData;
    setUser:React.Dispatch<React.SetStateAction<UsersData>>;
    loading:boolean;
}
export const UserDataContext = createContext<UserContextData |null>(null);

const UserContext =({children}:{children:React.ReactNode})=>{

    const [user,setUser]=useState<UsersData>({
        id:0,
        email:"",
        role:null,
        user_name:"",
        media:[]
    })
    const [loading,setLoading]=useState(true);
    
    useEffect(()=>{
        const FetchUser=async ()=>{
            try{
            const getUser=await axios.get("http://localhost:3000/profile",{
                withCredentials:true
            })
            setUser(getUser.data.user)
            }catch(err){
                try{
                    await axios.post("http://localhost:3000/refresh-token",{},{
                        withCredentials:true
                    })
                    console.log("access token reseted")
                    const res=await axios.get("http://localhost:3000/profile",{
                        withCredentials:true
                    })
                    setUser(res.data.user);
                }catch(err){
                    console.error("Session Expires Please Login again",err)
                }
                console.log(err)
            }finally{
                setLoading(false)
            }
        }
        FetchUser();
       
    },[])
    return(
    <UserDataContext.Provider value={{user,setUser,loading}}>
        {children}
    </UserDataContext.Provider>)
    
}

export default UserContext