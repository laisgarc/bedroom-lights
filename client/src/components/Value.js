import React from 'react'
import { Range, getTrackBackground } from 'react-range';
import { BsCircleHalf } from 'react-icons/bs';

const Value = (props) => {

    const MIN = 0
    const MAX = 1000

    var values = props.values

    return (
        <div style={{display: "flex", justifyContent: "space-around", width: "30vw", alignItems: "center", marginBottom: "40px"}}>
            <p style={{display: "inline", marginBottom: "0", marginRight: "5px"}}><BsCircleHalf /></p>
            <Range
                step={1}
                min={MIN}
                max={MAX}
                values={props.values}
                onChange={props.handleChange}
                renderTrack={({ props, children }) => (
                    <div
                        onMouseDown={props.onMouseDown}
                        onTouchStart={props.onTouchStart}
                        style={{
                        ...props.style,
                        height: '36px',
                        display: 'flex',
                        width: '200px'
                        }}
                    >
                        <div
                            ref={props.ref}
                            style={{
                                height: '5px',
                                width: '100%',
                                borderRadius: '4px',
                                background: getTrackBackground({
                                    values,
                                    colors: ['#86d3ff', '#888888'],
                                    min: MIN,
                                    max: MAX
                                  }),
                                alignSelf: 'center'
                              }}
                        >
                            {children}
                        </div>
                    </div>
                )}
                renderThumb={({ props, isDragged }) => (
                <div
                    {...props}
                    style={{
                        
                        height: '30px',
                        width: '30px',
                        borderRadius: '50%',
                        backgroundColor: isDragged ? '#2693e6' : '#ffff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 2px',
                        border: '0px none !important',
                        transition: 'background-color 0.25s ease 0s, box-shadow 0.15s ease 0s',
                        outline: 'currentcolor none 0px'
                    }}
                / > 
                )}
            />
            <p style={{display: "inline", marginBottom: "0", paddignLeft: "5px", width: "5vw"}}>{values[0]}</p>
        </div>
    )
  };

export default Value