import React, {useState} from 'react'
import { HsvColorPicker } from "react-colorful";
import Saturation from './Saturation';
import Value from './Value';

const ColorPicker = () => {
    const [color, setColor] = useState({ h: 0, s: 0, v: 100 });
    const [valuesat, setSaturation] = useState([500]);
    const [valueval, setValue] = useState([500]);

    const handleSat = (e) => {
        setSaturation(e)
        setColor(prevState => ({
            ...prevState,
            s: e[0]
        }));
    }

    const handleVal = (e) => {
        setValue(e)
        setColor(prevState => ({
            ...prevState,
            v: e[0]
        }));
    }

    return (
        <div style={{display: "flex", flexDirection: "column", width: "30vw", alignItems: "center"}}>
            <HsvColorPicker color={color} onChange={setColor} className="picker" />
            <Saturation values={valuesat} handleChange={handleSat}/>
            <Value values={valueval} handleChange={handleVal}/>
        </div>
    )
  };

export default ColorPicker