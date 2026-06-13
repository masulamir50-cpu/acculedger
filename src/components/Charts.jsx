// src/components/Charts.jsx — recharts asosidagi grafiklar (lazy-load uchun ajratilgan)
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { T, fmt, fmtN } from "../lib/shared.jsx";

export function InventarPieChart({ pieData }) {
  if (pieData.length === 0) {
    return <div style={{textAlign:"center",padding:"30px 0",color:T.muted}}>Ma'lumot yo'q.</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={pieData} dataKey="miqdor" nameKey="nom" cx="50%" cy="50%" outerRadius={85} innerRadius={35} paddingAngle={2}>
          {pieData.map(k=><Cell key={k.id} fill={k.color}/>)}
        </Pie>
        <Tooltip formatter={(v,n)=>[`${fmtN(v)}`,n]}/>
        <Legend wrapperStyle={{fontSize:11}} iconSize={10}/>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DaromadXarajatBarChart({ yillikData, valyuta }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
        <XAxis dataKey="oy" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}}/>
        <Tooltip formatter={v=>`${fmt(v)} ${valyuta}`}/><Legend wrapperStyle={{fontSize:11}}/>
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
            <stop offset="5%" stopColor={T.accent} stopOpacity={0.25}/>
            <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
        <XAxis dataKey="oy" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
        <Tooltip formatter={v=>`${fmt(v)} ${valyuta}`}/>
        <Area type="monotone" dataKey="foyda" stroke={T.accent} fill="url(#grd)" strokeWidth={2} name="Sof foyda" dot={{r:3}}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function InventarLineChart({ yillikData }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={yillikData} margin={{top:4,right:12,left:0,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
        <XAxis dataKey="oy" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}}/>
        <Tooltip/><Line type="monotone" dataKey="inventar" stroke={T.accent2} strokeWidth={2} dot={{r:3}} name="Dona"/>
      </LineChart>
    </ResponsiveContainer>
  );
}
