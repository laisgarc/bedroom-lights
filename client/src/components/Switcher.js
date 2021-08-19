import React, { useState } from 'react'
import Switch from "react-switch";
import api from '../api.js'

const Switcher = () => {
    const [checked, setChecked] = useState(false);

    function handleChange (check) {
        if(checked){
            api.get('/turnOff')
        }else{
            api.get('/turnOn')
        }
        var actualState = checked
        setChecked(!actualState);
    }

    return (
        <div style={{display: "flex", justifyContent: "space-around", width: "20vw", alignItems: "center", marginBottom: "40px"}}>
            <p style={{display: "inline", marginBottom: "0"}}>Apagada</p>
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
            <p style={{display: "inline", marginBottom: "0"}}>Acesa</p>
        </div>
    )
  };

export default Switcher