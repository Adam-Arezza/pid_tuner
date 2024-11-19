import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, Label } from 'recharts'
import { socket } from "../socket";
import '../css/graph.css'

const Graph = (props) => {
    const [signalData, setSignalData] = useState([])

    const { setPoint } = props

    useEffect(() => {
        socket.on('signalData', (data) => {

            const updateData = [...signalData]
            if (updateData.length >= 500) {
                updateData.shift()
            }
            updateData.push({ ...data, setPoint })
            setSignalData(updateData)

        })
        return () => {
            socket.off('signalData')
        }
    }, [setPoint, signalData])

    return (
        <div className="graph-container">
            <button onClick={() => setSignalData([])}>Clear</button>
            <LineChart className="line-graph" width={window.innerWidth * 0.85} height={600} data={signalData}>
                <XAxis
                    dataKey="time"
                    tick={{ fontSize: 15 }}
                    tickCount={10}
                    >
                    <Label value="Seconds" position="insideBottom" offset={-5} />
                </XAxis>
                <YAxis
                    dataKey="signal_1"
                    label={{ value: "m/s", position: "insideLeft", offset: 0, angle:-90}}
                    tick={{ fontSize: 15 }}
                    tickCount={15}
                    domain={[0, 1.5*setPoint]} />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Line type="monotone" dataKey="signal_1" stroke="#a231e8" />
                <Line type="monotone" dataKey="setPoint" stroke="#20ca9d" />
            </LineChart>
        </div>

    )
}

export default Graph