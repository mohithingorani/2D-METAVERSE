import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Redirect(){
    const navigate = useNavigate();


    useEffect(()=>{

        if(!localStorage.getItem("token")){
            navigate("/signup");
        }
        else{
            navigate("/game");
        }
    },[])
    return <></>
}