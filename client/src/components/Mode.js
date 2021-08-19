import React, { useState, useEffect } from 'react'
import Switch from "react-switch";
import api from '../api.js'

const Mode = () => {
    const [checked, setChecked] = useState(false);

    function handleChange(){
        var newState = !checked
        setChecked(newState)
    }

    useEffect(() => {
        if(!checked){
            api.get('/whiteMode')
        }else{
            api.get('/colorMode')
        }
    }, [checked])

    return (
        <div style={{display: "flex", justifyContent: "space-around", width: "20vw", alignItems: "center", marginBottom: "40px"}}>
            <p style={{display: "inline", marginBottom: "0"}}>Brancos</p>
            <Switch 
                onChange={handleChange}
                checked={checked}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 2px rgba(0, 0, 0, 0.2)"
                activeBoxShadow="0px 0px 1px 2px rgba(0, 0, 0, 0.2)"
                height={20}
                width={48}
            />
            <p style={{display: "inline", marginBottom: "0"}}>Cores</p>
        </div>
    )
  };

export default Mode