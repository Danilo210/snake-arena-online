import express from 'express';
import {WebSocketServer} from 'ws';
import http from 'http';
const app=express();app.use(express.static('public'));const server=http.createServer(app);const wss=new WebSocketServer({server});
const SIZE=3200, players=new Map(), foods=[];let nextId=1;
const rand=(a,b)=>a+Math.random()*(b-a), colors=['#59e8ff','#ff67b3','#b0ff62','#ffce56','#ad8bff','#ff8063'];
function food(){return {id:nextId++,x:rand(30,SIZE-30),y:rand(30,SIZE-30),v:Math.random()<.15?3:1,c:colors[Math.floor(rand(0,colors.length))]}}
for(let i=0;i<430;i++)foods.push(food());
function spawn(ws,name){let id=nextId++,x=rand(200,SIZE-200),y=rand(200,SIZE-200),a=rand(-Math.PI,Math.PI);let p={id,name:String(name||'Jogador').slice(0,18),x,y,a,target:a,score:15,color:colors[Math.floor(rand(0,colors.length))],body:[],boost:false,ws,alive:true};for(let i=0;i<28;i++)p.body.push({x:x-Math.cos(a)*i*5,y:y-Math.sin(a)*i*5});players.set(id,p);return p}
function send(ws,obj){if(ws.readyState===1)ws.send(JSON.stringify(obj))}
wss.on('connection',ws=>{let p=null;ws.on('message',raw=>{if(raw.length>1000)return;try{let m=JSON.parse(raw);if(m.type==='join'){if(p)players.delete(p.id);p=spawn(ws,m.name);send(ws,{type:'welcome',id:p.id,size:SIZE})}if(m.type==='move'&&p){if(Number.isFinite(m.a))p.target=m.a;p.boost=!!m.boost}}catch{}});ws.on('close',()=>{if(p)players.delete(p.id)})});
function kill(p){if(!players.has(p.id))return;for(let i=0;i<p.body.length;i+=3){foods.push({id:nextId++,x:p.body[i].x,y:p.body[i].y,v:2,c:p.color})}players.delete(p.id);send(p.ws,{type:'dead',score:Math.floor(p.score)})}
setInterval(()=>{for(const p of [...players.values()]){let diff=Math.atan2(Math.sin(p.target-p.a),Math.cos(p.target-p.a));p.a+=Math.max(-.12,Math.min(.12,diff));let boosting=p.boost&&p.score>12;let speed=boosting?5.1:2.9;p.x+=Math.cos(p.a)*speed;p.y+=Math.sin(p.a)*speed;p.body.unshift({x:p.x,y:p.y});let max=Math.floor(25+p.score*1.4);while(p.body.length>max)p.body.pop();if(boosting){p.score-=.09;if(Math.random()<.2)foods.push({id:nextId++,x:p.body[p.body.length-1].x,y:p.body[p.body.length-1].y,v:1,c:p.color})}if(p.x<10||p.y<10||p.x>SIZE-10||p.y>SIZE-10){kill(p);continue}for(let i=foods.length-1;i>=0;i--){let f=foods[i];if((p.x-f.x)**2+(p.y-f.y)**2<260){p.score+=f.v;foods.splice(i,1)}}for(const q of players.values()){if(q.id===p.id)continue;for(let i=8;i<q.body.length;i+=3){let b=q.body[i];if((p.x-b.x)**2+(p.y-b.y)**2<190){kill(p);break}}if(!players.has(p.id))break}}while(foods.length<430)foods.push(food());if(foods.length>1400)foods.splice(0,foods.length-1400);
const snapshot={type:'state',players:[...players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,a:p.a,score:Math.floor(p.score),color:p.color,body:p.body.filter((_,i)=>i%2===0)})),foods};let data=JSON.stringify(snapshot);for(const c of wss.clients)if(c.readyState===1)c.send(data)
},50);
server.listen(process.env.PORT||3000,()=>console.log('Snake Arena em http://localhost:'+(process.env.PORT||3000)));
