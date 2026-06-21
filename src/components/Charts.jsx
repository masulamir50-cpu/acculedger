// src/components/Charts.jsx — recharts asosidagi grafiklar (lazy-load uchun ajratilgan)
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { T, fmt, fmtN } from "../lib/shared.jsx";

const ttStyle = {
  background: "rgba(8,12,24,0.97)",
  border: "1px solid rgba(0,212,255,0.18)",
  borderRadius: 12,
  fontSize: 12,
  color: "#f0f4ff",
  boxShadow: "0 12px 36px rgba(0,0,0,0.7), 0 0 12px rgba(0,212,255,0.06)",
};
const ttLabelStyle = { color: "#c9a84c", fontWeight: 700 };
const axisStyle = { fill: "#6b7a99", fontSize: 11 };
const gridStyle = { strokeDasharray: "4 4", stroke: "rgba(255,255,255,0.06)" };

export function InventarPieChart({ pieData }) {
  if (pieData.length === 0) {
    return <div style={{textAlign:"center",padding:"30px 0",color:T.muted}}>Ma'lumot yo'q.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={pieData} dataKey="miqdor" nameKey="nom" cx="50%" cy="50%" outerRadius={85} innerRadius={40} paddingAngle={3}>
          {pieData.map(k=><Cell key={k.id} fill={k.color} stroke="transparent"/>)}
        </Pie>
        <Tooltip contentStyle={ttStyle} labelStyle={ttLabelStyle} formatter={(v,n)=>[`${fmtN(v)}`,n]}/>
        <Legend wrapperStyle={{fontSize:11,color:T.muted}} iconSize={8}/>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DaromadXarajatBarChart({ yillikData, valyuta }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
        <CartesianGrid {...gridStyle}/>
        <XAxis dataKey="oy" tick={axisStyle}/>
        <YAxis tick={axisStyle}/>
        <Tooltip contentStyle={ttStyle} labelStyle={ttLabelStyle} formatter={v=>`${fmt(v)} ${valyuta}`}/>
        <Legend wrapperStyle={{fontSize:11,color:T.muted}}/>
        <Bar dataKey="daromad" fill={T.accent} name="Daromad" radius={[4,4,0,0]}/>
        <Bar dataKey="xarajat" fill={T.danger} name="Xarajat" radius={[4,4,0,0]}/>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SofFoydaAreaChart({ yillikData, valyuta }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
        <defs>
          <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={T.accent} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid {...gridStyle}/>
        <XAxis dataKey="oy" tick={axisStyle}/>
        <YAxis tick={axisStyle}/>
        <Tooltip contentStyle={ttStyle} labelStyle={ttLabelStyle} formatter={v=>`${fmt(v)} ${valyuta}`}/>
        <Area type="monotone" dataKey="foyda" stroke={T.accent} fill="url(#grd)" strokeWidth={2.5} name="Sof foyda" dot={{r:3,fill:T.accent}}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function InventarLineChart({ yillikData }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
        <CartesianGrid {...gridStyle}/>
        <XAxis dataKey="oy" tick={axisStyle}/>
        <YAxis tick={axisStyle}/>
        <Tooltip contentStyle={ttStyle} labelStyle={ttLabelStyle}/>
        <Line type="monotone" dataKey="inventar" stroke={T.accent2} strokeWidth={2.5} dot={{r:3,fill:T.accent2}} name="Dona"/>
      </LineChart>
    </ResponsiveContainer>
  );
}
