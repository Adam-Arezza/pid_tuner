import React, { useEffect, useState } from "react";
import Graph from "./Graph";
import "../css/settings.css"
import { socket } from "../socket";

const Settings = (props) => {
    const [vel, setVel] = useState(0.0)
    const [port, setPort] = useState("")
    const [serialConnected, setSerialConnected] = useState(false)
    const [currentSettings, setCurrentSettings] = useState([])
    const [kp, setKp] = useState(0.0)
    const [ki, setKi] = useState(0.0)
    const [kd, setKd] = useState(0.0)

    const { portOptions } = props

    const startMotor = () => {
        socket.emit('startMotor')
    }

    const stopMotor = () => {
        socket.emit('stopMotor')
    }

    const updateValues = () => {
        socket.emit('updateVals', [vel,kp,ki,kd])
    }

    const selectPort = () => {
        socket.emit('selectPort', port, (res) => {
            setSerialConnected(res.connection)
        })
    }

    const serialDisConnect = () => {
        socket.emit('portDisconnect', (res) => {
            setSerialConnected(res.connection)
        })
    }

    useEffect(() => {
        socket.on('currentSettings', (settings) => {
            setCurrentSettings(settings.split(','))
        })

        return () => {
            socket.off('currentSettings')
        }
    }, [currentSettings])

    return (
        <div className="settings-container">
            {serialConnected ?
                <div className="status-indicator">
                    Serial Connection : connected
                    <button onClick={() => {
                        serialDisConnect()
                    }}>disconnect</button></div> :
                <div className="status-indicator">
                    <select onChange={(e) => setPort(e.target.value)}>
                        {portOptions.map((p, i) => <option key={i}>{p}</option>)}
                    </select>
                    <button onClick={() => selectPort()}>Connect</button>
                </div>}

            <div className="settings-section">
                <label htmlFor="SetPoint">SetPoint: </label>
                <input className="standard-input" name="SetPoint"
                    inputMode="numeric"
                    onChange={(e) => setVel(Number(e.target.value).toFixed(2))}
                    defaultValue={currentSettings.length > 0 ? Number(currentSettings[1]).toFixed(2) : null}
                    placeholder="0" />
            </div>

            <div className="pid-inputs">
                <label htmlFor="kpValue">KP: </label>
                <input name="kpValue"
                    inputMode="numeric"
                    onChange={(e) => setKp(Number(e.target.value).toFixed(2))}
                    defaultValue={currentSettings.length > 0 ? Number(currentSettings[2]).toFixed(2) : null}
                    placeholder="0" />
                <label htmlFor="kiValue">KI: </label>
                <input name="kiValue"
                    inputMode="numeric"
                    onChange={(e) => setKi(Number(e.target.value).toFixed(2))}
                    defaultValue={currentSettings.length > 0 ? Number(currentSettings[3]).toFixed(2) : null}
                    placeholder="0" />
                <label htmlFor="kdValue">KD: </label>
                <input name="kdValue"
                    inputMode="numeric"
                    onChange={(e) => setKd(Number(e.target.value).toFixed(2))}
                    defaultValue={currentSettings.length > 0 ? Number(currentSettings[4]).toFixed(2) : null}
                    placeholder="0" />
            </div>

            <div className="btn-group">
                <button onClick={() => startMotor()}>Start</button>
                <button onClick={() => stopMotor()}>Stop</button>
                <button onClick={() => updateValues()}>Update</button>
            </div>
            <Graph setPoint={vel}></Graph>
        </div>
    )
}

export default Settings