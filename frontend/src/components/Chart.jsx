import React, { useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts';

const Chart = ({riskFree, efficientFrontier}) => {

    const typedData = useMemo(() => {
        // turn into a working array with index
        const arr = efficientFrontier.map((row, idx) => ({
        index: idx,
        risk: row.Risk,
        return: row.Return
        }))
        // sort by risk ascending
        arr.sort((a, b) => a.risk - b.risk);

        // find global min-risk
        const minRiskValue = arr[0].risk;

        // walk to find the Pareto‐efficient (envelope)
        let maxRetSoFar = -Infinity;
        return arr.map(d => {
        let type;
        if (d.risk === minRiskValue) {
            type = 'minRisk';
        } else if (d.return >= maxRetSoFar) {
            type = 'efficient';
            maxRetSoFar = d.return;
        } else {
            type = 'dominated';
        }
        return { ...d, type };
        });
    }, [efficientFrontier]);

    const minRiskPoints = typedData.filter(d => d.type === 'minRisk');
    const efficientPts = typedData.filter(d => d.type === 'efficient');
    const dominatedPts = typedData.filter(d => d.type == 'dominated');


    return (
        <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
                margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
            >
                <CartesianGrid />
                <XAxis
                dataKey="risk"
                name="Risk"
                type="number"
                domain={["dataMin", "dataMax"]}
                label={{ value: "Risk (σ)", position: "bottom"}}
                tickFormatter={v => (v * 100).toFixed(1) + "%"}
                />
                <YAxis
                dataKey="return"
                name="Return"
                type="number"
                domain={["dataMin", "dataMax"]}
                label={{ value: "Return", angle: -90, position: "insideLeft" }}
                tickFormatter={v => (v * 100).toFixed(1) + "%"}
                />
                <Tooltip 
                formatter={(val, name) => [(val*100).toFixed(2)+"%", name]} 
                cursor={{ strokeDasharray: "3 3" }} 
                />
                <Legend verticalAlign="top" height={36} />

                {/* 3) Horizontal line at the risk-free rate */}
                <ReferenceLine
                y={riskFree}
                stroke="red"
                strokeDasharray="3 3"
                label={{ position: 'right', value: 'RF' }}
                />


                {/* 4) The Dominated Frontier itself */}
                <Scatter
                name="Dominated Frontier"
                data={dominatedPts}
                fill="#8884d8"
                line={{ stroke: '#8884d8', strokeWidth: 2 }}
                shape="circle"
                />

                {/* 5) The Efficient Frontier itself */}
                <Scatter
                name="Efficient Frontier"
                data={efficientPts}
                fill="orange"
                line={{ stroke: 'orange', strokeWidth: 2 }}
                shape="circle"
                />

                {/* 6) Highlighted portfolio */}
                <Scatter
                    name="Selected Portfolio"
                    data={minRiskPoints}
                    fill="red"
                    shape="star"
                    line={false}
                />
            </ScatterChart>
        </ResponsiveContainer>
    )
}

export default Chart
